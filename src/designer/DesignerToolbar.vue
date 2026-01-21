<template>
  <div class="designer-toolbar">
    <div class="toolbar-left">
      <!-- 撤销/重做按钮组 -->
      <div class="app-icon">
        <el-icon size="20" color="#878f95"><Grid /></el-icon>
      </div>
      <el-icon size="25">
        <AppStoreSvg />
      </el-icon>
    </div>

    <!-- 状态信息 -->
    <div class="toolbar-right">
      <el-button @click="handlePreview" title="预览"> 预览 </el-button>
      <el-button @click="handleSave" type="primary" title="保存">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppStoreSvg from '@/assets/svg/AppStore.svg';
import { Grid } from '@element-plus/icons-vue';

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  componentCount: number;
  historySize: number;
}

defineProps<Props>();

const emit = defineEmits<{
  preview: [];
  save: [];
}>();

function handlePreview() {
  emit('preview');
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
    .app-icon {
      height: 30px;
      line-height: 19px;
      margin-right: 9px;
      padding: 5px;
      text-align: center;
      width: 30px;
      &:hover {
        background: #f1f2f3;
        border-radius: 6px;
        color: #1f4469;
        cursor: pointer;
      }
    }
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
