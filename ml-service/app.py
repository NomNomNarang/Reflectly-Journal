from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn.functional as F
import numpy as np
from transformers import RobertaTokenizer, AutoModelForSequenceClassification
import os
import logging
import joblib
from nrclex import NRCLex

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Reflectly ML Service", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = "./emotion_model"   # folder containing all your new model files
INFERENCE_CFG = os.path.join(MODEL_DIR, "inference_config.json")

# Load inference config so all thresholds/weights come from one source of truth
import json
with open(INFERENCE_CFG) as _f:
    _cfg = json.load(_f)

MAX_LEN           = _cfg.get("max_length", 128)
LEXICON_WEIGHT    = _cfg.get("lexicon_weight", 0.3)
CONF_THRESHOLD    = _cfg.get("confidence_threshold", 0.5)
TEMPERATURE_INIT  = _cfg.get("temperature", 1.0)   # 1.623352 from your config

tokenizer = None
model = None
label_mapping = {}
temp_model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ─────────────────────────────────────────
# LOAD LABELS
# ─────────────────────────────────────────
def load_labels():
    le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
    return {i: cls.lower() for i, cls in enumerate(le.classes_)}


# ─────────────────────────────────────────
# TEMPERATURE SCALING
# ─────────────────────────────────────────
class TemperatureScaling(torch.nn.Module):
    def __init__(self, temperature: float = 1.0):
        super().__init__()
        # Initialise with the calibrated value from inference_config.json
        # so even before loading the .pt weights the model is already correct
        self.temperature = torch.nn.Parameter(torch.tensor([temperature]))

    def forward(self, logits):
        return logits / self.temperature.clamp(min=1e-6)


# ─────────────────────────────────────────
# NRCLEX
# ─────────────────────────────────────────
NRC_MAP = {
    'joy': 'joy',
    'sadness': 'sadness',
    'anger': 'anger',
    'fear': 'fear',
    'surprise': 'surprise',
    'love': 'love',
    'trust': 'joy',
    'anticipation': 'surprise',
    'disgust': 'anger'
}


def get_nrclex_vec(text):
    try:
        nrc = NRCLex(text)
        scores = nrc.raw_emotion_scores
    except:
        return None

    vec = np.zeros(len(label_mapping))

    for emotion, score in scores.items():
        mapped = NRC_MAP.get(emotion)
        if mapped in label_mapping.values():
            idx = list(label_mapping.values()).index(mapped)
            vec[idx] += score

    if vec.sum() > 0:
        return vec / vec.sum()

    return None


# ─────────────────────────────────────────
# RULE-BASED FIX
# ─────────────────────────────────────────
def rule_based(text):
    simple_map = {
        "happy": "joy",
        "sad": "sadness",
        "angry": "anger",
        "fear": "fear",
    }

    for word, emo in simple_map.items():
        if word in text:
            return emo

    return None


# ─────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────
@app.on_event("startup")
def load_all():
    global tokenizer, model, label_mapping, temp_model

    # Use RobertaTokenizer explicitly — matches tokenizer_class in tokenizer_config.json
    tokenizer = RobertaTokenizer.from_pretrained(MODEL_DIR)

    model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
    model.to(device)
    model.eval()

    label_mapping = load_labels()

    # Initialise temperature with the calibrated value from inference_config.json
    # This ensures correct calibration even if the .pt file fails to load
    temp_model = TemperatureScaling(temperature=TEMPERATURE_INIT).to(device)
    temp_path = os.path.join(MODEL_DIR, "temperature_model.pt")
    if os.path.exists(temp_path):
        temp_model.load_state_dict(
            torch.load(temp_path, map_location=device),
            strict=False   # safe: only updates keys that exist
        )
        temp_model.eval()
        logger.info(f"✅ Temperature model loaded — T={temp_model.temperature.item():.4f}")
    else:
        logger.warning(f"⚠️  temperature_model.pt not found — using T={TEMPERATURE_INIT} from config")

    logger.info(f"✅ Full hybrid model loaded | labels: {label_mapping}")


# ─────────────────────────────────────────
# SCHEMA
# ─────────────────────────────────────────
class PredictRequest(BaseModel):
    text: str


class EmotionResult(BaseModel):
    emotion: str
    raw_emotion: str
    confidence: float
    top3: list
    uncertainty: str


# ─────────────────────────────────────────
# MAIN PREDICTION
# ─────────────────────────────────────────
@app.post("/predict", response_model=EmotionResult)
def predict(req: PredictRequest):

    text = req.text.strip().lower()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")

    # 🔥 RULE BASED (short text)
    if len(text.split()) <= 4:
        rule = rule_based(text)
        if rule:
            return EmotionResult(
                emotion=rule.capitalize(),
                raw_emotion=rule,
                confidence=0.95,
                top3=[],
                uncertainty="low"
            )

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=MAX_LEN
    ).to(device)

    with torch.no_grad():
        logits = model(**inputs).logits
        logits = temp_model(logits)
        probs = F.softmax(logits, dim=1)

    probs_np = probs.cpu().numpy()[0]
    pred_index = int(np.argmax(probs_np))
    confidence = float(np.max(probs_np))

    raw_emotion = label_mapping[pred_index]

    # NRCLex fusion — only when model confidence is below the configured threshold
    if confidence < CONF_THRESHOLD:
        lex_vec = get_nrclex_vec(text)
        if lex_vec is not None:
            blended = (1 - LEXICON_WEIGHT) * probs_np + LEXICON_WEIGHT * lex_vec
            pred_index = int(np.argmax(blended))
            raw_emotion = label_mapping[pred_index]
            confidence = float(np.max(blended))

    # UI mapping
    EMOTION_TO_UI = {
        "joy": "Happy",
        "sadness": "Sad",
        "fear": "Anxious",
        "anger": "Angry",
        "love": "Love",
        "surprise": "Surprise",
    }

    ui_emotion = EMOTION_TO_UI.get(raw_emotion, "Calm")

    # top 3
    top3_idx = probs_np.argsort()[-3:][::-1]
    top3 = [
        {
            "emotion": EMOTION_TO_UI.get(label_mapping[i], "Calm"),
            "raw": label_mapping[i],
            "confidence": round(float(probs_np[i]), 4)
        }
        for i in top3_idx
    ]

    # uncertainty
    if confidence >= 0.8:
        uncertainty = "low"
    elif confidence >= 0.6:
        uncertainty = "moderate"
    else:
        uncertainty = "high"

    return EmotionResult(
        emotion=ui_emotion,
        raw_emotion=raw_emotion,
        confidence=round(confidence, 4),
        top3=top3,
        uncertainty=uncertainty
    )


# ─────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "labels": label_mapping
    }


# ─────────────────────────────────────────
# RUN
# ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)