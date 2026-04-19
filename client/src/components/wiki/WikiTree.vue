<template>
  <div class="wiki-tree">
    <div
      v-for="node in nodes"
      :key="node.path"
      class="tree-node"
    >
      <div
        class="tree-node-content"
        :class="{ active: selectedPath === node.path }"
        @click="handleClick(node)"
      >
        <el-icon v-if="node.type === 'directory'" size="14">
          <FolderOpened v-if="expandedKeys.has(node.path)" />
          <Folder v-else />
        </el-icon>
        <el-icon v-else size="14"><Document /></el-icon>
        <span class="node-label">{{ node.name }}</span>
        <el-tag v-if="node.type === 'file' && node.frontmatter?.type" size="small" :class="'type-tag type-tag-' + node.frontmatter.type" effect="plain">
          {{ typeLabel(node.frontmatter.type) }}
        </el-tag>
      </div>
      <div v-if="node.type === 'directory' && expandedKeys.has(node.path)" class="tree-children">
        <WikiTree
          :nodes="node.children"
          :selected-path="selectedPath"
          :expanded-keys="expandedKeys"
          @select="$emit('select', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Folder, FolderOpened, Document } from '@element-plus/icons-vue'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  selectedPath: { type: String, default: '' },
  expandedKeys: { type: Set, default: () => new Set() }
})

const emit = defineEmits(['select'])

function typeLabel(type) {
  const map = {
    stock: '个股', sector: '板块', indicator: '指标', person: '人物',
    framework: '框架', theme: '主题', theory: '理论', technology: '技术',
    review: '复盘', comparison: '对比', 'deep-dive': '深度',
    'ingest-summary': '摘要', 'lint-report': 'Lint'
  }
  return map[type] || type
}

function handleClick(node) {
  emit('select', node)
}
</script>

<style scoped>
.wiki-tree {
  font-size: 14px;
}
.tree-node-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}
.tree-node-content:hover {
  background: #f5f5f5;
}
.tree-node-content.active {
  background: #e6f7ff;
  color: #1890ff;
}
.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tree-children {
  padding-left: 16px;
}
</style>
