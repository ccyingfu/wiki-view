<template>
  <div class="lint-issue-list" v-if="report">
    <MarkdownRender :html="report.html" />
  </div>
</template>

<script setup>
import MarkdownRender from '../wiki/MarkdownRender.vue'

defineProps({
  report: { type: Object, default: null }
})
</script>
