<template>
  <el-drawer
    v-model="visible"
    title="配置 JSON"
    direction="rtl"
    size="50%"
    :before-close="handleClose"
  >
    <div class="json-viewer-container">
      <!-- 操作按钮 -->
      <div class="json-actions">
        <el-button
          type="primary"
          size="small"
          @click="copyToClipboard"
        >
          <el-icon><DocumentCopy /></el-icon>
          复制 JSON
        </el-button>
        <el-button
          size="small"
          @click="downloadJson"
        >
          <el-icon><Download /></el-icon>
          下载 JSON
        </el-button>
      </div>

      <!-- JSON 展示区域 -->
      <div class="json-content">
        <vue-json-pretty
          :data="jsonData"
          :deep="3"
          :show-length="true"
          :show-line="true"
          :show-double-quotes="true"
          :highlight-mouseover-node="true"
          :collapsed-on-click-brackets="true"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { DocumentCopy, Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

interface Props {
  modelValue: boolean;
  data: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const jsonData = computed(() => props.data);

function handleClose() {
  visible.value = false;
}

/**
 * 复制 JSON 到剪贴板
 */
async function copyToClipboard() {
  try {
    const jsonString = JSON.stringify(props.data, null, 2);
    await navigator.clipboard.writeText(jsonString);
    ElMessage.success('JSON 已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
    console.error('复制失败:', error);
  }
}

/**
 * 下载 JSON 文件
 */
function downloadJson() {
  try {
    const jsonString = JSON.stringify(props.data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `designer-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('JSON 文件已下载');
  } catch (error) {
    ElMessage.error('下载失败');
    console.error('下载失败:', error);
  }
}
</script>

<style lang="scss" scoped>
.json-viewer-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .json-actions {
    padding: 0 0 16px 0;
    display: flex;
    gap: 10px;
    border-bottom: 1px solid var(--el-border-color);
    margin-bottom: 16px;
  }

  .json-content {
    flex: 1;
    overflow: auto;
    background-color: var(--el-fill-color-light);
    padding: 16px;
    border-radius: var(--el-border-radius-base);

    :deep(.vjs-tree) {
      font-size: 14px;
      line-height: 1.6;
    }

    :deep(.vjs-key) {
      color: var(--el-color-warning);
    }

    :deep(.vjs-value__string) {
      color: var(--el-color-success);
    }

    :deep(.vjs-value__number) {
      color: var(--el-color-danger);
    }

    :deep(.vjs-value__boolean) {
      color: var(--el-color-warning);
    }

    :deep(.vjs-tree-node:hover) {
      background-color: var(--el-fill-color);
    }
  }
}
</style>
