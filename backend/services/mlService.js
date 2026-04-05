const axios = require('axios');

// ─────────────────────────────────────────
// 🔥 ML API URL
// ─────────────────────────────────────────
// ✅ FIXED: base URL stored separately so it can also be used for /health checks
const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const ML_PREDICT_URL = `${ML_BASE_URL}/predict`;

// ─────────────────────────────────────────
// 🔥 VALID EMOTIONS
// ─────────────────────────────────────────
// ✅ MATCHES: inference_config.json labels + 'uncertain' fallback
const VALID_RAW_EMOTIONS = [
  'anger',
  'fear',
  'joy',
  'love',
  'sadness',
  'surprise',
  'uncertain',
];

// ─────────────────────────────────────────
// 🔥 UNCERTAINTY LEVELS
// ─────────────────────────────────────────
// ✅ NEW: validate uncertainty field coming from new model
const VALID_UNCERTAINTY_LEVELS = ['low', 'moderate', 'high'];

// ─────────────────────────────────────────
// 🔥 MAIN: analyzeEmotion
// ─────────────────────────────────────────
/**
 * Calls the RoBERTa ML API and returns a normalized result.
 *
 * New model response shape:
 * {
 *   emotion:     string   (UI label e.g. "Happy")
 *   raw_emotion: string   (model label e.g. "joy")
 *   confidence:  float
 *   top3:        [{ emotion, raw, confidence }]
 *   uncertainty: "low" | "moderate" | "high"
 * }
 */
const analyzeEmotion = async (text) => {
  try {
    const response = await axios.post(
      ML_PREDICT_URL,
      { text },
      { timeout: 8000 } // ✅ INCREASED: RoBERTa is heavier than old model, 5s can timeout on first request
    );

    const data = response.data || {};

    // 🔍 Debug log
    console.log('🧠 ML RESPONSE:', data);

    // ✅ FIXED: new model always returns raw_emotion (snake_case)
    // kept fallback chain for safety
    let rawEmotion =
      data.raw_emotion ||
      data.rawEmotion ||
      data.emotion ||
      'uncertain';

    // ✅ Lowercase to be safe before validating
    rawEmotion = rawEmotion.toLowerCase();

    // ✅ Validate rawEmotion against known labels
    if (!VALID_RAW_EMOTIONS.includes(rawEmotion)) {
      console.warn('⚠️ Invalid rawEmotion from ML:', rawEmotion);
      rawEmotion = 'uncertain';
    }

    // ✅ confidence — already a float from new model
    const confidence =
      typeof data.confidence === 'number' ? data.confidence : 0;

    // ✅ top3 — new model always returns this array
    // shape: [{ emotion: "Happy", raw: "joy", confidence: 0.92 }]
    const top3 = Array.isArray(data.top3) ? data.top3 : [];

    // ✅ NEW: pass through uncertainty level from new model
    const uncertainty = VALID_UNCERTAINTY_LEVELS.includes(data.uncertainty)
      ? data.uncertainty
      : confidence >= 0.8
      ? 'low'
      : confidence >= 0.6
      ? 'moderate'
      : 'high';

    return {
      rawEmotion,
      confidence,
      top3,
      uncertainty, // ✅ NEW field — use this in journalController if needed
    };

  } catch (error) {
    // ✅ Improved error logging — distinguish timeout vs other errors
    if (error.code === 'ECONNABORTED') {
      console.error('❌ ML Service timeout — is the Python server running on port 8000?');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ ML Service refused connection — run: uvicorn app:app --port 8000');
    } else {
      console.error('❌ ML Service Error:', error.message);
    }

    // ✅ Safe fallback — never return a fake emotion
    return {
      rawEmotion: 'uncertain',
      confidence: 0,
      top3: [],
      uncertainty: 'high',
    };
  }
};

// ─────────────────────────────────────────
// 🔥 HEALTH CHECK (optional utility)
// ─────────────────────────────────────────
// ✅ NEW: lets your Node backend verify ML service is alive before processing
const checkMLHealth = async () => {
  try {
    const response = await axios.get(`${ML_BASE_URL}/health`, { timeout: 3000 });
    return response.data;
  } catch (error) {
    console.error('❌ ML Health check failed:', error.message);
    return null;
  }
};

module.exports = {
  analyzeEmotion,
  checkMLHealth, // ✅ NEW export — use in server startup if needed
};