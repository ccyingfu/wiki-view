<template>
  <div class="file-uploader">
    <!-- 选择文件区：只用来选文件，不显示自带列表 -->
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      drag
      multiple
    >
      <el-icon size="48" class="upload-icon"><UploadFilled /></el-icon>
      <div class="el-upload__text">拖拽文件到此处，或 <em>点击选择</em></div>
      <template #tip>
        <div class="el-upload__tip">支持 .md / .pdf / .csv / .xlsx / .txt 文件</div>
      </template>
    </el-upload>

    <!-- 待上传文件列表 -->
    <div v-if="pendingFiles.length > 0" class="pending-section">
      <h4>待上传文件 ({{ pendingFiles.length }})</h4>
      <el-table :data="pendingFiles" stripe size="small" style="width: 100%">
        <el-table-column label="文件名" min-width="200">
          <template #default="{ row }">
            <el-icon size="14"><Document /></el-icon>
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column label="目标目录" width="180">
          <template #default="{ row, $index }">
            <el-select v-model="pendingFiles[$index].directory" size="small">
              <el-option label="研报 (reports)" value="reports" />
              <el-option label="文章 (articles)" value="articles" />
              <el-option label="公告 (filings)" value="filings" />
              <el-option label="政策 (policies)" value="policies" />
              <el-option label="数据 (data)" value="data" />
              <el-option label="笔记 (notes)" value="notes" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="100">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ $index }">
            <el-button type="danger" text size="small" @click="removePending($index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        <el-button
          type="primary"
          :loading="uploading"
          :disabled="pendingFiles.length === 0"
          @click="startUpload"
        >
          {{ uploading ? '上传中...' : `开始上传 (${pendingFiles.length} 个文件)` }}
        </el-button>
        <el-button @click="pendingFiles = []">清空列表</el-button>
      </div>
    </div>

    <!-- 已上传文件 -->
    <div v-if="uploadedFiles.length > 0" class="uploaded-section">
      <el-divider />
      <h4>已上传文件 ({{ uploadedFiles.length }})</h4>
      <el-table :data="uploadedFiles" stripe size="small" style="width: 100%">
        <el-table-column prop="path" label="路径" />
        <el-table-column label="大小" width="100">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        <el-button type="primary" @click="triggerIngest">
          触发 Ingest（复制命令到剪贴板）
        </el-button>
        <el-button @click="uploadedFiles = []">清空</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import axios from 'axios'

const pendingFiles = ref([])
const uploadedFiles = ref([])
const uploading = ref(false)

// 目录智能推断
function guessDirectory(filename) {
  const lower = filename.toLowerCase()
  if (/报告|研报|分析|深度|解析/.test(lower)) return 'reports'
  if (/文章|采访|媒体|公开/.test(lower)) return 'articles'
  if (/公告|年报|季报|财报|filing/.test(lower)) return 'filings'
  if (/政策|规定|法规|意见|通知/.test(lower)) return 'policies'
  if (/数据|csv|excel|\.csv|\.xlsx/.test(lower)) return 'data'
  return 'notes'
}

function handleFileChange(uploadFile) {
  const allowed = ['.md', '.pdf', '.csv', '.xlsx', '.txt']
  const name = uploadFile.name
  const ext = name.substring(name.lastIndexOf('.')).toLowerCase()
  if (!allowed.includes(ext)) {
    ElMessage.error(`不支持的文件格式: ${ext}`)
    return
  }
  // 检查待上传列表中是否已存在
  if (pendingFiles.value.some(f => f.name === name)) {
    ElMessage.warning(`文件已在列表中: ${name}`)
    return
  }
  pendingFiles.value.push({
    name,
    size: uploadFile.size,
    directory: guessDirectory(name),
    rawFile: uploadFile.raw
  })
}

function removePending(index) {
  pendingFiles.value.splice(index, 1)
}

async function startUpload() {
  uploading.value = true
  let successCount = 0
  let failCount = 0

  // 逐个上传，每个文件带上自己的目录
  for (const file of pendingFiles.value) {
    const formData = new FormData()
    formData.append('file', file.rawFile)
    formData.append('directory', file.directory)

    try {
      const { data } = await axios.post('/api/ingest/upload', formData)
      uploadedFiles.value.push(data)
      successCount++
    } catch (e) {
      failCount++
      ElMessage.error(`上传失败: ${file.name}`)
    }
  }

  uploading.value = false
  pendingFiles.value = []

  if (successCount > 0) {
    ElMessage.success(`成功上传 ${successCount} 个文件${failCount > 0 ? `，${failCount} 个失败` : ''}`)
  }
}

async function triggerIngest() {
  const files = uploadedFiles.value.map(f => f.path)
  try {
    const { data } = await axios.post('/api/ingest/trigger', { files })
    await navigator.clipboard.writeText(data.command)
    ElMessage.success('命令已复制到剪贴板，请在 LLM 中执行')
  } catch (e) {
    ElMessage.error('触发失败')
  }
}

function formatSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.file-uploader {
  max-width: 700px;
}
.upload-icon {
  color: #c0c4cc;
}
.pending-section {
  margin-top: 20px;
}
.pending-section h4,
.uploaded-section h4 {
  margin-bottom: 12px;
}
</style>
