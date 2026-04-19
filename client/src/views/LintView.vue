<template>
  <div class="lint-view">
    <h2>Lint 检查</h2>
    <el-row :gutter="16">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600">最新报告</span>
              <el-button type="primary" size="small" @click="triggerLint">运行 Lint（复制命令）</el-button>
            </div>
          </template>
          <LintSummary :report="latestReport" />
          <div v-if="latestReport" style="margin-top: 16px">
            <el-divider>详细内容</el-divider>
            <LintIssueList :report="latestReport" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span style="font-weight:600">历史报告</span></template>
          <el-timeline>
            <el-timeline-item
              v-for="report in reports"
              :key="report.date"
              :timestamp="report.date"
              placement="top"
            >
              <el-link @click="loadReport(report.date)">{{ report.filename }}</el-link>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-if="reports.length === 0" description="暂无报告" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import LintSummary from '../components/lint/LintSummary.vue'
import LintIssueList from '../components/lint/LintIssueList.vue'

const latestReport = ref(null)
const reports = ref([])

async function loadLatest() {
  try {
    const { data } = await axios.get('/api/lint/latest')
    if (data.found) {
      latestReport.value = data
    }
  } catch (e) {
    console.error(e)
  }
}

async function loadReport(date) {
  try {
    const { data } = await axios.get(`/api/lint/report/${date}`)
    latestReport.value = data
  } catch (e) {
    ElMessage.error('加载报告失败')
  }
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
  try {
    const { data } = await axios.get('/api/lint/reports')
    reports.value = data
  } catch (e) {
    console.error(e)
  }
  loadLatest()
})
</script>
