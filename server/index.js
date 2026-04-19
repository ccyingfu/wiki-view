const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const chokidar = require('chokidar');
const path = require('path');

const wikiRoutes = require('./routes/wiki');
const searchRoutes = require('./routes/search');
const ingestRoutes = require('./routes/ingest');
const lintRoutes = require('./routes/lint');
const logRoutes = require('./routes/log');
const searchEngine = require('./services/search-engine');
const { getWikiRoot } = require('./utils/path-resolver');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/wiki', wikiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/lint', lintRoutes);
app.use('/api/log', logRoutes);

// 静态文件（生产环境）
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// SPA fallback - 匹配所有非 API 路由
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  } else {
    next();
  }
});

// 创建 HTTP 服务器
const server = http.createServer(app);

// WebSocket 服务
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.send(JSON.stringify({ type: 'connected', message: 'Wiki-View WS connected' }));
});

function broadcastChange(changeType, filePath) {
  const message = JSON.stringify({
    type: changeType,
    path: filePath,
    timestamp: new Date().toISOString()
  });
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// 文件监听
const wikiRoot = getWikiRoot();
const watcher = chokidar.watch([`${wikiRoot}/wiki`, `${wikiRoot}/raw`], {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', filePath => {
    console.log(`File added: ${filePath}`);
    const relativePath = filePath.replace(`${wikiRoot}/wiki/`, '');
    searchEngine.updateFileInIndex(relativePath);
    broadcastChange('add', relativePath);
  })
  .on('change', filePath => {
    console.log(`File changed: ${filePath}`);
    const relativePath = filePath.replace(`${wikiRoot}/wiki/`, '');
    searchEngine.updateFileInIndex(relativePath);
    broadcastChange('change', relativePath);
  })
  .on('unlink', filePath => {
    console.log(`File removed: ${filePath}`);
    const relativePath = filePath.replace(`${wikiRoot}/wiki/`, '');
    searchEngine.removeFileFromIndex(relativePath);
    broadcastChange('unlink', relativePath);
  });

// 启动服务器
server.listen(PORT, () => {
  console.log(`Wiki-View server running on http://localhost:${PORT}`);
  
  // 构建搜索索引
  console.log('Building search index...');
  searchEngine.buildIndex();
  console.log('Search index ready');
});

module.exports = app;
