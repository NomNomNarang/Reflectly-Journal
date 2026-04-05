const mongoose = require('mongoose');

console.log("✅ JournalEntry model loaded");

// ✅ Allowed UI emotions
const UI_EMOTIONS = [
  'Happy',
  'Sad',
  'Anxious',
  'Angry', 
  'Surprise',
  'Love',
  'Calm',
];

// ✅ Raw ML emotions
const RAW_EMOTIONS = [
  'anger',
  'fear',
  'joy',
  'love',
  'sadness',
  'surprise',
  'uncertain',
];

// ✅ Uncertainty levels
const UNCERTAINTY_LEVELS = ['low', 'moderate', 'high'];

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    text: {
      type: String,
      required: [true, 'Journal text is required'],
      trim: true,
      minlength: [3, 'Text must be at least 3 characters long'],
    },

    emotion: {
      type: String,
      enum: UI_EMOTIONS,
      required: true,
      default: 'Calm',
    },

    rawEmotion: {
      type: String,
      enum: RAW_EMOTIONS,
      default: 'uncertain',
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    uncertainty: {
      type: String,
      enum: UNCERTAINTY_LEVELS,
      default: 'high',
    },

    top3: {
      type: Array,
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ SAFE PRE-SAVE VALIDATION (no async, so next is valid)
// journalEntrySchema.pre('save', function (next) {
//   if (!this.text || !this.text.trim()) {
//     return next(new Error('Journal text cannot be empty'));
//   }
//   next();
// });

// ✅ PREVENT MODEL OVERWRITE ERROR (IMPORTANT)
module.exports =
  mongoose.models.JournalEntry ||
  mongoose.model('JournalEntry', journalEntrySchema);