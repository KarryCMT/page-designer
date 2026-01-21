<script setup lang="ts">
/**
 * @fileoverview 低代码设计器主组件（优化版）
 * @description 使用设计模式优化后的设计器，提供更好的可维护性和扩展性
 * @features
 * - 组件拖拽：从左侧组件库拖拽组件到画布
 * - Tab组件嵌套：支持拖拽组件到Tab组件内部
 * - 布局管理：基于grid-layout-plus实现网格布局
 * - 撤销/重做：支持操作历史管理
 * - 事件通信：使用EventBus替代window事件
 */
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { GridLayout } from 'grid-layout-plus';
import { Box } from '@element-plus/icons-vue';
import ParserItem from './ParserItem.vue';
import DesignerToolbar from './DesignerToolbar.vue';
import PropertyPanel from './PropertyPanel.vue';
import ComponentLibrary from './ComponentLibrary.vue';
import CanvasHeader from './CanvasHeader.vue';
import JsonViewer from './JsonViewer.vue';
import PreviewDrawer from './PreviewDrawer.vue';
import EmptyState from './EmptyState.vue';
import { useDrag } from './useDrag';
import {
  EventBus,
  DesignerEvents,
  ComponentFactory,
  CommandManager,
  RemoveComponentCommand,
  UpdateComponentCommand,
} from '../core';

// ==================== 核心实例 ====================

const eventBus = EventBus.getInstance();
const componentFactory = ComponentFactory.getInstance();
const commandManager = CommandManager.getInstance();

// ==================== 状态管理 ====================

/** 画布布局数据 */
const layout = ref<any[]>([]);

/** 选中的组件 */
const selectedComponent = ref<any>(null);

/** JSON 查看器显示状态 */
const showJsonViewer = ref(false);

/** 预览抽屉显示状态 */
const showPreview = ref(false);

/** 左侧组件库数据源 */
const dataSourceItems = computed(() => {
  return componentFactory.getAllComponents().map((item) => ({
    widgetName: item.widgetName,
    label: item.label,
    icon: item.icon,
    w: item.w,
    h: item.h,
    minW: item.minW,
    minH: item.minH,
    maxW: item.maxW,
    maxH: item.maxH,
  }));
});

/** 画布容器DOM引用，用于计算拖拽位置 */
const canvasWrapper = ref<HTMLElement>();

/** GridLayout组件实例引用，用于调用grid-layout-plus的API */
const gridLayout = ref<InstanceType<typeof GridLayout>>();

// ==================== 拖拽功能 ====================

const { startDragFromSource, drag, dragEnd, setDraggingOverTab } = useDrag({
  layout,
  canvasWrapper,
  gridLayout,
});

/** 向父组件暴露的方法 */
defineExpose({
  setDraggingOverTab,
});

// ==================== 组件操作 ====================

/**
 * 删除组件 - 使用命令模式，支持撤销
 */
function removeItem(itemId: string) {
  const command = new RemoveComponentCommand(layout.value, itemId);
  commandManager.execute(command);
  eventBus.emit(DesignerEvents.COMPONENT_REMOVE, itemId);
  eventBus.emit(DesignerEvents.LAYOUT_CHANGE, layout.value);

  // 如果删除的是当前选中的组件，清空选中状态
  if (selectedComponent.value?.i === itemId) {
    selectedComponent.value = null;
  }
}

/**
 * 处理组件配置更新 - 使用命令模式，支持撤销
 */
function handleConfigUpdate(newConfig: any) {
  if (newConfig.i) {
    // 先尝试在顶层 layout 中更新
    const topLevelComponent = layout.value.find(
      (item) => item.i === newConfig.i,
    );

    if (topLevelComponent) {
      // 顶层组件更新
      const command = new UpdateComponentCommand(
        layout.value,
        newConfig.i,
        newConfig,
      );
      commandManager.execute(command);
      eventBus.emit(DesignerEvents.COMPONENT_UPDATE, {
        componentId: newConfig.i,
        newConfig,
      });
      eventBus.emit(DesignerEvents.LAYOUT_CHANGE, layout.value);

      // 更新选中组件的引用
      if (selectedComponent.value?.i === newConfig.i) {
        selectedComponent.value = layout.value.find(
          (item) => item.i === newConfig.i,
        );
      }
    } else {
      // 可能是 Tab 内部的组件，直接更新选中组件的引用
      if (selectedComponent.value?.i === newConfig.i) {
        selectedComponent.value = { ...newConfig };
      }

      // 触发更新事件，让 Tab 组件自己处理
      eventBus.emit(DesignerEvents.COMPONENT_UPDATE, {
        componentId: newConfig.i,
        newConfig,
      });
    }
  }
}

/**
 * 选择组件
 */
function handleSelectComponent(component: any) {
  selectedComponent.value = component;
  eventBus.emit(DesignerEvents.COMPONENT_SELECT, component.i);
}

/**
 * 根据 ID 查找组件（包括 Tab 内部的组件）
 */
function findComponentById(componentId: string): any {
  // 先在顶层 layout 中查找
  let component = layout.value.find((item) => item.i === componentId);

  if (component) {
    return component;
  }

  // 在 Tab 组件的子组件中查找
  for (const item of layout.value) {
    if (item.type === 'tab' && item.children) {
      for (const tab of item.children) {
        if (tab.children) {
          component = tab.children.find(
            (child: any) => child.i === componentId,
          );
          if (component) {
            return component;
          }
        }
      }
    }
  }

  return null;
}

/**
 * 取消选择组件
 */
function handleDeselectComponent() {
  selectedComponent.value = null;
}

