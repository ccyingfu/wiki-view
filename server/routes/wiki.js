const express = require('express');
const router = express.Router();
const wikiReader = require('../services/wiki-reader');

// GET /api/wiki/index — 读取全局索引
router.get('/index', (req, res) => {
  try {
    const data = wikiReader.readIndex();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wiki/tree — 目录树
router.get('/tree', (req, res) => {
  try {
    const tree = wikiReader.readTree();
    res.json(tree);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wiki/page?path=xxx — 读取指定页面
router.get('/page', (req, res) => {
  try {
    const { path: pagePath } = req.query;
    if (!pagePath) {
      return res.status(400).json({ error: 'path query parameter is required' });
    }
    const data = wikiReader.readPage(pagePath);
    if (!data) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wiki/sub-index?type=stocks — 子索引
router.get('/sub-index', (req, res) => {
  try {
    const { type } = req.query;
    if (!type) {
      return res.status(400).json({ error: 'type query parameter is required' });
    }
    const data = wikiReader.readSubIndex(type);
    if (!data) {
      return res.status(404).json({ error: 'Sub-index not found' });
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wiki/meta — 元信息
router.get('/meta', (req, res) => {
  try {
    const data = wikiReader.readMeta();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wiki/recent?n=10 — 最近更新
router.get('/recent', (req, res) => {
  try {
    const n = parseInt(req.query.n) || 10;
    const data = wikiReader.getRecentPages(n);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wiki/stats — 统计数据
router.get('/stats', (req, res) => {
  try {
    const data = wikiReader.getStats();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
