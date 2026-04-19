const path = require('path');

// my-wiki 项目根目录
const WIKI_ROOT = '/Users/liyingfu/Desktop/my-wiki';

function getWikiRoot() {
  return WIKI_ROOT;
}

function getWikiPath(...segments) {
  return path.join(WIKI_ROOT, 'wiki', ...segments);
}

function getRawPath(...segments) {
  return path.join(WIKI_ROOT, 'raw', ...segments);
}

function getMetaPath(...segments) {
  return path.join(WIKI_ROOT, 'wiki', 'meta', ...segments);
}

// 将 wiki 内的相对路径转为完整系统路径
function resolveWikiPath(relativePath) {
  const cleaned = relativePath.replace(/^wiki\//, '');
  return path.join(WIKI_ROOT, 'wiki', cleaned);
}

// 将完整系统路径转为 wiki 内的相对路径
function toRelativePath(fullPath) {
  const wikiDir = path.join(WIKI_ROOT, 'wiki');
  return path.relative(wikiDir, fullPath);
}

module.exports = {
  getWikiRoot,
  getWikiPath,
  getRawPath,
  getMetaPath,
  resolveWikiPath,
  toRelativePath
};
