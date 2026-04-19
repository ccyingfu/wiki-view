<template>
  <el-card shadow="hover" class="wiki-card" @click="$emit('click')">
    <div class="card-header">
      <span class="card-title">{{ page.title || page.name }}</span>
      <FrontmatterTag v-if="page.frontmatter" :frontmatter="page.frontmatter" />
    </div>
    <div class="card-meta" v-if="page.frontmatter">
      <span v-if="page.frontmatter.updated" class="card-date">
        <el-icon size="12"><Clock /></el-icon>
        {{ page.frontmatter.updated }}
      </span>
      <span v-if="page.frontmatter.code" class="card-code">{{ page.frontmatter.code }}</span>
    </div>
  </el-card>
</template>

<script setup>
import { Clock } from '@element-plus/icons-vue'
import FrontmatterTag from './FrontmatterTag.vue'

defineProps({
  page: { type: Object, required: true }
})

defineEmits(['click'])
</script>

<style scoped>
.wiki-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.wiki-card:hover {
  transform: translateY(-2px);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card-title {
  font-weight: 600;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
.card-meta .el-icon {
  margin-right: 2px;
}
.card-code {
  font-family: monospace;
  color: #666;
}
</style>
