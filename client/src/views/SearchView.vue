<template>
  <div class="search-view">
    <h2>搜索 Wiki</h2>
    <div class="search-bar">
      <el-input
        v-model="query"
        placeholder="输入关键词搜索..."
        size="large"
        clearable
        @keyup.enter="doSearch"
      >
        <template #append>
          <el-button @click="doSearch" :loading="searchStore.loading">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      <div class="search-filters">
        <el-radio-group v-model="filterType" @change="doSearch" size="small">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="stock">个股</el-radio-button>
          <el-radio-button value="sector">板块</el-radio-button>
          <el-radio-button value="indicator">指标</el-radio-button>
          <el-radio-button value="framework">框架</el-radio-button>
          <el-radio-button value="theme">主题</el-radio-button>
          <el-radio-button value="technology">技术</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="search-results" v-if="searchStore.results.length > 0">
      <p class="result-count">找到 {{ searchStore.totalResults }} 个结果</p>
      <SearchResult
        v-for="item in searchStore.results"
        :key="item.item.path"
        :item="item"
        @click="openPage(item.item)"
      />
    </div>
    <el-empty v-else-if="query && searched" description="未找到相关结果" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useSearchStore } from '../stores/search'
import SearchResult from '../components/search/SearchResult.vue'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()
const query = ref('')
const filterType = ref('')
const searched = ref(false)

function doSearch() {
  if (query.value.trim()) {
    searched.value = true
    searchStore.search(query.value, filterType.value || null)
  }
}

function openPage(item) {
  router.push({ path: '/page', query: { path: item.path } })
}

onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q
    doSearch()
  }
})

watch(() => route.query.q, (newQ) => {
  if (newQ) {
    query.value = newQ
    doSearch()
  }
})
</script>

<style scoped>
.search-bar {
  margin-top: 16px;
  max-width: 700px;
}
.search-filters {
  margin-top: 12px;
}
.search-results {
  margin-top: 20px;
}
.result-count {
  color: #999;
  margin-bottom: 8px;
}
</style>
