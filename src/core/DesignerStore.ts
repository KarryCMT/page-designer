/**
 * 设计器状态管理 - 单例模式 + 观察者模式
 * 集中管理设计器的所有状态
 */
import { reactive, readonly, type UnwrapNestedRefs } from 'vue';
import { EventBus, DesignerEvents } from './EventBus';
import { ComponentFactory, type ComponentInstance } from './ComponentFactory';
import { CommandManager, AddComponentCommand, RemoveComponentCommand, UpdateComponentCommand } from './CommandManager';

interface DesignerState {
    layout: ComponentInstance[];
    selectedComponentId: string | null;
    isDragging: boolean;
    draggedComponent: string | null;
    canUndo: boolean;
    canRedo: boolean;
}

export class DesignerStore {
    private static instance: DesignerStore;
    private state: UnwrapNestedRefs<DesignerState>;
    private eventBus: EventBus;
    private componentFactory: ComponentFactory;
    private commandManager: CommandManager;

    private constructor() {
        this.state = reactive<DesignerState>({
            layout: [],
            selectedComponentId: null,
            isDragging: false,
            draggedComponent: null,
            canUndo: false,
            canRedo: false,
        });

        this.eventBus = EventBus.getInstance();
        this.componentFactory = ComponentFactory.getInstance();
        this.commandManager = CommandManager.getInstance();
    }

    public static getInstance(): DesignerStore {
        if (!DesignerStore.instance) {
            DesignerStore.instance = new DesignerStore();
        }
        return DesignerStore.instance;
    }

    /**
     * 获取只读状态
     */
    public getState() {
        return readonly(this.state);
    }

    /**
     * 获取布局数据（可修改）
     */
    public getLayout() {
        return this.state.layout;
    }

    /**
     * 添加组件
     */
    public addComponent(widgetName: string, position: { x: number; y: number }): boolean {
        const component = this.componentFactory.createComponent(widgetName, position);

        if (!component) {
            return false;
        }

        const command = new AddComponentCommand(this.state.layout, component);
        this.commandManager.execute(command);

        this.updateCommandState();
        this.eventBus.emit(DesignerEvents.COMPONENT_ADD, component);
        this.eventBus.emit(DesignerEvents.LAYOUT_CHANGE, this.state.layout);

        return true;
    }

    /**
     * 删除组件
     */
    public removeComponent(componentId: string): boolean {
        const command = new RemoveComponentCommand(this.state.layout, componentId);
        this.commandManager.execute(command);

        this.updateCommandState();
        this.eventBus.emit(DesignerEvents.COMPONENT_REMOVE, componentId);
        this.eventBus.emit(DesignerEvents.LAYOUT_CHANGE, this.state.layout);

        return true;
    }

    /**
     * 更新组件配置
     */
    public updateComponent(componentId: string, newConfig: Partial<ComponentInstance>): boolean {
        const command = new UpdateComponentCommand(this.state.layout, componentId, newConfig);
        this.commandManager.execute(command);

        this.updateCommandState();
        this.eventBus.emit(DesignerEvents.COMPONENT_UPDATE, { componentId, newConfig });
        this.eventBus.emit(DesignerEvents.LAYOUT_CHANGE, this.state.layout);

        return true;
    }

    /**
     * 选择组件
     */
    public selectComponent(componentId: string | null): void {
        this.state.selectedComponentId = componentId;
    }

    /**
     * 开始拖拽
     */
    public startDrag(widgetName: string): void {
        this.state.isDragging = true;
        this.state.draggedComponent = widgetName;
        this.eventBus.emit(DesignerEvents.DRAG_START, widgetName);
    }

    /**
     * 结束拖拽
     */
    public endDrag(): void {
        this.state.isDragging = false;
        this.state.draggedComponent = null;
        this.eventBus.emit(DesignerEvents.DRAG_END);
    }

    /**
     * 撤销
     */
    public undo(): boolean {
        const result = this.commandManager.undo();
        this.updateCommandState();
        if (result) {
            this.eventBus.emit(DesignerEvents.LAYOUT_CHANGE, this.state.layout);
        }
        return result;
    }

    /**
     * 重做
     */
    public redo(): boolean {
        const result = this.commandManager.redo();
        this.updateCommandState();
        if (result) {
            this.eventBus.emit(DesignerEvents.LAYOUT_CHANGE, this.state.layout);
        }
        return result;
    }

    /**
     * 清空画布
     */
    public clear(): void {
        this.state.layout = [];
        this.state.selectedComponentId = null;
        this.commandManager.clear();
        this.updateCommandState();
        this.eventBus.emit(DesignerEvents.LAYOUT_CHANGE, this.state.layout);
    }

    /**
     * 导出配置
     */
    public exportConfig(): string {
        return JSON.stringify(this.state.layout, null, 2);
    }

    /**
     * 导入配置
     */
    public importConfig(config: string): boolean {
        try {
            const layout = JSON.parse(config);
            if (Array.isArray(layout)) {
                this.state.layout = layout;
                this.commandManager.clear();
                this.updateCommandState();
                this.eventBus.emit(DesignerEvents.LAYOUT_CHANGE, this.state.layout);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import config:', error);
            return false;
        }
    }

    /**
     * 更新命令状态
     */
    private updateCommandState(): void {
        this.state.canUndo = this.commandManager.canUndo();
        this.state.canRedo = this.commandManager.canRedo();
    }

    /**
     * 获取组件工厂
     */
    public getComponentFactory(): ComponentFactory {
        return this.componentFactory;
    }

    /**
     * 获取事件总线
     */
    public getEventBus(): EventBus {
        return this.eventBus;
    }
}
