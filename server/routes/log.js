const express = require('express');
const router = express.Router();
const fs = require('fs');
const { getWikiPath } = require('../utils/path-resolver');
const { renderMarkdown } = require('../utils/markdown');

// 解析 log.md 为结构化日志条目
function parseLog() {
  const logPath = getWikiPath('log.md');
  if (!fs.existsSync(logPath)) {
    return [];
  }

  const content = fs.readFileSync(logPath, 'utf-8');
  const entries = [];
  
  // 按 ## [日期] 类型 | 描述 分割
  const regex = /^## \[(\d{4}-\d{2}-\d{2})\]\s+(\w+)\s*\|\s*(.+)$/gm;
  const matches = [...content.matchAll(regex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const date = match[1];
    const operation = match[2];
    const description = match[3].trim();

    // 提取该条目到下一条目之间的内容
    const startIndex = match.index + match[0].length;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : content.length;
    const bodyContent = content.substring(startIndex, endIndex).trim();

    entries.push({
      date,
      operation,
      description,
      body: bodyContent,
      html: renderMarkdown(bodyContent)
    });
  }

  return entries;
}

// GET /api/log — 全部日志
router.get('/', (req, res) => {
  try {
    const entries = parseLog();
    res.json(entries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/log/recent?n=20 — 最近日志
router.get('/recent', (req, res) => {
  try {
    const n = parseInt(req.query.n) || 20;
    const entries = parseLog();
    res.json(entries.slice(0, n));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/log/filter?type=ingest — 按类型过滤
router.get('/filter', (req, res) => {
  try {
    const { type } = req.query;
    const entries = parseLog();
    if (type) {
      const filtered = entries.filter(e => e.operation === type);
      res.json(filtered);
    } else {
      res.json(entries);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
