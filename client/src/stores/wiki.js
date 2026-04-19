import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useWikiStore = defineStore('wiki', () => {
  const tree = ref([])
  const currentIndex = ref(null)
  const currentPage = ref(null)
  const stats = ref(null)
  const recentPages = ref([])
  const meta = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const stocksCount = computed(() => stats.value?.byType?.stock || 0)
  const sectorsCount = computed(() => stats.value?.byType?.sector || 0)
  const indicatorsCount = computed(() => stats.value?.byType?.indicator || 0)
  const conceptsCount = computed(() => stats.value?.byCategory?.concepts || 0)
  const analysesCount = computed(() => stats.value?.byCategory?.analyses || 0)

  async function fetchTree() {
    loading.value = true
    try {
      const { data } = await axios.get('/api/wiki/tree')
      tree.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchIndex() {
    try {
      const { data } = await axios.get('/api/wiki/index')
      currentIndex.value = data
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchPage(path) {
    loading.value = true
    try {
      const { data } = await axios.get('/api/wiki/page', { params: { path } })
      currentPage.value = data
      return data
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const { data } = await axios.get('/api/wiki/stats')
      stats.value = data
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchRecent(n = 10) {
    try {
      const { data } = await axios.get('/api/wiki/recent', { params: { n } })
      recentPages.value = data
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchMeta() {
    try {
      const { data } = await axios.get('/api/wiki/meta')
      meta.value = data
    } catch (e) {
      error.value = e.message
    }
  }

  return {
    tree, currentIndex, currentPage, stats, recentPages, meta, loading, error,
    stocksCount, sectorsCount, indicatorsCount, conceptsCount, analysesCount,
    fetchTree, fetchIndex, fetchPage, fetchStats, fetchRecent, fetchMeta
  }
})
