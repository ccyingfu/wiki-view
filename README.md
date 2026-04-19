# Wiki-View

my-wiki 知识库的可视化前端，提供目录浏览、内容查看、搜索、文件导入、Lint 报告展示和操作日志查看功能。

## 项目定位

Wiki-View 是 my-wiki 的**纯 UI 可视化层**，不实现业务逻辑。所有 ingest / query / lint 操作由 my-wiki 的 LLM skill 执行，wiki-view 只负责展示和触发。

| 功能 | wiki-view 职责 | my-wiki skill 职责 |
|------|---------------|-------------------|
| 查询 | 关键词搜索 + 页面浏览 | 跨页面综合分析 |
| 目录 | 目录树 + 页面卡片网格 | - |
| 导入 | 文件上传到 raw/ + 触发命令 | 阅读理解 + 创建/更新页面 + 维护索引 |
| Lint | 展示报告 + 触发命令 | 7 项检查 + 自动修复 + 生成报告 |

## 技术栈

**后端**：Node.js + Express 5 + WebSocket (ws)

**前端**：Vue 3 + Vite + Vue Router 4 + Pinia + Element Plus

**核心依赖**：
- `gray-matter` — YAML frontmatter 解析
- `marked` — Markdown 渲染为 HTML
- `fuse.js` — 内存模糊搜索引擎（支持中文）
- `chokidar` — 文件系统监听，实时推送变更
- `multer` — 文件上传

## 项目结构

```
wiki-view/
├── server/                          # Node.js 后端
│   ├── index.js                     # Express 入口 + WebSocket + 文件监听
│   ├── routes/
│   │   ├── wiki.js                  # Wiki 内容读取 API
│   │   ├── search.js                # 搜索 API
│   │   ├── ingest.js                # 文件上传 + 任务触发 API
│   │   ├── lint.js                  # Lint 报告读取 API
│   │   └── log.js                   # 操作日志 API
│   ├── services/
│   │   ├── wiki-reader.js           # 文件系统读取 + frontmatter 解析
│   │   ├── search-engine.js         # fuse.js 搜索索引 + 增量更新
│   │   └── task-queue.js            # 任务文件生成（供 LLM skill 读取）
│   └── utils/
│       ├── markdown.js              # frontmatter 解析 + Markdown 渲染 + wikilink 处理
│       └── path-resolver.js         # my-wiki 路径映射
│
├── client/                          # Vue 3 前端
│   └── src/
│       ├── router/index.js          # 路由定义
│       ├── stores/
│       │   ├── wiki.js              # Wiki 目录/页面数据
│       │   ├── search.js            # 搜索状态
│       │   └── ui.js                # UI 状态（侧边栏、连接状态）
│       ├── views/
│       │   ├── DashboardView.vue    # 仪表盘首页
│       │   ├── ExplorerView.vue     # 目录浏览
│       │   ├── PageView.vue         # 页面详情
│       │   ├── SearchView.vue       # 搜索
│       │   ├── IngestView.vue       # 导入资料
│       │   ├── LintView.vue         # Lint 检查
│       │   └── LogView.vue          # 操作日志
│       ├── components/
│       │   ├── layout/              # AppSidebar, AppHeader, AppBreadcrumb
│       │   ├── wiki/                # WikiTree, WikiCard, MarkdownRender, FrontmatterTag
│       │   ├── search/              # SearchResult
│       │   ├── ingest/              # FileUploader（支持逐文件指定目录）
│       │   └── lint/                # LintSummary, LintIssueList
│       └── assets/main.css          # 全局样式 + Markdown 渲染样式
│
└── package.json
```

## 快速开始

### 前置条件

- Node.js >= 18
- my-wiki 项目位于 `/Users/liyingfu/Desktop/my-wiki`（如路径不同需修改 `server/utils/path-resolver.js` 中的 `WIKI_ROOT`）

### 安装

```bash
cd /Users/liyingfu/Desktop/wiki-view
npm install
cd client && npm install
```

### 启动

```bash
# 终端 1：启动后端（端口 3000）
cd /Users/liyingfu/Desktop/wiki-view
node server/index.js

# 终端 2：启动前端开发服务器（端口 5173）
cd /Users/liyingfu/Desktop/wiki-view/client
npm run dev
```

打开浏览器访问 `http://localhost:5173`

### 生产构建

```bash
cd /Users/liyingfu/Desktop/wiki-view/client
npm run build
```

构建产物输出到 `client/dist/`，后端自动托管静态文件，只需启动后端即可：

```bash
node server/index.js
# 访问 http://localhost:3000
```

