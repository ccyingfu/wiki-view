<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.to">
      {{ item.label }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const nameMap = {
  dashboard: '仪表盘',
  explore: '目录浏览',
  page: '页面详情',
  search: '搜索',
  ingest: '导入资料',
  lint: 'Lint 检查',
  log: '操作日志'
}

const breadcrumbs = computed(() => {
  const items = []
  if (route.name && route.name !== 'dashboard') {
    items.push({
      label: nameMap[route.name] || route.name,
      to: route.path === '/page' ? undefined : { path: route.path }
    })
  }
  return items
})
</script>
