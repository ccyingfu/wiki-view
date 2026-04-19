<template>
  <div class="ingest-view">
    <h2>导入资料</h2>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header><span style="font-weight:600">上传文件</span></template>
          <FileUploader />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span style="font-weight:600">Raw 目录文件</span></template>
          <el-table :data="rawFiles" stripe size="small" max-height="500">
            <el-table-column prop="name" label="文件名" />
            <el-table-column prop="path" label="路径" show-overflow-tooltip />
            <el-table-column label="大小" width="100">
              <template #default="{ row }">{{ formatSize(row.size) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import FileUploader from '../components/ingest/FileUploader.vue'

const rawFiles = ref([])

function formatSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/ingest/raw-list')
    rawFiles.value = data
  } catch (e) {
    console.error(e)
  }
})
</script>
