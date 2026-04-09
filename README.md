# 🌸 Reflectly  
### *Understand your emotions. One journal at a time.*

---

## 💭 Overview

Reflectly is an AI-powered journaling platform that helps users understand their emotions through text.  
It combines deep learning with uncertainty-aware predictions to provide more reliable and meaningful emotional insights.

---

## ✨ Features

- 🧠 Emotion detection from journal entries  
- 📊 Mood tracking and insights  
- 🔒 Privacy-focused journaling  
- ⚡ Real-time predictions  
- 📈 Streak and activity tracking  
- 🌿 Hybrid AI + lexicon-based reasoning  

---

## 🖼️ Application Preview

### 🏠 Landing Page
![Landing Page](./assets/landing.jpeg)

---

### ✍️ Journaling Interface
![Journal](./assets/journal.jpeg)

---

### 📊 Mood Dashboard
![Dashboard](./assets/Moodjourney.jpeg)

---

## 🏗️ System Architecture

![System Architecture](./assets/SystemArch.png)

---

## ⚙️ Tech Stack

| Layer            | Technology Used |
|----------------|---------------|
| Frontend        | React.js      |
| Backend         | Node.js, Express |
| Database        | MongoDB       |
| ML Service      | FastAPI       |
| Model           | RoBERTa (HuggingFace) |
| Framework       | PyTorch       |

---

## 🧠 Model Details

| Component              | Description |
|----------------------|------------|
| Model                 | RoBERTa-base |
| Classes               | Anger, Fear, Joy, Love, Sadness, Surprise |
| F1 Score              | **0.9560** |
| Calibration           | Temperature Scaling |
| ECE (Before → After)  | 0.0342 → 0.0145 |
| Uncertainty Measures  | MSP + Entropy |
| Fusion Method         | NRCLex Hybrid |

---

## 🔍 How It Works

1. User writes a journal entry  
2. Text is sent to backend  
3. RoBERTa predicts emotion  
4. Calibration improves confidence reliability  
5. Uncertainty is calculated  
6. If confidence is low → NRCLex fusion applied  
7. Final emotion is returned to user  

---

## 📁 Project Structure
