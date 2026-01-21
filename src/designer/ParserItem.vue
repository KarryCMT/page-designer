<script setup lang="ts">
import { Delete, DataLine, Refresh, FullScreen } from '@element-plus/icons-vue';
import { getComponentInfo } from './utils';
import { getComponentName } from './componentMap';
import { computed } from 'vue';

interface Props {
  item: any;
  selected?: boolean;
  previewMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  previewMode: false,
});

const emit = defineEmits<{
  remove: [itemId: string];
  update: [config: any];
  select: [];
}>();

// 检查是否为占位符
const isPlaceholder = computed(() => {
  return (
    props.item.type === '__placeholder__' ||
    props.item.i === 'drop' ||
    props.item.i === 'tab-drop'
  );
});

// 获取要渲染的组件名称
const componentName = getComponentName(props.item.type);

function handleRemove(e: Event) {
  e.stopPropagation();
  emit('remove', props.item.i);
}

function handleConfigUpdate(newConfig: any) {
  emit('update', newConfig);
}

function handleSelect(e?: Event) {
  if (e) {
    e.stopPropagation();
  }
  emit('select');
}
</script>

<template>
  <!-- 占位符不渲染任何内容 -->
  <div v-if="isPlaceholder" class="placeholder-item"></div>

  <!-- 正常组件渲染 -->
  <div
    v-else
    class="grid-item-content"
    :class="{ 'is-selected': selected }"
    @click="handleSelect($event)"
  >
    <div class="item-header">
      <span class="item-id">{{ getComponentInfo(item).label }}</span>
      <div v-if="!previewMode && selected" class="header-actions">
        <el-button type="primary" text size="mini" class="action-btn">
          <el-icon><DataLine /></el-icon>
        </el-button>
        <el-button type="primary" size="mini" class="action-btn">
          <el-icon><Refresh /></el-icon>
        </el-button>
        <el-button type="primary" size="mini" class="action-btn">
          <el-icon><FullScreen /></el-icon>
        </el-button>
        <el-button
          type="danger"
          text
          size="mini"
          class="action-btn delete-btn"
          @click="handleRemove"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="item-body">
      <!-- 动态组件渲染 -->
      <component
        :is="componentName"
        :config="item"
        @update:config="handleConfigUpdate"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.placeholder-item {
  width: 100%;
  height: 100%;
  background: transparent;
  pointer-events: none;
}

.grid-item-content {
  height: 100%;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border-radius: var(--el-border-radius-base);
  border: 2px solid var(--el-bg-color);
  overflow: hidden;
  box-sizing: border-box;

  &.is-selected {
    border: 2px solid var(--el-color-primary) !important;
  }

  &:hover {
    border-color: var(--el-color-primary);
  }

  .item-header {
    padding: 8px 12px;
    background-color: transparent;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-id {
      font-weight: 400;
      font-size: 13px;
      color: var(--el-text-color-regular);
      flex: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      transition: opacity 0.2s;

      .action-btn {
        padding: 4px;
        min-width: auto;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 14px;
        }

        &:not(.delete-btn) {
          background-color: var(--el-color-primary);
          color: #ffffff;
          border: none;

          &:hover {
            background-color: var(--el-color-primary-light-3);
          }
        }

        &.delete-btn {
          color: var(--el-color-danger);

          &:hover {
            background-color: var(--el-color-danger-light-9);
          }
        }
      }
    }
  }

  .item-body {
    flex: 1;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .component-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    min-height: 60px;

    .component-label {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
