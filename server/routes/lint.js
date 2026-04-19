const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getMetaPath } = require('../utils/path-resolver');
const { parsePage, renderMarkdown } = require('../utils/markdown');
const taskQueue = require('../services/task-queue');

// GET /api/lint/reports — 列出所有 lint 报告
router.get('/reports', (req, res) => {
  try {
    const metaDir = getMetaPath();
    const reports = [];
    
    if (fs.existsSync(metaDir)) {
      const files = fs.readdirSync(metaDir);
      for (const file of files) {
        if (file.startsWith('lint-report-') && file.endsWith('.md')) {
          const dateMatch = file.match(/lint-report-(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            reports.push({
              date: dateMatch[1],
              filename: file,
              path: `meta/${file}`
            });
          }
        }
      }
    }
    
    // 按日期倒序
    reports.sort((a, b) => b.date.localeCompare(a.date));
    res.json(reports);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/lint/latest — 最新 lint 报告
router.get('/latest', (req, res) => {
  try {
    const metaDir = getMetaPath();
    let latestReport = null;
    let latestDate = '';
    
    if (fs.existsSync(metaDir)) {
      const files = fs.readdirSync(metaDir);
      for (const file of files) {
        if (file.startsWith('lint-report-') && file.endsWith('.md')) {
          const dateMatch = file.match(/lint-report-(\d{4}-\d{2}-\d{2})/);
          if (dateMatch && dateMatch[1] > latestDate) {
            latestDate = dateMatch[1];
            latestReport = file;
          }
        }
      }
    }
    
    if (!latestReport) {
      return res.json({ found: false });
    }
    
    const filePath = path.join(metaDir, latestReport);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parsePage(content);
    
    res.json({
      found: true,
      date: latestDate,
      filename: latestReport,
      frontmatter,
      body,
      html: renderMarkdown(body)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/lint/report/:date — 指定日期 lint 报告
router.get('/report/:date', (req, res) => {
  try {
    const { date } = req.params;
    const filename = `lint-report-${date}.md`;
    const filePath = getMetaPath(filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parsePage(content);
    
    res.json({
      date,
      filename,
      frontmatter,
      body,
      html: renderMarkdown(body)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/lint/trigger — 触发 lint 任务
router.post('/trigger', (req, res) => {
  try {
    const { mode = 'full' } = req.body;
    const task = taskQueue.createLintTask(mode);
    res.json({
      message: 'Lint task created. Please execute in LLM.',
      task,
      command: mode === 'quick' 
        ? '请对 Wiki 执行快速 Lint 检查' 
        : '请对 Wiki 执行完整 Lint 检查'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
