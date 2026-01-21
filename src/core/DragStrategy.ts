/**
 * 拖拽策略 - 策略模式
 * 不同场景使用不同的拖拽策略
 */

export interface DragContext {
    mouseX: number;
    mouseY: number;
    parentRect: DOMRect;
    gridLayout: any;
    layout: any[];
    dragItem: any;
}

export interface DragStrategy {
    canDrop(widgetName: string): boolean;
    handleDragOver(context: DragContext): void;
    handleDrop(context: DragContext): any | null;
    cleanup(context: DragContext): void;
}

/**
 * 主画布拖拽策略
 */
export class CanvasDragStrategy implements DragStrategy {
    private dropId: string = 'drop';

    canDrop(): boolean {
        // 主画布允许所有组件
        return true;
    }

    handleDragOver(context: DragContext): void {
        const { mouseX, mouseY, parentRect, gridLayout, layout, dragItem } = context;

        const mouseInGrid =
            mouseX > parentRect.left &&
            mouseX < parentRect.right &&
            mouseY > parentRect.top &&
            mouseY < parentRect.bottom;

        // 添加占位符
        if (mouseInGrid && !layout.find((item: any) => item.i === this.dropId)) {
            layout.push({
                x: 0,
                y: 0,
                w: dragItem.w,
                h: dragItem.h,
                i: this.dropId,
                type: '__placeholder__',
            });
        }

        const index = layout.findIndex((item: any) => item.i === this.dropId);
        if (index !== -1) {
            const item = gridLayout.getItem(this.dropId);
            if (!item) return;

            // 隐藏占位符
            try {
                item.wrapper.style.display = 'none';
            } catch (e) { }

            // 更新位置
            Object.assign(item.state, {
                top: mouseY - parentRect.top,
                left: mouseX - parentRect.left,
            });

            const newPos = item.calcXY(mouseY - parentRect.top, mouseX - parentRect.left);

            if (mouseInGrid) {
                gridLayout.dragEvent('dragstart', this.dropId, newPos.x, newPos.y, dragItem.h, dragItem.w);
                dragItem.x = layout[index].x;
                dragItem.y = layout[index].y;
            } else {
                gridLayout.dragEvent('dragend', this.dropId, newPos.x, newPos.y, dragItem.h, dragItem.w);
                const dropIndex = layout.findIndex((item: any) => item.i === this.dropId);
                if (dropIndex !== -1) {
                    layout.splice(dropIndex, 1);
                }
            }
        }
    }

    handleDrop(context: DragContext): any | null {
        const { mouseX, mouseY, parentRect, dragItem } = context;

        const mouseInGrid =
            mouseX > parentRect.left &&
            mouseX < parentRect.right &&
            mouseY > parentRect.top &&
            mouseY < parentRect.bottom;

        if (!mouseInGrid) {
            return null;
        }

        return {
            x: dragItem.x,
            y: dragItem.y,
            w: dragItem.w,
            h: dragItem.h,
        };
    }

    cleanup(context: DragContext): void {
        const { layout, gridLayout, dragItem } = context;
        const dropIndex = layout.findIndex((item: any) => item.i === this.dropId);

        if (dropIndex !== -1) {
            try {
                gridLayout.dragEvent(
                    'dragend',
                    this.dropId,
                    layout[dropIndex].x,
                    layout[dropIndex].y,
                    dragItem.h,
                    dragItem.w
                );
            } catch (e) { }
            layout.splice(dropIndex, 1);
        }
    }
}

/**
 * Tab组件内部拖拽策略
 */
export class TabDragStrategy implements DragStrategy {
    private dropId: string = 'tab-drop';

    canDrop(widgetName: string): boolean {
        // Tab内部不允许嵌套Tab
        return widgetName !== 'tab';
    }

    handleDragOver(context: DragContext): void {
        const { mouseX, mouseY, parentRect, gridLayout, layout, dragItem } = context;

        const mouseInGrid =
            mouseX > parentRect.left &&
            mouseX < parentRect.right &&
            mouseY > parentRect.top &&
            mouseY < parentRect.bottom;

        if (mouseInGrid && !layout.find((item: any) => item.i === this.dropId)) {
            layout.push({
                x: 0,
                y: 0,
                w: dragItem.w,
                h: dragItem.h,
                i: this.dropId,
                type: '__placeholder__',
            });
        }

        const index = layout.findIndex((item: any) => item.i === this.dropId);
        if (index !== -1) {
            const item = gridLayout.getItem(this.dropId);
            if (!item) return;

            try {
                item.wrapper.style.display = 'none';
            } catch (e) { }

            Object.assign(item.state, {
                top: mouseY - parentRect.top,
                left: mouseX - parentRect.left,
            });

            const newPos = item.calcXY(mouseY - parentRect.top, mouseX - parentRect.left);

            if (mouseInGrid) {
                gridLayout.dragEvent('dragstart', this.dropId, newPos.x, newPos.y, dragItem.h, dragItem.w);
                dragItem.x = layout[index].x;
                dragItem.y = layout[index].y;
            } else {
                gridLayout.dragEvent('dragend', this.dropId, newPos.x, newPos.y, dragItem.h, dragItem.w);
                const dropIndex = layout.findIndex((item: any) => item.i === this.dropId);
                if (dropIndex !== -1) {
                    layout.splice(dropIndex, 1);
                }
            }
        }
    }

    handleDrop(context: DragContext): any | null {
        const { mouseX, mouseY, parentRect, dragItem } = context;

        const mouseInGrid =
            mouseX > parentRect.left &&
            mouseX < parentRect.right &&
            mouseY > parentRect.top &&
            mouseY < parentRect.bottom;

        if (!mouseInGrid) {
            return null;
        }

        return {
            x: dragItem.x,
            y: dragItem.y,
            w: dragItem.w,
            h: dragItem.h,
        };
    }

    cleanup(context: DragContext): void {
        const { layout, gridLayout, dragItem } = context;
        const dropIndex = layout.findIndex((item: any) => item.i === this.dropId);

        if (dropIndex !== -1) {
            try {
                gridLayout.dragEvent(
                    'dragend',
                    this.dropId,
                    layout[dropIndex].x,
                    layout[dropIndex].y,
                    dragItem.h,
                    dragItem.w
                );
            } catch (e) { }
            layout.splice(dropIndex, 1);
        }
    }
}

/**
 * 拖拽策略工厂
 */
export class DragStrategyFactory {
    private static strategies: Map<string, DragStrategy> = new Map<string, DragStrategy>([
        ['canvas', new CanvasDragStrategy()],
        ['tab', new TabDragStrategy()],
    ]);

    public static getStrategy(type: 'canvas' | 'tab'): DragStrategy {
        const strategy = this.strategies.get(type);
        if (!strategy) {
            throw new Error(`Drag strategy ${type} not found`);
        }
        return strategy;
    }
}
