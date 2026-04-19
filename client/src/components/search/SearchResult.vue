<template>
  <div class="search-result" @click="$emit('click')">
    <div class="result-header">
      <span class="result-title">{{ item.item.title }}</span>
      <FrontmatterTag :frontmatter="item.item.frontmatter" />
    </div>
    <div class="result-path">{{ item.item.path }}</div>
    <div class="result-snippet" v-if="snippet">
      {{ snippet }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FrontmatterTag from '../wiki/FrontmatterTag.vue'

const props = defineProps({
  item: { type: Object, required: true }
})

defineEmits(['click'])

const snippet = computed(() => {
  const content = props.item.item.content || ''
  return content.substring(0, 150) + (content.length > 150 ? '...' : '')
})
</script>

<style scoped>
.search-result {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}
.search-result:hover {
  background: #fafafa;
}
.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.result-title {
  font-weight: 600;
  font-size: 15px;
}
.result-path {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.result-snippet {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  line-height: 1.5;
}
</style>
