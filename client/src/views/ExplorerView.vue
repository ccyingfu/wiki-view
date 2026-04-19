<template>
  <div class="explorer">
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card class="tree-card">
          <template #header>
            <div class="tree-header">
              <span style="font-weight:600">Wiki 目录</span>
              <el-button text size="small" @click="expandAll">全部展开</el-button>
            </div>
          </template>
          <WikiTree
            :nodes="wikiStore.tree"
            :selected-path="selectedPath"
            :expanded-keys="expandedKeys"
            @select="handleSelect"
          />
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card v-if="currentDir">
          <template #header>
            <div class="content-header">
              <span style="font-weight:600">{{ currentDir.name }}</span>
              <el-tag size="small">{{ dirFiles.length }} 个文件</el-tag>
            </div>
          </template>
          <el-row :gutter="12">
            <el-col :span="8" v-for="file in dirFiles" :key="file.path" style="margin-bottom: 12px">
              <WikiCard :page="file" @click="openPage(file)" />
            </el-col>
          </el-row>
          <el-empty v-if="dirFiles.length === 0" description="此目录下无文件" />
        </el-card>
        <el-card v-else>
          <el-empty description="选择左侧目录查看内容" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWikiStore } from '../stores/wiki'
import WikiTree from '../components/wiki/WikiTree.vue'
import WikiCard from '../components/wiki/WikiCard.vue'

const router = useRouter()
const wikiStore = useWikiStore()
const expandedKeys = ref(new Set(['entities', 'concepts', 'analyses', 'meta']))
const selectedPath = ref('')
const currentDir = ref(null)

const dirFiles = computed(() => {
  if (!currentDir.value) return []
  return currentDir.value.children?.filter(c => c.type === 'file') || []
})

function handleSelect(node) {
  if (node.type === 'directory') {
    if (expandedKeys.value.has(node.path)) {
      expandedKeys.value.delete(node.path)
    } else {
      expandedKeys.value.add(node.path)
    }
    expandedKeys.value = new Set(expandedKeys.value)
    currentDir.value = node
    selectedPath.value = node.path
  } else {
    openPage(node)
  }
}

function openPage(file) {
  router.push({ path: '/page', query: { path: file.path } })
}

function expandAll() {
  const keys = new Set()
  function collect(nodes) {
    for (const n of nodes) {
      if (n.type === 'directory') {
        keys.add(n.path)
        if (n.children) collect(n.children)
      }
    }
  }
  collect(wikiStore.tree)
  expandedKeys.value = keys
}

onMounted(() => {
  wikiStore.fetchTree()
})
</script>

<style scoped>
.tree-card {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
