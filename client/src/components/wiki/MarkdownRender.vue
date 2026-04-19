<template>
  <div class="wiki-markdown" v-html="html"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  html: { type: String, default: '' }
})
</script>
