<template>
  <el-card v-if="report" class="lint-summary">
    <template #header>
      <div class="summary-header">
        <span>Lint 报告 - {{ report.date }}</span>
        <el-tag :type="hasIssues ? 'warning' : 'success'" effect="dark">
          {{ hasIssues ? `${report.frontmatter.issuesFound} 个问题` : '健康' }}
        </el-tag>
      </div>
    </template>
    <el-descriptions :column="2" border size="small">
      <el-descriptions-item label="扫描页面">{{ report.frontmatter.pagesChecked }}</el-descriptions-item>
      <el-descriptions-item label="发现问题">{{ report.frontmatter.issuesFound }}</el-descriptions-item>
      <el-descriptions-item label="自动修复">{{ report.frontmatter.autoFixed }}</el-descriptions-item>
      <el-descriptions-item label="待确认">{{ report.frontmatter.needsReview }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
  <el-card v-else>
    <el-empty description="暂无 Lint 报告" />
  </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  report: { type: Object, default: null }
})

const hasIssues = computed(() => props.report?.frontmatter?.issuesFound > 0)
</script>

<style scoped>
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
</style>
