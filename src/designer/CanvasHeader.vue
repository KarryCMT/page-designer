<template>
  <div class="canvas-header">
    <div class="canvas-info-left">
      <!-- 操作按钮组 -->
      <div class="item" @click="handleClear" title="清空画布">
        <el-icon><Delete /></el-icon>
      </div>
      <el-divider direction="vertical" />
      <div class="item" @click="handleViewJson" title="查看 JSON">
        <el-icon><Document /></el-icon>
      </div>
      <el-divider direction="vertical" />
      <div class="item" @click="handleExport" title="导出配置">
        <el-icon><Download /></el-icon>
      </div>
      <el-divider direction="vertical" />
      <div class="item" @click="handleImport" title="导入配置">
        <el-icon><Upload /></el-icon>
      </div>
    </div>
    <div class="canvas-info-right">
      <div class="item search">
        <el-icon size="16"><Monitor /></el-icon>
      </div>
      <el-divider direction="vertical" />
      <div class="item search">
        <el-icon size="16"><Iphone /></el-icon>
      </div>
      <el-divider direction="vertical" />
      <div class="item search">
        <el-icon size="16"><Clock /></el-icon>
      </div>
      <el-divider direction="vertical" />
      <div class="item search">
        <el-icon size="16">
          <Search />
        </el-icon>
      </div>
      <el-divider direction="vertical" />
      <div class="item page-attr">页面属性</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Clock,
  Delete,
  Document,
  Download,
  Histogram,
  Iphone,
  Monitor,
  Search,
  Upload,
} from '@element-plus/icons-vue';
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

function handleViewJson() {
  emit('viewJson');
}

function handleExport() {
  emit('export');
}

function handleImport() {
  emit('import');
}
// 组件无需 props 和 emits，仅作为静态展示
function handleUndo() {
  emit('undo');
}

function handleRedo() {
  emit('redo');
}

function handleClear() {
  emit('clear');
}
</script>

<style lang="scss" scoped>
.canvas-header {
  min-height: 40px;
  padding: 4px 16px;
  background-color: var(--el-bg-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; // 防止被压缩
  overflow: hidden; // 防止内容溢出

  .canvas-info-left {
    color: var(--el-text-color-regular);
    font-size: 14px;
    display: flex;
    align-items: center;
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      &:hover {
        border-radius: 4px;
        background: var(--el-fill-color);
      }
    }
  }
  .canvas-info-right {
    color: var(--el-text-color-regular);
    font-size: 14px;
    display: flex;
    align-items: center;
    .item {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      &:hover {
        border-radius: 4px;
        background: var(--el-fill-color);
      }
    }
    .page-attr {
      font-size: 12px;
      color: var(--el-text-color-primary);
      &:hover {
        cursor: pointer;
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
