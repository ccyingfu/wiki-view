<template>
  <div class="page-view" v-loading="wikiStore.loading">
    <el-page-header v-if="page" @back="$router.back()">
      <template #content>
        <span class="page-title">{{ page.frontmatter?.title || pageTitle }}</span>
        <FrontmatterTag v-if="page.frontmatter" :frontmatter="page.frontmatter" style="margin-left: 12px" />
      </template>
    </el-page-header>
    <div v-if="page" class="page-content">
      <el-row :gutter="16">
        <el-col :span="18">
          <el-card>
            <MarkdownRender :html="page.html" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card v-if="page.frontmatter" class="meta-card">
            <template #header><span style="font-weight:600">元信息</span></template>
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item v-if="page.frontmatter.type" label="类型">{{ page.frontmatter.type }}</el-descriptions-item>
              <el-descriptions-item v-if="page.frontmatter.code" label="代码">{{ page.frontmatter.code }}</el-descriptions-item>
              <el-descriptions-item v-if="page.frontmatter.sector" label="板块">{{ page.frontmatter.sector }}</el-descriptions-item>
              <el-descriptions-item v-if="page.frontmatter.status" label="状态">{{ page.frontmatter.status }}</el-descriptions-item>
              <el-descriptions-item v-if="page.frontmatter.sources" label="来源数">{{ page.frontmatter.sources }}</el-descriptions-item>
              <el-descriptions-item v-if="page.frontmatter.created" label="创建">{{ page.frontmatter.created }}</el-descriptions-item>
              <el-descriptions-item v-if="page.frontmatter.updated" label="更新">{{ page.frontmatter.updated }}</el-descriptions-item>
            </el-descriptions>
            <div v-if="page.frontmatter.tags?.length" style="margin-top: 12px">
              <strong>标签：</strong>
              <el-tag v-for="tag in page.frontmatter.tags" :key="tag" size="small" style="margin: 2px">{{ tag }}</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <el-empty v-else-if="!wikiStore.loading" description="页面未找到" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWikiStore } from '../stores/wiki'
import MarkdownRender from '../components/wiki/MarkdownRender.vue'
import FrontmatterTag from '../components/wiki/FrontmatterTag.vue'

const route = useRoute()
const wikiStore = useWikiStore()

const page = computed(() => wikiStore.currentPage)
const pageTitle = computed(() => {
  const p = route.query.path || ''
  return p.split('/').pop()?.replace('.md', '') || ''
})

watch(() => route.query.path, (newPath) => {
  if (newPath) {
    wikiStore.fetchPage(newPath)
  }
}, { immediate: true })
</script>

<style scoped>
.page-view {
  min-height: 60vh;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
}
.page-content {
  margin-top: 20px;
}
.meta-card {
  position: sticky;
  top: 76px;
}
</style>
