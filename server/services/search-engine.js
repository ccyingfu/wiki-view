const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');
const { getWikiPath, resolveWikiPath } = require('../utils/path-resolver');
const { parsePage } = require('../utils/markdown');

let fuseIndex = null;
let documents = [];

// 初始化搜索索引
function buildIndex() {
  documents = [];
  collectDocuments(getWikiPath(), '');
  
  fuseIndex = new Fuse(documents, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'type', weight: 1 },
      { name: 'content', weight: 0.5 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true
  });

  console.log(`Search index built: ${documents.length} documents`);
}

// 递归收集文档
function collectDocuments(dirPath, relativeDir) {
  if (!fs.existsSync(dirPath)) return;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    if (item.name.startsWith('.') || item.name === 'schema.md') continue;

    const fullPath = path.join(dirPath, item.name);
    const relativePath = relativeDir ? `${relativeDir}/${item.name}` : item.name;

    if (item.isDirectory()) {
      collectDocuments(fullPath, relativePath);
    } else if (item.name.endsWith('.md')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter, body } = parsePage(content);
        
        // 截断正文，避免索引过大
        const truncatedContent = body.substring(0, 2000);
        
        documents.push({
          title: frontmatter.title || item.name.replace('.md', ''),
          type: frontmatter.type || 'unknown',
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(' ') : '',
          content: truncatedContent,
          path: relativePath,
          frontmatter
        });
      } catch (e) {
        // 忽略解析错误
      }
    }
  }
}

// 搜索
function search(query, type = null, limit = 20) {
  if (!fuseIndex) {
    buildIndex();
  }

  let results = fuseIndex.search(query, { limit: 50 });

  // 按类型过滤
  if (type) {
    results = results.filter(r => r.item.type === type);
  }

  return results.slice(0, limit).map(r => ({
    item: r.item,
    score: r.score,
    matches: r.matches
  }));
}

// 搜索建议（仅标题匹配）
function suggest(query, limit = 10) {
  if (!fuseIndex) {
    buildIndex();
  }

  const results = fuseIndex.search(query, {
    limit,
    keys: ['title']
  });

  return results.map(r => ({
    title: r.item.title,
    path: r.item.path,
    type: r.item.type
  }));
}

// 单文件更新索引
function updateFileInIndex(relativePath) {
  const fullPath = resolveWikiPath(relativePath);
  
  // 移除旧文档
  documents = documents.filter(d => d.path !== relativePath);

  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const { frontmatter, body } = parsePage(content);
      const truncatedContent = body.substring(0, 2000);

      documents.push({
        title: frontmatter.title || path.basename(fullPath, '.md'),
        type: frontmatter.type || 'unknown',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(' ') : '',
        content: truncatedContent,
        path: relativePath,
        frontmatter
      });
    } catch (e) {
      // 忽略
    }
  }

  // 重建 fuse 索引
  fuseIndex = new Fuse(documents, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'type', weight: 1 },
      { name: 'content', weight: 0.5 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true
  });
}

// 从索引中移除文件
function removeFileFromIndex(relativePath) {
  documents = documents.filter(d => d.path !== relativePath);
  fuseIndex = new Fuse(documents, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'type', weight: 1 },
      { name: 'content', weight: 0.5 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true
  });
}

module.exports = {
  buildIndex,
  search,
  suggest,
  updateFileInIndex,
  removeFileFromIndex
};
