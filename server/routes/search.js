const express = require('express');
const router = express.Router();
const searchEngine = require('../services/search-engine');

// GET /api/search?q=keyword&type=stock — 全文搜索
router.get('/', (req, res) => {
  try {
    const { q, type, limit } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'q query parameter is required' });
    }
    const results = searchEngine.search(q, type || null, parseInt(limit) || 20);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/search/suggest?q=keyword — 搜索建议
router.get('/suggest', (req, res) => {
  try {
    const { q, limit } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'q query parameter is required' });
    }
    const results = searchEngine.suggest(q, parseInt(limit) || 10);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
