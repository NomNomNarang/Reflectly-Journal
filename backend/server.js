const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// ─────────────────────────────────────────
// 🔥 MIDDLEWARE
// ─────────────────────────────────────────

// ✅ CORS (flexible for dev + production)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:8081',
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // 🔥 allow all (change later for production)
      }
    },
    credentials: true,
  })
);

// ✅ JSON parsing
app.use(express.json({ limit: '1mb' }));

// ✅ Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ─────────────────────────────────────────
// 🔥 DATABASE
// ─────────────────────────────────────────
connectDB()
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ─────────────────────────────────────────
// 🔥 ROUTES
// ─────────────────────────────────────────
const journalRouter = require('./routes/journal');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/journal', journalRouter);

// Legacy alias
app.use('/api/entries', journalRouter);

// ─────────────────────────────────────────
// 🔥 HEALTH CHECK
// ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    db:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',
    // ✅ UPDATED: reflects new RoBERTa emotion model on port 8000
    ml_service: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
    ml_model: 'roberta-base (emotion classifier v2 — retrained)',
  });
});

app.get('/', (_req, res) =>
  // ✅ UPDATED: version bump to reflect new model integration
  res.send('Reflectly Backend v4.0 is running')
);

// ─────────────────────────────────────────
// 🔥 404 HANDLER
// ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    msg: `Route not found: ${req.originalUrl}`,
  });
});

// ─────────────────────────────────────────
// 🔥 GLOBAL ERROR HANDLER
// ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Global Error:', err.stack || err.message);

  res.status(err.status || 500).json({
    msg: err.message || 'Internal server error',
  });
});

// ─────────────────────────────────────────
// 🔥 START SERVER
// ─────────────────────────────────────────
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(
    `🧠 ML Service: ${
      process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'
    }`
  );
});