<template>
  <div class="sidebar">
    <div class="sidebar-logo" @click="$router.push('/')">
      <el-icon size="24"><DataAnalysis /></el-icon>
      <span v-if="!uiStore.sidebarCollapsed" class="logo-text">Wiki-View</span>
    </div>
    <el-menu
      :default-active="currentRoute"
      :collapse="uiStore.sidebarCollapsed"
      background-color="#001529"
      text-color="rgba(255,255,255,0.65)"
      active-text-color="#1890ff"
      router
    >
      <el-menu-item index="/">
        <el-icon><Odometer /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>
      <el-menu-item index="/explore">
        <el-icon><FolderOpened /></el-icon>
        <template #title>目录浏览</template>
      </el-menu-item>
      <el-menu-item index="/search">
        <el-icon><Search /></el-icon>
        <template #title>搜索</template>
      </el-menu-item>
      <el-menu-item index="/ingest">
        <el-icon><Upload /></el-icon>
        <template #title>导入资料</template>
      </el-menu-item>
      <el-menu-item index="/lint">
        <el-icon><CircleCheck /></el-icon>
        <template #title>Lint 检查</template>
      </el-menu-item>
      <el-menu-item index="/log">
        <el-icon><Document /></el-icon>
        <template #title>操作日志</template>
      </el-menu-item>
    </el-menu>
    <div class="sidebar-footer">
      <div class="ws-status" :class="{ connected: uiStore.wsConnected }">
        <span class="ws-dot"></span>
        <span v-if="!uiStore.sidebarCollapsed">{{ uiStore.wsConnected ? '已连接' : '未连接' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '../../stores/ui'

const route = useRoute()
const uiStore = useUiStore()

const currentRoute = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.logo-text {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}
.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.ws-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.45);
  font-size: 12px;
}
.ws-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4d4f;
}
.ws-status.connected .ws-dot {
  background: #52c41a;
}
.el-menu {
  border-right: none;
}
</style>
