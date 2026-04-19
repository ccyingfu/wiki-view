const matter = require('gray-matter');
const { marked } = require('marked');

// 自定义 marked 渲染器，处理 wiki 链接
const renderer = new marked.Renderer();

// 处理 [[wikilink]] 语法
function processWikiLinks(markdown) {
  // [[链接文本]] 格式
  return markdown.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
    // 去掉可能的 .md 后缀
    const cleanText = linkText.replace(/\.md$/, '');
    const encodedPath = encodeURIComponent(`entities/stocks/${cleanText}.md`);
    return `[${linkText}](/page?path=${encodedPath})`;
  });
}

function parsePage(content) {
  const { data: frontmatter, content: body } = matter(content);
  return { frontmatter, body };
}

function renderMarkdown(body) {
  // 先处理 wiki 链接
  const processed = processWikiLinks(body);
  // 渲染为 HTML
  return marked(processed);
}

module.exports = {
  parsePage,
  renderMarkdown,
  processWikiLinks
};
