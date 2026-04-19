<template>
  <div class="dashboard">
    <h2>知识库概览</h2>
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="4" v-for="card in statCards" :key="card.label">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 20px">
      <el-col :span="16">
        <el-card>
          <template #header><span style="font-weight:600">最近活动</span></template>
          <el-timeline>
            <el-timeline-item
              v-for="entry in recentLogs"
              :key="entry.date + entry.description"
              :timestamp="entry.date"
              placement="top"
            >
              <el-tag :type="opTagType(entry.operation) || undefined" size="small">{{ opLabel(entry.operation) }}</el-tag>
              {{ entry.description }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span style="font-weight:600">Lint 状态</span></template>
          <LintSummary :report="latestLint" />
        </el-card>
        <el-card style="margin-top: 16px">
          <template #header><span style="font-weight:600">快速操作</span></template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/ingest')">
              <el-icon><Upload /></el-icon> 导入资料
            </el-button>
            <el-button @click="triggerLint">
              <el-icon><CircleCheck /></el-icon> 运行 Lint
            </el-button>
            <el-button @click="$router.push('/search')">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Upload, CircleCheck, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useWikiStore } from '../stores/wiki'
import LintSummary from '../components/lint/LintSummary.vue'

const wikiStore = useWikiStore()
const recentLogs = ref([])
const latestLint = ref(null)

const statCards = computed(() => [
  { label: '总页面', value: wikiStore.stats?.total || 0 },
  { label: '个股', value: wikiStore.stocksCount },
  { label: '板块', value: wikiStore.sectorsCount },
  { label: '指标', value: wikiStore.indicatorsCount },
  { label: '概念', value: wikiStore.conceptsCount },
  { label: '分析', value: wikiStore.analysesCount }
])

function opTagType(op) {
  const map = { ingest: 'success', lint: 'warning', query: 'primary', update: '', review: 'info' }
  return map[op] || ''
}

function opLabel(op) {
  const map = { ingest: '录入', lint: '检查', query: '查询', update: '更新', review: '复盘', fix: '修复', analysis: '分析', init: '初始化' }
  return map[op] || op
}

async function triggerLint() {
  try {
    const { data } = await axios.post('/api/lint/trigger', { mode: 'full' })
    await navigator.clipboard.writeText(data.command)
    ElMessage.success('Lint 命令已复制到剪贴板')
  } catch (e) {
    ElMessage.error('触发失败')
  }
}

onMounted(async () => {
  wikiStore.fetchStats()
  try {
    const [logsRes, lintRes] = await Promise.all([
      axios.get('/api/log/recent?n=5'),
      axios.get('/api/lint/latest')
    ])
    recentLogs.value = logsRes.data
    if (lintRes.data.found) {
      latestLint.value = lintRes.data
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.stat-cards {
  margin-top: 16px;
}
.stat-card {
  text-align: center;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
}
.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
