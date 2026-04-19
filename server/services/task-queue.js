const fs = require('fs');
const path = require('path');
const { getWikiRoot } = require('../utils/path-resolver');

const TASKS_DIR = path.join(getWikiRoot(), '.qoder', 'tasks');

// 确保任务目录存在
function ensureTasksDir() {
  if (!fs.existsSync(TASKS_DIR)) {
    fs.mkdirSync(TASKS_DIR, { recursive: true });
  }
}

// 创建 ingest 任务
function createIngestTask(files) {
  ensureTasksDir();
  const task = {
    type: 'ingest',
    files,
    created: new Date().toISOString(),
    status: 'pending'
  };
  const taskPath = path.join(TASKS_DIR, 'pending-ingest.json');
  fs.writeFileSync(taskPath, JSON.stringify(task, null, 2), 'utf-8');
  return task;
}

// 创建 lint 任务
function createLintTask(mode = 'full') {
  ensureTasksDir();
  const task = {
    type: 'lint',
    mode,
    created: new Date().toISOString(),
    status: 'pending'
  };
  const taskPath = path.join(TASKS_DIR, 'pending-lint.json');
  fs.writeFileSync(taskPath, JSON.stringify(task, null, 2), 'utf-8');
  return task;
}

// 读取待处理任务
function getPendingTasks() {
  ensureTasksDir();
  const tasks = [];
  const files = fs.readdirSync(TASKS_DIR);
  
  for (const file of files) {
    if (file.startsWith('pending-') && file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(path.join(TASKS_DIR, file), 'utf-8');
        tasks.push(JSON.parse(content));
      } catch (e) {
        // 忽略
      }
    }
  }
  return tasks;
}

module.exports = {
  createIngestTask,
  createLintTask,
  getPendingTasks
};
