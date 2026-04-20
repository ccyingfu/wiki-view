const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getRawPath, getWikiRoot } = require('../utils/path-resolver');
const taskQueue = require('../services/task-queue');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/ingest/upload — 上传文件
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const subDir = req.body.directory || 'notes';
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf-8');
    const destDir = getRawPath(subDir);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, originalName);
    fs.writeFileSync(destPath, req.file.buffer);

    const relativePath = `raw/${subDir}/${originalName}`;
    res.json({
      message: 'File uploaded successfully',
      path: relativePath,
      size: req.file.size
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/ingest/raw-list — 列出 raw/ 目录文件
router.get('/raw-list', (req, res) => {
  try {
    const rawDir = getRawPath();
    const files = listFilesRecursive(rawDir, 'raw');
    res.json(files);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ingest/trigger — 触发导入任务
router.post('/trigger', (req, res) => {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'files array is required' });
    }
    const task = taskQueue.createIngestTask(files);
    res.json({
      message: 'Ingest task created. Please execute in LLM.',
      task,
      command: `请录入 ${files.join('、')} 到知识库`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 递归列出文件
function listFilesRecursive(dirPath, prefix) {
  const items = [];
  if (!fs.existsSync(dirPath)) return items;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      items.push(...listFilesRecursive(fullPath, relativePath));
    } else {
      const stat = fs.statSync(fullPath);
      items.push({
        name: entry.name,
        path: relativePath,
        size: stat.size,
        modified: stat.mtime
      });
    }
  }
  return items;
}

module.exports = router;
