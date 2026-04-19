<template>
  <div class="frontmatter-tags">
    <el-tag
      v-if="frontmatter.type"
      :class="'type-tag type-tag-' + frontmatter.type"
      size="small"
      effect="plain"
    >
      {{ typeLabel }}
    </el-tag>
    <el-tag
      v-if="frontmatter.status"
      :type="statusType"
      size="small"
      effect="light"
    >
      {{ statusLabel }}
    </el-tag>
    <el-tag
      v-for="tag in displayTags"
      :key="tag"
      size="small"
      effect="plain"
    >
      {{ tag }}
    </el-tag>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  frontmatter: { type: Object, required: true }
})

const typeMap = {
  stock: '个股', sector: '板块', indicator: '指标', person: '人物',
  framework: '框架', theme: '主题', theory: '理论', technology: '技术',
  review: '复盘', comparison: '对比', 'deep-dive': '深度',
  'ingest-summary': '摘要', 'lint-report': 'Lint'
}

const statusMap = {
  active: '活跃', watching: '关注', archived: '归档',
  difficult: '困境', pending: '待验证', resolved: '已解决'
}

const typeLabel = computed(() => typeMap[props.frontmatter.type] || props.frontmatter.type)
const statusLabel = computed(() => statusMap[props.frontmatter.status] || props.frontmatter.status)
const statusType = computed(() => {
  const map = { active: 'success', watching: 'primary', archived: 'info', difficult: 'warning', pending: 'warning', resolved: 'success' }
  return map[props.frontmatter.status] || ''
})

const displayTags = computed(() => {
  const tags = props.frontmatter.tags || []
  return Array.isArray(tags) ? tags.slice(0, 3) : []
})
</script>

<style scoped>
.frontmatter-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
