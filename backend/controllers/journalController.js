const JournalEntry = require('../models/JournalEntry');
const { analyzeEmotion } = require('../services/mlService');

// Emotion mapping
const modelToUIEmotionMap = {
  anger: 'Angry',
  fear: 'Anxious',
  joy: 'Happy',
  love: 'Love',
  sadness: 'Sad',
  surprise: 'Surprise',
};

const calmKeywords = [
  'calm',
  'peaceful',
  'relaxed',
  'chill',
  'fine',
  'okay',
  'ok',
  'content',
  'at ease',
];

const CONFIDENCE_THRESHOLD = 0.5;

// 🔥 UPDATED SMART HELPER FUNCTION
const resolveUIEmotion = (rawEmotion, confidence, textInput, top3 = []) => {
  const text = textInput.toLowerCase();

  // ✅ LOVE override (strong semantic signals)
  if (
    text.includes('love') ||
    text.includes('miss') ||
    text.includes('hug') ||
    text.includes('family') ||
    text.includes('parents') ||
    text.includes('friend') ||
    text.includes('care')
  ) {
    return 'Love';
  }

  // ✅ SURPRISE override
  if (
    text.includes('surprise') ||
    text.includes('unexpected') ||
    text.includes('suddenly') ||
    text.includes('shock') ||
    text.includes('wow')
  ) {
    return 'Surprise';
  }

  // ✅ Use top3 fallback (VERY POWERFUL)
  if (top3 && top3.length > 1) {
    const second = top3[1];

    if (second?.raw === 'love' && second.confidence > 0.05) {
      return 'Love';
    }

    if (second?.raw === 'surprise' && second.confidence > 0.05) {
      return 'Surprise';
    }
  }

  // ✅ Calm logic
  if (confidence < CONFIDENCE_THRESHOLD || rawEmotion === 'uncertain') {
    return 'Calm';
  }

  // ✅ Smart calm for mild sadness
  if (
    rawEmotion === 'sadness' &&
    confidence < 0.65 &&
    calmKeywords.some((word) => text.includes(word))
  ) {
    return 'Calm';
  }

  return modelToUIEmotionMap[rawEmotion] || 'Calm';
};

// ─────────────────────────────────────────
// CREATE ENTRY
// ─────────────────────────────────────────
exports.createEntry = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'User not authenticated properly' });
    }

    const { text, tags } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Journal text is required' });
    }

    const textInput = text.trim().toLowerCase();

    let emotionData;
    try {
      emotionData = await analyzeEmotion(textInput);
    } catch (mlErr) {
      console.error('[ML ERROR]', mlErr);
      emotionData = {
        rawEmotion: 'uncertain',
        confidence: 0,
        top3: [],
        uncertainty: 'high',
      };
    }

    const { rawEmotion, confidence, top3, uncertainty } = emotionData;

    // 🔥 UPDATED CALL (includes top3)
    const mappedEmotion = resolveUIEmotion(
      rawEmotion,
      confidence,
      textInput,
      top3
    );

    const entry = await JournalEntry.create({
      userId: req.user.id,
      text: text.trim(),
      emotion: mappedEmotion,
      rawEmotion,
      confidence,
      tags: tags || [],
    });

    console.log('✅ ENTRY SAVED:', entry._id);

    res.status(201).json({
      entry,
      emotion: mappedEmotion,
      rawEmotion,
      confidence,
      uncertainty,
      top3,
    });

  } catch (err) {
    console.error('🔥 FULL JOURNAL ERROR:', err);
    res.status(500).json({ msg: 'Failed to save journal entry' });
  }
};

// ─────────────────────────────────────────
// GET ENTRIES
// ─────────────────────────────────────────
exports.getEntries = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'User not authenticated properly' });
    }

    const entries = await JournalEntry.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(entries);

  } catch (err) {
    console.error('🔥 FETCH ENTRIES ERROR:', err);
    res.status(500).json({ msg: 'Failed to fetch entries' });
  }
};

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'User not authenticated properly' });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    const entries = await JournalEntry.find({
      userId: req.user.id,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ createdAt: 1 });

    const moodData = {};
    const moodCounts = {};

    entries.forEach((entry) => {
      const day = new Date(entry.createdAt).getDate();
      moodData[day] = entry.emotion;

      moodCounts[entry.emotion] =
        (moodCounts[entry.emotion] || 0) + 1;
    });

    const total = entries.length || 1;

    const weeklyStats = Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    const entriesByDay = new Set(
      entries.map((e) => new Date(e.createdAt).toDateString())
    );

    let streak = 0;
    const check = new Date();

    while (entriesByDay.has(check.toDateString())) {
      streak++;
      check.setDate(check.getDate() - 1);
    }

    res.json({ moodData, weeklyStats, streak });

  } catch (err) {
    console.error('🔥 DASHBOARD ERROR:', err);
    res.status(500).json({ msg: 'Failed to fetch dashboard data' });
  }
};

// ─────────────────────────────────────────
// ANALYZE ONLY
// ─────────────────────────────────────────
exports.analyzeOnly = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'text is required' });
    }

    const textInput = text.trim().toLowerCase();

    let result;
    try {
      result = await analyzeEmotion(textInput);
    } catch (err) {
      return res.status(503).json({ msg: 'ML service unavailable' });
    }

    const { rawEmotion, confidence, top3, uncertainty } = result;

    const mappedEmotion = resolveUIEmotion(
      rawEmotion,
      confidence,
      textInput,
      top3
    );

    res.json({
      rawEmotion,
      confidence,
      top3,
      uncertainty,
      emotion: mappedEmotion,
    });

  } catch (err) {
    console.error('🔥 ANALYZE ERROR:', err);
    res.status(503).json({ msg: err.message });
  }
};