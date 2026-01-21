<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div v-if="!isCollapsed" class="sidebar-header">
      <span>常用组件</span>
      <el-button text class="collapse-btn" @click="toggleCollapse">
        <el-icon><DArrowLeft /></el-icon>
      </el-button>
    </div>

    <!-- 收起状态的展开按钮 -->
    <div v-else class="collapsed-trigger" @click="toggleCollapse">
      <el-icon><DArrowRight /></el-icon>
    </div>

    <!-- 组件列表：显示所有可拖拽的组件 -->
    <div v-if="!isCollapsed" class="component-list">
      <div
        v-for="item in components"
        :key="item.widgetName"
        class="component-item"
        draggable="true"
        @dragstart="handleDragStart(item, $event)"
        @drag="handleDrag"
        @dragend="handleDragEnd"
      >
        <!-- 组件图标 -->
        <div class="component-icon">
          <el-icon>
            <component :is="iconComponentMap[item.icon]" />
          </el-icon>
        </div>
        <!-- 组件信息：名称和尺寸 -->
        <div class="component-info">
          <div class="component-name">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue';

interface ComponentItem {
  widgetName: string;
  label: string;
  icon: string;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

interface Props {
  components: ComponentItem[];
}

defineProps<Props>();

const emit = defineEmits<{
  dragStart: [item: ComponentItem, event: DragEvent];
  drag: [];
  dragEnd: [];
}>();

const iconComponentMap = ElementPlusIconsVue;
const isCollapsed = ref(false);

function handleDragStart(item: ComponentItem, event: DragEvent) {
  emit('dragStart', item, event);
}

function handleDrag() {
  emit('drag');
}

function handleDragEnd() {
  emit('dragEnd');
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 300px;
  flex-shrink: 0; // 防止被压缩
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  box-shadow: var(--el-box-shadow-light);
  transition: width 0.3s ease;
  overflow: hidden; // 防止内容溢出

  &.collapsed {
    width: 50px;
  }

  .sidebar-header {
    position: relative;
    padding: 10px;
    height: 40px;
    border-bottom: 1px solid var(--el-border-color);
    background-color: var(--el-bg-color);

    span {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 12px;
    }

    p {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: 14px;
    }

    .collapse-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      padding: 4px;
    }
  }

  .collapsed-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
    height: 100%;

    .el-icon {
      color: var(--el-text-color-regular);
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }

  .component-list {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    align-content: start;

    .component-item {
      display: flex;
      align-items: center;
      padding: 2px 4px;
      background-color: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: var(--el-border-radius-base);
      cursor: grab;
      transition: all 0.2s ease;
      height: 30px;

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px 8px var(--el-color-primary-light-7);
        transform: translateY(-1px);
      }

      &:active {
        cursor: grabbing;
        transform: scale(0.98);
      }

      .component-icon {
        margin-right: 5px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--el-fill-color);
        border-radius: var(--el-border-radius-small);
        font-size: 12px;
        color: var(--el-text-color-regular);
      }

      .component-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .component-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .component-size {
          font-size: 9px;
          color: var(--el-text-color-secondary);
          background-color: var(--el-fill-color-light);
          padding: 0px 3px;
          border-radius: var(--el-border-radius-small);
          display: inline-block;
          margin-top: 1px;
          align-self: flex-start;
        }
      }
    }
  }
}
</style>
