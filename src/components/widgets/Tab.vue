<template>
  <div class="tab-widget">
    <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
      <el-tab-pane
        v-for="(tab, tabIndex) in config.children"
        :key="tabIndex"
        :label="tab.name"
        :name="tab.name"
      >
        <div class="tab-content">
          <div
            :ref="(el: any) => setTabContentRef(el, Number(tabIndex))"
            class="tab-canvas"
            @dragover.prevent="handleTabDragOver($event)"
            @drop.prevent="handleTabDrop($event, Number(tabIndex))"
          >
            <!-- GridLayout - 始终渲染以支持拖拽 -->
            <GridLayout
              :ref="(el: any) => setGridLayoutRef(el, Number(tabIndex))"
              :layout="getTabLayout(Number(tabIndex))"
              @update:layout="
                (val: any[]) => updateTabLayout(Number(tabIndex), val)
              "
              :row-height="30"
              :col-num="12"
              :margin="[10, 10]"
              :is-draggable="true"
              :is-resizable="true"
              :vertical-compact="true"
              :use-css-transforms="true"
            >
              <template #item="{ item }">
                <ParserItem
                  :item="item"
                  :selected="selectedComponentId === item.i"
                  @remove="() => removeTabChild(Number(tabIndex), item.i)"
                  @select="() => handleSelectComponent(item)"
                />
              </template>
            </GridLayout>

            <!-- Tab 空状态 - 覆盖在 GridLayout 上方 -->
            <EmptyState
              v-if="getTabLayout(Number(tabIndex)).length === 0"
              :image-size="60"
            >
              <template #description>
                <p>拖拽组件到这里</p>
              </template>
            </EmptyState>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { GridLayout } from 'grid-layout-plus';
import ParserItem from '../../designer/ParserItem.vue';
import EmptyState from '../../designer/EmptyState.vue';
import { useDrag } from '../../designer/useDrag';
import { EventBus, DesignerEvents, ComponentFactory } from '../../core';

const props = defineProps<{
  config: any;
  selected?: boolean;
}>();

const emit = defineEmits(['update:config', 'select']);

// 核心实例
const eventBus = EventBus.getInstance();
const componentFactory = ComponentFactory.getInstance();

// 选中的组件 ID
const selectedComponentId = ref<string>('');

// 监听全局选中事件
eventBus.on(DesignerEvents.COMPONENT_SELECT, (data: any) => {
  if (typeof data === 'string') {
    selectedComponentId.value = data;
  } else if (data && typeof data === 'object' && data.i) {
    selectedComponentId.value = data.i;
  }
});

// 监听组件更新事件
eventBus.on(
  DesignerEvents.COMPONENT_UPDATE,
  ({ componentId, newConfig }: any) => {
    // 检查是否是 Tab 内部的组件
    for (const tabIndex in tabLayouts.value) {
      const layout = tabLayouts.value[tabIndex];
      const componentIndex = layout.findIndex(
        (item: any) => item.i === componentId,
      );

      if (componentIndex !== -1) {
        // 更新组件配置
        layout[componentIndex] = { ...layout[componentIndex], ...newConfig };
        tabLayouts.value[tabIndex] = [...layout];
        updateConfig();
        break;
      }
    }
  },
);

// 使用本地的 activeTab，初始化时从 config 中获取
const activeTab = ref(props.config.active || 'Tab 1');

// Tab 的布局数据（每个 tab 独立）
const tabLayouts = ref<Record<number, any[]>>({});

// GridLayout 引用
const gridLayoutRefs = ref<Record<number, InstanceType<typeof GridLayout>>>({});
const tabContentRefs = ref<Record<number, HTMLElement>>({});

// 获取当前激活的 tab 索引
const activeTabIndex = computed(() => {
  return (
    props.config.children?.findIndex(
      (tab: any) => tab.name === activeTab.value,
    ) ?? -1
  );
});

// 当前激活 tab 的布局数据
const currentLayout = computed({
  get: () => tabLayouts.value[activeTabIndex.value] || [],
  set: (val) => {
    if (activeTabIndex.value !== -1) {
      tabLayouts.value[activeTabIndex.value] = val;
    }
  },
});

// 当前激活 tab 的画布容器
const currentCanvasWrapper = computed(
  () => tabContentRefs.value[activeTabIndex.value],
);

// 当前激活 tab 的 GridLayout 实例
const currentGridLayout = computed(
  () => gridLayoutRefs.value[activeTabIndex.value],
);

// 使用拖拽 Hook
const { drag, cleanupPlaceholder } = useDrag({
  layout: currentLayout,
  canvasWrapper: currentCanvasWrapper,
  gridLayout: currentGridLayout,
  isTabContext: true,
  throttleTime: 50,
  dropId: 'tab-drop',
  onDragStart: (widgetName: string) => {
    // 配置会在 handleTabDrop 中使用
  },
  onDragEnd: () => {
    // 更新配置到父组件
    updateConfig();
  },
  canDrop: (widgetName: string) => {
    // 使用ComponentFactory验证嵌套规则
    return componentFactory.canNest('tab', widgetName);
  },
});

// 监听 config 变化，同步更新 activeTab 和 layouts
watch(
  () => props.config,
  (newConfig) => {
    if (newConfig.active && newConfig.active !== activeTab.value) {
      activeTab.value = newConfig.active;
    }

    // 初始化 tab layouts
    if (newConfig.children) {
      newConfig.children.forEach((tab: any, index: number) => {
        if (!tabLayouts.value[index]) {
          tabLayouts.value[index] = tab.children || [];
        }
      });
    }
  },
  { immediate: true, deep: true },
);

