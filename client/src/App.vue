<template>
  <el-container class="app-container">
    <el-aside :width="uiStore.sidebarCollapsed ? '64px' : '260px'" class="app-aside">
      <AppSidebar />
    </el-aside>
    <el-container>
      <el-header class="app-header" height="56px">
        <AppHeader />
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUiStore } from './stores/ui'
import { useWikiStore } from './stores/wiki'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'

const uiStore = useUiStore()
const wikiStore = useWikiStore()

let ws = null

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${protocol}//${window.location.hostname}:3000/ws`
  ws = new WebSocket(url)
  
  ws.onopen = () => {
    uiStore.setWsConnected(true)
  }
  
  ws.onclose = () => {
    uiStore.setWsConnected(false)
    // 3秒后重连
    setTimeout(connectWebSocket, 3000)
  }
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'change' || data.type === 'add' || data.type === 'unlink') {
      // 刷新数据
      wikiStore.fetchTree()
      wikiStore.fetchStats()
    }
  }
}

onMounted(() => {
  wikiStore.fetchTree()
  wikiStore.fetchStats()
  wikiStore.fetchIndex()
  connectWebSocket()
})

onUnmounted(() => {
  if (ws) ws.close()
})
</script>

<style scoped>
.app-container {
  height: 100vh;
}
.app-aside {
  background: #001529;
  transition: width 0.3s;
  overflow: hidden;
}
.app-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
  display: flex;
  align-items: center;
}
.app-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
