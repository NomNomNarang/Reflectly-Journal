const Groq = require('groq-sdk');

// ─────────────────────────────────────────
// Groq client — free tier, very fast
// Uses Llama 3.1 8B (free, no credit card)
// ─────────────────────────────────────────
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─────────────────────────────────────────
// Emotion → tone guidance for the prompt
// ─────────────────────────────────────────
const EMOTION_TONE = {
  joy:      'warm, celebratory and encouraging',
  love:     'gentle, affirming and heartfelt',
  sadness:  'compassionate, soft and supportive',
  anger:    'calm, grounding and validating',
  fear:     'reassuring, steady and practical',
  surprise: 'curious, playful and open-minded',
  uncertain:'neutral, open and non-judgmental',
};

// ─────────────────────────────────────────
// MAIN: generateInsight
// ─────────────────────────────────────────
/**
 * Calls Llama 3 via Groq to generate a personalized insight
 * based on the user's journal text and detected emotion.
 *
 * @param {string} journalText  - the raw journal entry
 * @param {string} rawEmotion   - detected emotion (e.g. 'joy')
 * @param {string} uiEmotion    - mapped UI label (e.g. 'Happy')
 * @param {number} confidence   - model confidence score (0-1)
 * @returns {Promise<string>}   - personalized insight text
 */
const generateInsight = async (journalText, rawEmotion, uiEmotion, confidence) => {
  try {
    const tone = EMOTION_TONE[rawEmotion] || EMOTION_TONE['uncertain'];

    const prompt = `
You are a compassionate emotional wellness coach for a journaling app called Reflectly.

A user has just written this journal entry:
"${journalText}"

Our emotion detection model identified their primary emotion as: ${uiEmotion} (${rawEmotion})
Confidence: ${Math.round(confidence * 100)}%

Your task:
- Write a short, personalized insight (3-4 sentences MAX) based on what they wrote
- Tone should be: ${tone}
- Acknowledge what they shared specifically — don't be generic
- End with one gentle, actionable suggestion or reflection question
- Do NOT mention the emotion label directly (e.g. don't say "I can see you're feeling joy")
- Do NOT use bullet points — write in flowing, warm prose
- Keep it concise and human — like a thoughtful friend, not a therapist
`.trim();

    const response = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant', // ✅ free, fast, great for short text
      max_tokens:  200,
      temperature: 0.75,
      messages: [
        {
          role:    'system',
          content: 'You are a warm, empathetic journaling companion. Keep responses brief, personal, and uplifting.',
        },
        {
          role:    'user',
          content: prompt,
        },
      ],
    });

    const insight = response.choices[0]?.message?.content?.trim();

    if (!insight) {
      throw new Error('Empty response from Groq');
    }

    return insight;

  } catch (error) {
    console.error('❌ Groq insight generation failed:', error.message);
    return getFallbackInsight(rawEmotion);
  }
};

// ─────────────────────────────────────────
// FALLBACK: static insights (if Groq fails)
// ─────────────────────────────────────────
const getFallbackInsight = (rawEmotion) => {
  const fallbacks = {
    joy:      "It sounds like something wonderful is happening in your world. Savour this feeling — you deserve it. ✨",
    love:     "There's a warmth in what you've shared today. Hold onto that connection — it matters deeply.",
    sadness:  "It's okay to feel this way. Your feelings are valid, and this moment will pass. Be gentle with yourself today.",
    anger:    "It makes sense that you're feeling this way. Take a breath — your emotions are telling you something important.",
    fear:     "Uncertainty can feel overwhelming, but you've navigated hard moments before. Take it one step at a time.",
    surprise: "Life threw something unexpected your way! Take a moment to sit with it before deciding how to respond.",
    uncertain:"Thank you for checking in with yourself today. Whatever you're feeling is valid — keep going.",
  };

  return fallbacks[rawEmotion] || fallbacks['uncertain'];
};

module.exports = { generateInsight };