function handleTabClick(tab: any) {
  emit('update:config', { ...props.config, active: tab.paneName });
}

// 获取指定 tab 的布局数据
function getTabLayout(tabIndex: number) {
  return tabLayouts.value[tabIndex] || [];
}

// 设置 GridLayout 引用
function setGridLayoutRef(el: any, tabIndex: number) {
  if (el) {
    gridLayoutRefs.value[tabIndex] = el;
  }
}

// 设置 Tab 内容区域引用
function setTabContentRef(el: any, tabIndex: number) {
  if (el) {
    tabContentRefs.value[tabIndex] = el;
  }
}

// 更新配置到父组件
function updateConfig() {
  const newConfig = { ...props.config };

  newConfig.children = newConfig.children.map((tab: any, index: number) => ({
    ...tab,
    children: tabLayouts.value[index] || [],
  }));

  emit('update:config', newConfig);
}

// 更新 tab 布局
function updateTabLayout(tabIndex: number, newLayout: any[]) {
  tabLayouts.value[tabIndex] = newLayout;
  updateConfig();
}

// Tab 内容区域的拖拽处理
function handleTabDragOver(event: DragEvent) {
  event.stopPropagation();
  event.preventDefault();

  // 检查是否允许拖入 Tab 组件
  const widgetName = event.dataTransfer?.getData('text/plain');
  if (!componentFactory.canNest('tab', widgetName || '')) {
    eventBus.emit(DesignerEvents.DRAG_OVER_TAB, false);
    return;
  }

  drag();
}

function handleTabDrop(event: DragEvent, tabIndex: number) {
  event.stopPropagation();
  event.preventDefault();

  const widgetName = event.dataTransfer?.getData('text/plain');

  // 使用ComponentFactory验证嵌套规则
  if (!widgetName || !componentFactory.canNest('tab', widgetName)) {
    cleanupPlaceholder();
    return;
  }

  const tabContent = tabContentRefs.value[tabIndex];
  const gridLayoutInstance = gridLayoutRefs.value[tabIndex];

  if (!tabContent || !gridLayoutInstance) {
    cleanupPlaceholder();
    return;
  }

  const parentRect = tabContent.getBoundingClientRect();

  // 使用 event 中的鼠标位置
  const dropX = event.clientX;
  const dropY = event.clientY;

  const mouseInGrid =
    dropX > parentRect.left &&
    dropX < parentRect.right &&
    dropY > parentRect.top &&
    dropY < parentRect.bottom;

  if (mouseInGrid && widgetName) {
    // 清理拖拽占位符
    cleanupPlaceholder();

    // 通知主画布：组件已在 Tab 中处理（使用EventBus）
    eventBus.emit(DesignerEvents.TAB_DROP);

    // 计算相对于 Tab 画布的位置
    const relativeX = dropX - parentRect.left;
    const relativeY = dropY - parentRect.top;

    // 创建临时 item 来计算网格坐标
    const componentConfig = componentFactory.getComponentConfig(widgetName);

    if (componentConfig) {
      const tempId = 'temp-' + Date.now();
      const tempItem = {
        x: 0,
        y: 0,
        w: componentConfig.w || 6,
        h: componentConfig.h || 4,
        i: tempId,
        type: '__placeholder__',
      };

      // 添加临时占位符
      const currentLayout = tabLayouts.value[tabIndex] || [];
      currentLayout.push(tempItem);
      tabLayouts.value[tabIndex] = [...currentLayout];

      // 等待下一帧，让 GridLayout 渲染临时 item
      setTimeout(() => {
        const gridItem = gridLayoutInstance.getItem(tempId);

        let posX = 0;
        let posY = 0;

        if (gridItem && gridItem.calcXY) {
          // 计算网格坐标
          const pos = gridItem.calcXY(relativeY, relativeX);
          posX = pos.x;
          posY = pos.y;
        }

        // 移除临时占位符
        tabLayouts.value[tabIndex] = currentLayout.filter(
          (item) => item.i !== tempId,
        );

        // 使用ComponentFactory创建组件
        const newComponent = componentFactory.createComponent(widgetName, {
          x: posX,
          y: posY,
        });

        if (newComponent) {
          tabLayouts.value[tabIndex].push(newComponent);
          updateConfig();

          // 触发组件添加事件
          eventBus.emit(DesignerEvents.COMPONENT_ADD, newComponent);
        }
      }, 0);
    }
  } else {
    // 如果不在有效区域，也要清理占位符
    cleanupPlaceholder();
  }
}

// 移除 tab 中的子组件
function removeTabChild(tabIndex: number, itemId: string) {
  const layout = tabLayouts.value[tabIndex] || [];
  tabLayouts.value[tabIndex] = layout.filter((item) => item.i !== itemId);
  updateConfig();

  // 触发组件删除事件
  eventBus.emit(DesignerEvents.COMPONENT_REMOVE, itemId);
}

// 选中组件
function handleSelectComponent(component: any) {
  selectedComponentId.value = component.i;
  // 触发选中事件，传递完整的组件对象
  eventBus.emit(DesignerEvents.COMPONENT_SELECT, component);
  emit('select');
}
</script>

<style scoped lang="scss">
.tab-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }

  .tab-content {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .tab-canvas {
      flex: 1;
      overflow: auto;
      padding: 10px;
      background-color: var(--el-fill-color-light);
      border: 2px dashed var(--el-border-color);
      border-radius: var(--el-border-radius-base);
      transition: all 0.3s;
      position: relative;

      &:hover {
        border-color: var(--el-color-primary);
      }

      // Tab 空状态文字样式
      p {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin: 0;
      }
    }
  }
}
</style>
