import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const searchVisible = ref(false)
  const wsConnected = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSearchVisible(v) {
    searchVisible.value = v
  }

  function setWsConnected(v) {
    wsConnected.value = v
  }

  return {
    sidebarCollapsed, searchVisible, wsConnected,
    toggleSidebar, setSearchVisible, setWsConnected
  }
})
