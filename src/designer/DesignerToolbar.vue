<template>
  <div class="designer-toolbar">
    <div class="toolbar-left">
      <!-- 撤销/重做按钮组 -->
      <el-button-group>
        <el-button
          :disabled="!canUndo"
          @click="handleUndo"
          title="撤销 (Ctrl+Z)"
        >
          <el-icon><Back /></el-icon>
          撤销
        </el-button>
        <el-button
          :disabled="!canRedo"
          @click="handleRedo"
          title="重做 (Ctrl+Y)"
        >
          <el-icon><Right /></el-icon>
          重做
        </el-button>
      </el-button-group>

      <!-- 操作按钮组 -->
      <el-button-group>
        <el-button @click="handleClear" title="清空画布">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
        <el-button @click="handleViewJson" title="查看 JSON">
          <el-icon><Document /></el-icon>
          查看 JSON
        </el-button>
        <el-button @click="handleExport" title="导出配置">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button @click="handleImport" title="导入配置">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
      </el-button-group>
    </div>

    <!-- 状态信息 -->
    <div class="toolbar-right">
      <el-button @click="handlePreview" title="预览"> 预览 </el-button>
      <el-button @click="handleSave" type="primary" title="导入配置">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Back,
  Right,
  Delete,
  Download,
  Upload,
  Document,
  View,
} from '@element-plus/icons-vue';

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  componentCount: number;
  historySize: number;
}

defineProps<Props>();

const emit = defineEmits<{
  undo: [];
  redo: [];
  clear: [];
  preview: [];
  viewJson: [];
  export: [];
  import: [];
  save: [];
}>();

function handleUndo() {
  emit('undo');
}

function handleRedo() {
  emit('redo');
}

function handleClear() {
  emit('clear');
}

function handlePreview() {
  emit('preview');
}

function handleViewJson() {
  emit('viewJson');
}

function handleExport() {
  emit('export');
}

function handleImport() {
  emit('import');
}

function handleSave() {
  emit('save');
}
</script>

<style lang="scss" scoped>
.designer-toolbar {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 8px 16px;
  box-sizing: border-box;
  flex-shrink: 0; // 防止被压缩
  overflow: hidden; // 防止内容溢出
  min-height: 0;
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
  }

  .el-button-group {
    display: inline-flex;
  }
}
</style>