// ==================== 工具栏操作 ====================

/**
 * 撤销操作
 */
function handleUndo() {
  if (commandManager.undo()) {
    eventBus.emit(DesignerEvents.LAYOUT_CHANGE, layout.value);
  }
}

/**
 * 重做操作
 */
function handleRedo() {
  if (commandManager.redo()) {
    eventBus.emit(DesignerEvents.LAYOUT_CHANGE, layout.value);
  }
}

/**
 * 清空画布
 */
function handleClear() {
  if (confirm('确定要清空画布吗？')) {
    layout.value = [];
    commandManager.clear();
    eventBus.emit(DesignerEvents.LAYOUT_CHANGE, layout.value);
  }
}

/**
 * 查看 JSON 配置
 */
function handleViewJson() {
  showJsonViewer.value = true;
}

/**
 * 预览
 */
function handlePreview() {
  showPreview.value = true;
}

/**
 * 导出配置
 */
function handleExport() {
  const config = JSON.stringify(layout.value, null, 2);
  const blob = new Blob([config], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `designer-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 导入配置
 */
function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = event.target?.result as string;
          const importedLayout = JSON.parse(config);
          if (Array.isArray(importedLayout)) {
            layout.value = importedLayout;
            commandManager.clear();
            eventBus.emit(DesignerEvents.LAYOUT_CHANGE, layout.value);
          } else {
            alert('导入失败：配置格式不正确');
          }
        } catch (error) {
          alert('导入失败：' + error);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

// ==================== 事件监听 ====================

const unsubscribers: Array<() => void> = [];

onMounted(() => {
  // 监听布局变化
  unsubscribers.push(
    eventBus.on(DesignerEvents.LAYOUT_CHANGE, (newLayout) => {
      // 布局已更新
    }),
  );

  // 监听组件添加
  unsubscribers.push(
    eventBus.on(DesignerEvents.COMPONENT_ADD, (component) => {
      // 组件已添加
    }),
  );

  // 监听组件删除
  unsubscribers.push(
    eventBus.on(DesignerEvents.COMPONENT_REMOVE, (componentId) => {
      // 组件已删除
    }),
  );

  // 监听组件选中事件（包括 Tab 内部的组件）
  unsubscribers.push(
    eventBus.on(DesignerEvents.COMPONENT_SELECT, (data) => {
      // data 可能是组件 ID（字符串）或完整的组件对象
      if (typeof data === 'string') {
        // 如果是 ID，在 layout 中查找
        const component = findComponentById(data);
        if (component) {
          selectedComponent.value = component;
        }
      } else if (data && typeof data === 'object') {
        // 如果是完整对象，直接使用
        selectedComponent.value = data;
      }
    }),
  );

  // 键盘快捷键
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  unsubscribers.push(() =>
    document.removeEventListener('keydown', handleKeyDown),
  );
});

onUnmounted(() => {
  // 清理所有事件监听
  unsubscribers.forEach((unsubscribe) => unsubscribe());
});
</script>

<template>
  <!-- 设计器主容器 -->
  <div class="layout-designer">
    <!-- 顶部工具栏 -->
    <DesignerToolbar
      :can-undo="commandManager.canUndo()"
      :can-redo="commandManager.canRedo()"
      :component-count="layout.length"
      :history-size="commandManager.getHistorySize()"
      @preview="handlePreview"
    />

    <!-- 主体内容区域 -->
    <div class="layout-designer-content">
      <!-- 左侧数据源面板：组件库 -->
      <ComponentLibrary
        :components="dataSourceItems"
        @drag-start="startDragFromSource"
        @drag="drag"
        @drag-end="dragEnd"
      />

      <!-- 右侧画布区域：设计画布 -->
      <div class="canvas-area">
        <CanvasHeader
          @undo="handleUndo"
          @redo="handleRedo"
          @clear="handleClear"
          @view-json="handleViewJson"
          @export="handleExport"
          @import="handleImport"
        />

        <!-- GridLayout网格布局容器 -->
        <div ref="canvasWrapper" class="canvas-wrapper">
          <!-- GridLayout - 始终渲染以支持拖拽 -->
          <GridLayout
            ref="gridLayout"
            v-model:layout="layout"
            :row-height="30"
            :col-num="12"
            :margin="[10, 10]"
            :is-draggable="true"
            :is-resizable="true"
            :vertical-compact="true"
            :use-css-transforms="true"
          >
            <!-- 组件渲染插槽：遍历layout中的每个组件 -->
            <template #item="{ item }">
              <ParserItem
                :item="item"
                :selected="selectedComponent?.i === item.i"
                @remove="removeItem"
                @update="handleConfigUpdate"
                @select="handleSelectComponent(item)"
              />
            </template>
          </GridLayout>

          <!-- 空状态提示 - 覆盖在 GridLayout 上方 -->
          <EmptyState v-if="layout.length === 0" :icon="Box">
            <template #description>
              <p class="empty-title">开始设计你的页面</p>
              <p class="empty-hint">从左侧组件库拖拽组件到这里</p>
            </template>
          </EmptyState>
        </div>
      </div>

      <!-- 组件属性区域：右侧属性面板 -->
      <PropertyPanel
        :selected-component="selectedComponent"
        @update="handleConfigUpdate"
        @close="handleDeselectComponent"
      />
    </div>

    <!-- JSON 查看器 -->
    <JsonViewer v-model="showJsonViewer" :data="layout" />

    <!-- 预览抽屉 -->
    <PreviewDrawer v-model="showPreview" :layout="layout" />
  </div>
</template>

<style lang="scss" scoped>
@use './index.scss';
</style>