## 功能说明

### 1. 仪表盘 `/`

展示知识库概览：
- **统计卡片**：总页面数、个股数、板块数、指标数、概念数、分析数
- **最近活动**：最新 5 条操作日志
- **Lint 状态**：最近一次 Lint 报告摘要
- **快速操作**：导入资料、运行 Lint、搜索

### 2. 目录浏览 `/explore`

- **左侧**：wiki 目录树，按 `entities/`、`concepts/`、`analyses/`、`meta/` 组织
- **右侧**：选中目录下的文件卡片网格，显示标题、类型标签、更新日期
- 点击文件可跳转到页面详情

### 3. 页面详情 `/page?path=xxx`

- **顶部**：页面标题 + frontmatter 标签（类型、状态、标签）
- **主体**：Markdown 渲染内容，支持表格、代码块、wiki 链接
- **右侧栏**：元信息面板（类型、代码、板块、状态、来源数、创建/更新日期、标签列表）

### 4. 搜索 `/search`

- 基于 fuse.js 的模糊搜索引擎，启动时构建全量索引
- 支持中文搜索，按标题、标签、正文匹配
- 可按类型过滤（个股、板块、指标、框架、主题、技术）
- 顶栏搜索框全局可用，回车跳转搜索页

### 5. 导入资料 `/ingest`

**文件上传**：
- 拖拽或点击选择多个文件
- 每个文件可独立指定目标目录（reports/articles/filings/policies/data/notes）
- 智能推断：根据文件名关键词自动匹配目录（如含"报告"→reports，含"政策"→policies）
- 点击"开始上传"逐个上传到 my-wiki 的 `raw/` 对应子目录

**触发 Ingest**：
- 上传完成后，点击"触发 Ingest"
- 自动生成命令并复制到剪贴板（如 `请录入 raw/reports/xxx.md 到知识库`）
- 在 LLM 中粘贴执行即可

### 6. Lint 检查 `/lint`

- **最新报告**：展示最近一次 Lint 报告的摘要和详细内容
- **历史报告**：按日期排列所有 Lint 报告，点击可切换查看
- **触发 Lint**：点击按钮复制命令到剪贴板，在 LLM 中执行

### 7. 操作日志 `/log`

- 时间线展示所有操作日志（从 `wiki/log.md` 解析）
- 可按类型过滤：ingest / lint / query / update / review
- 每条日志可展开查看详情

## 后端 API

### Wiki 内容

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/wiki/index` | GET | 全局索引 |
| `/api/wiki/tree` | GET | 目录树 |
| `/api/wiki/page?path=xxx` | GET | 页面详情（frontmatter + HTML） |
| `/api/wiki/sub-index?type=stocks` | GET | 子索引页面 |
| `/api/wiki/meta` | GET | 元信息（矛盾/问题/清单） |
| `/api/wiki/recent?n=10` | GET | 最近更新页面 |
| `/api/wiki/stats` | GET | 统计数据 |

### 搜索

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/search?q=keyword&type=stock` | GET | 全文搜索 |
| `/api/search/suggest?q=keyword` | GET | 搜索建议 |

### 导入

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/ingest/upload` | POST | 上传文件（FormData: file + directory） |
| `/api/ingest/raw-list` | GET | 列出 raw/ 目录所有文件 |
| `/api/ingest/trigger` | POST | 创建 ingest 任务（body: { files: [...] }） |

### Lint

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/lint/reports` | GET | 列出所有 Lint 报告 |
| `/api/lint/latest` | GET | 最新 Lint 报告 |
| `/api/lint/report/:date` | GET | 指定日期报告 |
| `/api/lint/trigger` | POST | 创建 lint 任务（body: { mode: "full" }） |

### 日志

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/log` | GET | 全部日志 |
| `/api/log/recent?n=20` | GET | 最近日志 |
| `/api/log/filter?type=ingest` | GET | 按类型过滤 |

## WebSocket

连接地址：`ws://localhost:3000/ws`

**服务端推送消息**：

| type | 说明 |
|------|------|
| `connected` | 连接成功 |
| `add` | 新文件添加到 wiki/ |
| `change` | wiki/ 文件内容变更 |
| `unlink` | wiki/ 文件被删除 |

前端收到文件变更消息后自动刷新目录树和统计数据。

## 配置

如需修改 my-wiki 项目路径，编辑 `server/utils/path-resolver.js`：

```js
const WIKI_ROOT = '/Users/liyingfu/Desktop/my-wiki';
```

修改后端端口，编辑 `server/index.js`：

```js
const PORT = process.env.PORT || 3000;
```
