<template>
  <div class="log-view">
    <h2>操作日志</h2>
    <div class="log-filters">
      <el-radio-group v-model="filterType" @change="loadLogs" size="small">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="ingest">录入</el-radio-button>
        <el-radio-button value="lint">检查</el-radio-button>
        <el-radio-button value="query">查询</el-radio-button>
        <el-radio-button value="update">更新</el-radio-button>
        <el-radio-button value="review">复盘</el-radio-button>
      </el-radio-group>
    </div>
    <el-timeline class="log-timeline">
      <el-timeline-item
        v-for="entry in logs"
        :key="entry.date + entry.description"
        :timestamp="entry.date"
        :type="opType(entry.operation)"
        placement="top"
      >
        <el-card shadow="never">
          <div class="log-entry">
            <div class="log-header">
              <el-tag :type="opTagType(entry.operation)" size="small">{{ opLabel(entry.operation) }}</el-tag>
              <span class="log-desc">{{ entry.description }}</span>
            </div>
            <el-collapse>
              <el-collapse-item title="详情">
                <MarkdownRender :html="entry.html" />
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-if="logs.length === 0" description="暂无日志" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MarkdownRender from '../components/wiki/MarkdownRender.vue'

const logs = ref([])
const filterType = ref('')

function opType(op) {
  const map = { ingest: 'success', lint: 'warning', query: 'primary', update: '', review: 'info' }
  return map[op] || ''
}

function opTagType(op) {
  return opType(op) || ''
}

function opLabel(op) {
  const map = { ingest: '录入', lint: '检查', query: '查询', update: '更新', review: '复盘', fix: '修复', analysis: '分析', init: '初始化' }
  return map[op] || op
}

async function loadLogs() {
  try {
    const url = filterType.value
      ? `/api/log/filter?type=${filterType.value}`
      : '/api/log'
    const { data } = await axios.get(url)
    logs.value = data
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadLogs)
</script>

<style scoped>
.log-filters {
  margin: 16px 0;
}
.log-timeline {
  margin-top: 16px;
}
.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.log-desc {
  font-weight: 500;
}
</style>
