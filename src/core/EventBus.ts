/**
 * 事件总线 - 观察者模式
 * 替代 window.dispatchEvent，提供类型安全的事件通信
 */

type EventCallback = (data?: any) => void;

export enum DesignerEvents {
    DRAG_START = 'drag:start',
    DRAG_MOVE = 'drag:move',
    DRAG_END = 'drag:end',
    DRAG_OVER_TAB = 'drag:over-tab',
    COMPONENT_ADD = 'component:add',
    COMPONENT_REMOVE = 'component:remove',
    COMPONENT_UPDATE = 'component:update',
    COMPONENT_SELECT = 'component:select',
    LAYOUT_CHANGE = 'layout:change',
    TAB_DROP = 'tab:drop',
}

export class EventBus {
    private static instance: EventBus;
    private events: Map<string, Set<EventCallback>>;

    private constructor() {
        this.events = new Map();
    }

    /**
     * 获取事件总线单例
     */
    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    /**
     * 订阅事件
     */
    public on(event: DesignerEvents | string, callback: EventCallback): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }

        this.events.get(event)!.add(callback);

        // 返回取消订阅函数
        return () => this.off(event, callback);
    }

    /**
     * 取消订阅
     */
    public off(event: DesignerEvents | string, callback: EventCallback): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    /**
     * 触发事件
     */
    public emit(event: DesignerEvents | string, data?: any): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * 一次性订阅
     */
    public once(event: DesignerEvents | string, callback: EventCallback): void {
        const onceCallback = (data?: any) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }

    /**
     * 清除所有事件监听
     */
    public clear(): void {
        this.events.clear();
    }

    /**
     * 清除指定事件的所有监听
     */
    public clearEvent(event: DesignerEvents | string): void {
        this.events.delete(event);
    }
}
