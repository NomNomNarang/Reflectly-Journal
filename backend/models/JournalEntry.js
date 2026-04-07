const mongoose = require('mongoose');
console.log("✅ JournalEntry model loaded");

// ✅ Allowed UI emotions
const UI_EMOTIONS = [
  'Happy', 'Sad', 'Anxious', 'Angry', 'Surprise', 'Love', 'Calm',
];

// ✅ Raw ML emotions
const RAW_EMOTIONS = [
  'anger', 'fear', 'joy', 'love', 'sadness', 'surprise', 'uncertain',
];

// ✅ Uncertainty levels
const UNCERTAINTY_LEVELS = ['low', 'moderate', 'high'];

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    text: {
      type:      String,
      required:  [true, 'Journal text is required'],
      trim:      true,
      minlength: [3, 'Text must be at least 3 characters long'],
    },
    emotion: {
      type:     String,
      enum:     UI_EMOTIONS,
      required: true,
      default:  'Calm',
    },
    rawEmotion: {
      type:    String,
      enum:    RAW_EMOTIONS,
      default: 'uncertain',
    },
    confidence: {
      type:    Number,
      min:     0,
      max:     1,
      default: 0,
    },
    uncertainty: {
      type:    String,
      enum:    UNCERTAINTY_LEVELS,
      default: 'high',
    },
    top3: {
      type:    Array,
      default: [],
    },
    // ✅ NEW: personalized Groq-generated insight
    // null if Groq was unavailable — frontend falls back to static content
    insight: {
      type:    String,
      default: null,
    },
    tags: {
      type:    [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ PREVENT MODEL OVERWRITE ERROR
module.exports =
  mongoose.models.JournalEntry ||
  mongoose.model('JournalEntry', journalEntrySchema);