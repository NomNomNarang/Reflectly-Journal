const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const {
  createEntry,
  getEntries,
  getDashboard,
  analyzeOnly,
} = require('../controllers/journalController');

// ─────────────────────────────────────────
// 🔐 All routes require authentication
// ─────────────────────────────────────────

// POST   /api/journal          → create new entry
router.post('/', auth, createEntry);

// GET    /api/journal          → fetch all entries
router.get('/', auth, getEntries);

// GET    /api/journal/dashboard → dashboard stats
router.get('/dashboard', auth, getDashboard);

// POST   /api/journal/analyze  → analyze without saving
router.post('/analyze', auth, analyzeOnly);

// ─────────────────────────────────────────
// Legacy support
// (handled via server.js alias /api/entries)
// ─────────────────────────────────────────

module.exports = router;