const fs = require('fs');
const path = require('path');
const { getWikiPath, getMetaPath, resolveWikiPath, toRelativePath } = require('../utils/path-resolver');
const { parsePage, renderMarkdown } = require('../utils/markdown');

// 读取 wiki/index.md 并返回结构化索引数据
function readIndex() {
  const indexPath = getWikiPath('index.md');
  const content = fs.readFileSync(indexPath, 'utf-8');
  const { frontmatter, body } = parsePage(content);
  return { frontmatter, body, html: renderMarkdown(body) };
}

// 读取指定页面
function readPage(relativePath) {
  const fullPath = resolveWikiPath(relativePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  const { frontmatter, body } = parsePage(content);
  const html = renderMarkdown(body);
  return { frontmatter, body, html, relativePath };
}

// 扫描 wiki/ 目录，返回完整目录树
function readTree(dirPath = '', depth = 0) {
  const fullDir = dirPath ? getWikiPath(dirPath) : getWikiPath();
  
  if (!fs.existsSync(fullDir)) {
    return [];
  }

  const items = fs.readdirSync(fullDir, { withFileTypes: true });
  const tree = [];

  for (const item of items) {
    // 跳过隐藏文件和特殊目录
    if (item.name.startsWith('.') || item.name === 'schema.md') continue;

    const relativeItemPath = dirPath ? `${dirPath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      const children = readTree(relativeItemPath, depth + 1);
      tree.push({
        name: item.name,
        path: relativeItemPath,
        type: 'directory',
        children
      });
    } else if (item.name.endsWith('.md')) {
      // 读取 frontmatter 获取标题
      const filePath = getWikiPath(relativeItemPath);
      let title = item.name.replace('.md', '');
      let frontmatter = {};
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = parsePage(content);
        frontmatter = parsed.frontmatter;
        if (frontmatter.title) {
          title = frontmatter.title;
        }
      } catch (e) {
        // 忽略解析错误
      }

      tree.push({
        name: item.name,
        title,
        path: relativeItemPath,
        type: 'file',
        frontmatter
      });
    }
  }

  // 目录排在前面，文件排在后面
  tree.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name, 'zh-CN');
  });

  return tree;
}

// 读取子索引页面
function readSubIndex(type) {
  const mapping = {
    stocks: 'entities/_index-stocks.md',
    sectors: 'entities/_index-sectors.md',
    indicators: 'entities/_index-indicators.md',
    concepts: 'concepts/_index-concepts.md',
    analyses: 'analyses/_index-analyses.md'
  };

  const filePath = mapping[type];
  if (!filePath) return null;

  return readPage(filePath);
}

// 读取 meta 目录下所有文件
function readMeta() {
  const metaDir = getMetaPath();
  const result = {};

  const files = [
    { key: 'contradictions', name: 'contradictions.md' },
    { key: 'openQuestions', name: 'open-questions.md' },
    { key: 'readingList', name: 'reading-list.md' }
  ];

  for (const file of files) {
    const filePath = path.join(metaDir, file.name);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, body } = parsePage(content);
      result[file.key] = { frontmatter, body, html: renderMarkdown(body) };
    }
  }

  return result;
}

// 获取最近更新的页面
function getRecentPages(n = 10) {
  const pages = [];
  collectPages(getWikiPath(), '', pages);
  
  // 按 updated 或 created 日期排序
  pages.sort((a, b) => {
    const dateA = a.frontmatter.updated || a.frontmatter.created || '';
    const dateB = b.frontmatter.updated || b.frontmatter.created || '';
    return dateB.localeCompare(dateA);
  });

  return pages.slice(0, n);
}

// 递归收集所有页面
function collectPages(dirPath, relativeDir, pages) {
  if (!fs.existsSync(dirPath)) return;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    if (item.name.startsWith('.') || item.name === 'schema.md') continue;

    const fullPath = path.join(dirPath, item.name);
    const relativePath = relativeDir ? `${relativeDir}/${item.name}` : item.name;

    if (item.isDirectory()) {
      collectPages(fullPath, relativePath, pages);
    } else if (item.name.endsWith('.md') && !item.name.startsWith('_index')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter } = parsePage(content);
        pages.push({
          name: item.name,
          title: frontmatter.title || item.name.replace('.md', ''),
          path: relativePath,
          frontmatter
        });
      } catch (e) {
        // 忽略
      }
    }
  }
}

// 统计数据
function getStats() {
  const pages = [];
  collectPages(getWikiPath(), '', pages);

  const stats = {
    total: pages.length,
    byType: {},
    byCategory: {
      entities: 0,
      concepts: 0,
      analyses: 0,
      meta: 0
    }
  };

  for (const page of pages) {
    const type = page.frontmatter.type || 'unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    if (page.path.startsWith('entities/')) stats.byCategory.entities++;
    else if (page.path.startsWith('concepts/')) stats.byCategory.concepts++;
    else if (page.path.startsWith('analyses/')) stats.byCategory.analyses++;
    else stats.byCategory.meta++;
  }

  return stats;
}

module.exports = {
  readIndex,
  readPage,
  readTree,
  readSubIndex,
  readMeta,
  getRecentPages,
  getStats
};
