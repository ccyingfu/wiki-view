<template>
  <div class="header">
    <el-button :icon="uiStore.sidebarCollapsed ? Expand : Fold" text @click="uiStore.toggleSidebar" />
    <AppBreadcrumb />
    <div class="header-right">
      <el-input
        v-model="searchQuery"
        placeholder="搜索 Wiki..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @keyup.enter="handleSearch"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Expand, Fold, Search } from '@element-plus/icons-vue'
import { useUiStore } from '../../stores/ui'
import AppBreadcrumb from './AppBreadcrumb.vue'

const router = useRouter()
const uiStore = useUiStore()
const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.header-right {
  margin-left: auto;
}
</style>
