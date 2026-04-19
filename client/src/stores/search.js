import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const results = ref([])
  const suggestions = ref([])
  const loading = ref(false)
  const filterType = ref(null)
  const totalResults = ref(0)

  async function search(q, type = null, limit = 20) {
    if (!q || q.trim().length < 2) {
      results.value = []
      return
    }
    loading.value = true
    query.value = q
    filterType.value = type
    try {
      const { data } = await axios.get('/api/search', {
        params: { q, type, limit }
      })
      results.value = data
      totalResults.value = data.length
    } catch (e) {
      console.error('Search error:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchSuggestions(q) {
    if (!q || q.trim().length < 1) {
      suggestions.value = []
      return
    }
    try {
      const { data } = await axios.get('/api/search/suggest', {
        params: { q, limit: 8 }
      })
      suggestions.value = data
    } catch (e) {
      console.error('Suggestion error:', e)
    }
  }

  function clearResults() {
    query.value = ''
    results.value = []
    suggestions.value = []
    filterType.value = null
  }

  return {
    query, results, suggestions, loading, filterType, totalResults,
    search, fetchSuggestions, clearResults
  }
})
