/**
 * @fileoverview 拖拽功能 Hook（优化版）
 * @description 使用EventBus替代window事件，提供更好的类型安全和可维护性
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { throttle } from 'lodash-es';
import { EventBus, DesignerEvents, ComponentFactory } from '../core';

/**
 * 拖拽项数据结构
 */
interface DragItem {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
    type: string;
    componentData: any;
    widgetName?: string;
    targetTabIndex?: number;
}

/**
 * Hook 参数接口
 */
interface UseDragOptions {
    layout: any;
    canvasWrapper: any;
    gridLayout: any;
    /** 是否为 Tab 组件内部的拖拽 */
    isTabContext?: boolean;
    /** 拖拽事件的节流时间（毫秒） */
    throttleTime?: number;
    /** 自定义拖拽占位符 ID */
    dropId?: string;
    /** 拖拽开始时的回调 */
    onDragStart?: (widgetName: string) => void;
    /** 拖拽结束时的回调 */
    onDragEnd?: () => void;
    /** 检查是否允许拖入的回调 */
    canDrop?: (widgetName: string) => boolean;
}

/**
 * 拖拽功能 Hook
 * @param options - Hook 配置选项
 * @returns 拖拽相关的状态和方法
 */
export function useDrag(options: UseDragOptions) {
    const {
        layout,
        canvasWrapper,
        gridLayout,
        isTabContext = false,
        throttleTime = 50,
        dropId: customDropId,
        onDragStart,
        onDragEnd,
        canDrop,
    } = options;

    // ==================== 核心实例 ====================

    const eventBus = EventBus.getInstance();
    const componentFactory = ComponentFactory.getInstance();

    // ==================== 拖拽相关状态 ====================

    /** 鼠标当前位置坐标 */
    const mouseAt = { x: -1, y: -1 };

    /** 拖拽占位符的ID */
    const dropId = customDropId || (isTabContext ? 'tab-drop' : 'drop');

    /** 当前拖拽项的状态数据 */
    const dragItem = ref<DragItem>({
        x: -1,
        y: -1,
        w: 2,
        h: 2,
        i: '',
        type: '',
        componentData: null,
        widgetName: '',
        targetTabIndex: -1,
    });

    /** 标记是否正在 Tab 组件上方拖拽（仅主画布使用） */
    let isDraggingOverTab = false;

    /** 标记是否已经在 Tab 中处理过 drop（仅 Tab 组件使用） */
    let hasDroppedInTab = false;

    /** 标记拖拽是否已经结束 */
    let isDragEnded = false;

    /** 标记组件是否已在 Tab 中被处理（主画布使用） */
    let componentDroppedInTab = false;

    // ==================== 拖拽事件处理 ====================

    /**
     * 同步鼠标位置
     */
    function syncMousePosition(event: MouseEvent) {
        mouseAt.x = event.clientX;
        mouseAt.y = event.clientY;
    }

    /**
     * 处理Tab组件拖拽状态变化（仅主画布使用）
     */
    function handleDraggingOverTab(isOver: boolean) {
        if (isTabContext) return;

        const wasOverTab = isDraggingOverTab;
        isDraggingOverTab = isOver;

        // 当进入 Tab 区域时，立即清理外层的占位符
        if (isDraggingOverTab && !wasOverTab) {
            cleanupPlaceholder();
        }
    }

    /**
     * 清理拖拽占位符
     */
    function cleanupPlaceholder() {
        const dropIndex = layout.value.findIndex((item: any) => item.i === dropId);
        if (dropIndex !== -1 && gridLayout.value) {
            try {
                gridLayout.value.dragEvent(
                    'dragend',
                    dropId,
                    layout.value[dropIndex].x,
                    layout.value[dropIndex].y,
                    dragItem.value.h,
                    dragItem.value.w,
                );
            } catch (e) { }
            layout.value = layout.value.filter((item: any) => item.i !== dropId);
        }
    }

    /**
     * 从组件库开始拖拽
     */
    function startDragFromSource(item: any, event: DragEvent) {
        // 使用ComponentFactory获取组件配置
        const componentConfig = componentFactory.getComponentConfig(item.widgetName);

        if (!componentConfig) {
            console.error(`Component ${item.widgetName} not found`);
            return;
        }

        dragItem.value.w = componentConfig.w;
        dragItem.value.h = componentConfig.h;
        dragItem.value.type = item.widgetName;
        dragItem.value.widgetName = item.widgetName;
        dragItem.value.componentData = componentConfig;
        isDraggingOverTab = false;
        hasDroppedInTab = false;
        isDragEnded = false;
        componentDroppedInTab = false;

        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'copy';
            event.dataTransfer.setData('text/plain', item.widgetName);
        }

        // 触发回调
        onDragStart?.(item.widgetName);

        // 使用EventBus通知（替代window事件）
        if (!isTabContext) {
            eventBus.emit(DesignerEvents.DRAG_START, item.widgetName);
        }
    }

    /**
     * 拖拽过程中的实时处理
     */
    const drag = throttle(() => {
        // 如果拖拽已经结束，不再处理
        if (isDragEnded) {
            return;
        }

        const parentRect = canvasWrapper.value?.getBoundingClientRect();

        if (!parentRect || !gridLayout.value) return;

        // 主画布：如果正在 Tab 组件上方拖拽，不处理拖拽逻辑
        if (!isTabContext && isDraggingOverTab) {
            layout.value = layout.value.filter((item: any) => item.i !== dropId);
            return;
        }

        // 判断鼠标是否在画布区域内
        const mouseInGrid =
            mouseAt.x > parentRect.left &&
            mouseAt.x < parentRect.right &&
            mouseAt.y > parentRect.top &&
            mouseAt.y < parentRect.bottom;

        // Tab 组件：通知主画布拖拽状态（使用EventBus）
        if (isTabContext && mouseInGrid) {
            eventBus.emit(DesignerEvents.DRAG_OVER_TAB, true);
        } else if (isTabContext && !mouseInGrid) {
            eventBus.emit(DesignerEvents.DRAG_OVER_TAB, false);
        }

        // 当鼠标进入画布时，添加拖拽占位符
        if (mouseInGrid && !layout.value.find((item: any) => item.i === dropId)) {
            layout.value.push({
                x: 0,
                y: 0,
                w: dragItem.value.w,
                h: dragItem.value.h,
                i: dropId,
                type: '__placeholder__',
            });
        }

        const index = layout.value.findIndex((item: any) => item.i === dropId);

        if (index !== -1) {
            const item = gridLayout.value.getItem(dropId);

            if (!item) return;

            // 隐藏占位符元素
            try {
                item.wrapper.style.display = 'none';
            } catch (e) { }

            // 更新占位符位置
            Object.assign(item.state, {
                top: mouseAt.y - parentRect.top,
                left: mouseAt.x - parentRect.left,
            });

            // 计算网格坐标
            const newPos = item.calcXY(
                mouseAt.y - parentRect.top,
                mouseAt.x - parentRect.left,
            );

            if (mouseInGrid) {
                // 在画布内，更新占位符位置
                gridLayout.value.dragEvent(
                    'dragstart',
                    dropId,
                    newPos.x,
                    newPos.y,
                    dragItem.value.h,
                    dragItem.value.w,
                );
                dragItem.value.i = String(index);
                dragItem.value.x = layout.value[index].x;
                dragItem.value.y = layout.value[index].y;
            } else {
                // 移出画布，移除占位符
                gridLayout.value.dragEvent(
                    'dragend',
                    dropId,
                    newPos.x,
                    newPos.y,
                    dragItem.value.h,
                    dragItem.value.w,
                );
                layout.value = layout.value.filter((item: any) => item.i !== dropId);
            }
        }
    }, throttleTime);

    /**
     * 拖拽结束处理
     */
    function dragEnd(event?: DragEvent) {
        // 标记拖拽已结束
        isDragEnded = true;

        // 主画布：如果组件已在 Tab 中被处理，直接返回
        if (!isTabContext && componentDroppedInTab) {
            cleanupPlaceholder();
            resetDragItem();
            componentDroppedInTab = false;
            return;
        }

        const parentRect = canvasWrapper.value?.getBoundingClientRect();

        // Tab 组件：检查是否已经处理过 drop
        if (isTabContext && hasDroppedInTab) {
            hasDroppedInTab = false;
            return;
        }

        // 主画布：检查是否拖拽到了 Tab 组件内部
        if (!isTabContext) {
            const targetElement = document.elementFromPoint(
                mouseAt.x,
                mouseAt.y,
            ) as HTMLElement;

            const droppedInTabComponent = targetElement?.closest('.tab-widget') !== null ||
                targetElement?.closest('.tab-canvas') !== null ||
                targetElement?.closest('.el-tabs') !== null;

            if (isDraggingOverTab || droppedInTabComponent) {
                if (parentRect && gridLayout.value) {
                    cleanupPlaceholder();
                }
                resetDragItem();
                eventBus.emit(DesignerEvents.DRAG_END);
                return;
            }
        }

        if (!parentRect || !gridLayout.value) return;

        // 判断鼠标是否在画布区域内
        const mouseInGrid =
            mouseAt.x > parentRect.left &&
            mouseAt.x < parentRect.right &&
            mouseAt.y > parentRect.top &&
            mouseAt.y < parentRect.bottom;

        // Tab 组件：检查是否允许拖入
        if (isTabContext && event) {
            const widgetName = event.dataTransfer?.getData('text/plain');
            if (widgetName && canDrop && !canDrop(widgetName)) {
                cleanupPlaceholder();
                resetDragItem();
                return;
            }
        }

        if (mouseInGrid) {
            // 结束GridLayout的拖拽事件
            gridLayout.value.dragEvent(
                'dragend',
                dropId,
                dragItem.value.x,
                dragItem.value.y,
                dragItem.value.h,
                dragItem.value.w,
            );

            // 移除占位符
            layout.value = layout.value.filter((item: any) => item.i !== dropId);

            // 使用ComponentFactory创建组件
            const component = componentFactory.createComponent(
                dragItem.value.widgetName || dragItem.value.type,
                { x: dragItem.value.x, y: dragItem.value.y }
            );

            if (component) {
                layout.value.push(component);

                // 触发组件添加事件
                eventBus.emit(DesignerEvents.COMPONENT_ADD, component);
            }

            // Tab 组件：标记已处理
            if (isTabContext) {
                hasDroppedInTab = true;
            }
        }

        // 重置拖拽状态
        resetDragItem();

        // 触发回调
        onDragEnd?.();

        // 主画布：通知拖拽结束
        if (!isTabContext) {
            eventBus.emit(DesignerEvents.DRAG_END);
        }
    }

    /**
     * 重置拖拽项状态
     */
    function resetDragItem() {
        dragItem.value.x = -1;
        dragItem.value.y = -1;
        dragItem.value.i = '';
        dragItem.value.type = '';
        dragItem.value.widgetName = '';
        dragItem.value.componentData = null;
        isDraggingOverTab = false;

        // Tab 组件：通知主画布
        if (isTabContext) {
            eventBus.emit(DesignerEvents.DRAG_OVER_TAB, false);
        }
    }

    /**
     * 设置拖拽是否在Tab组件上方（仅主画布使用）
     */
    function setDraggingOverTab(value: boolean) {
        if (!isTabContext) {
            isDraggingOverTab = value;
        }
    }

    /**
     * 处理全局拖拽开始事件（仅 Tab 组件使用）
     */
    function handleGlobalDragStart(widgetName: string) {
        if (!isTabContext) return;

        if (widgetName) {
            dragItem.value.widgetName = widgetName;
            dragItem.value.type = widgetName;
        }
        hasDroppedInTab = false;
    }

    /**
     * 处理全局拖拽结束事件（仅 Tab 组件使用）
     */
    function handleGlobalDragEnd() {
        if (!isTabContext) return;

        if (hasDroppedInTab) {
            hasDroppedInTab = false;
            return;
        }

        cleanupPlaceholder();
        resetDragItem();
    }

    /**
     * 处理 Tab 组件已处理 drop 的事件
     */
    function handleTabComponentDropped() {
        if (!isTabContext) {
            componentDroppedInTab = true;
        }
    }

    // ==================== 生命周期 ====================

    const unsubscribers: Array<() => void> = [];

    onMounted(() => {
        document.addEventListener('dragover', syncMousePosition);

        if (isTabContext) {
            // Tab 组件：监听全局拖拽事件（使用EventBus）
            unsubscribers.push(
                eventBus.on(DesignerEvents.DRAG_START, handleGlobalDragStart)
            );
            unsubscribers.push(
                eventBus.on(DesignerEvents.DRAG_END, handleGlobalDragEnd)
            );
        } else {
            // 主画布：监听 Tab 拖拽状态（使用EventBus）
            unsubscribers.push(
                eventBus.on(DesignerEvents.DRAG_OVER_TAB, handleDraggingOverTab)
            );
            unsubscribers.push(
                eventBus.on(DesignerEvents.TAB_DROP, handleTabComponentDropped)
            );
        }
    });

    onBeforeUnmount(() => {
        document.removeEventListener('dragover', syncMousePosition);

        // 清理所有EventBus订阅
        unsubscribers.forEach(unsubscribe => unsubscribe());
    });

    // ==================== 返回 ====================

    return {
        dragItem,
        mouseAt,
        startDragFromSource,
        drag,
        dragEnd,
        setDraggingOverTab,
        cleanupPlaceholder,
    };
}
