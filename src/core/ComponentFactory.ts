/**
 * 组件工厂 - 工厂模式
 * 负责创建和配置组件实例
 */
import { basicComponents, type ComponentConfig } from '../config/components';

export interface ComponentInstance {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
    type: string;
    [key: string]: any;
}

export class ComponentFactory {
    private static instance: ComponentFactory;
    private componentRegistry: Map<string, ComponentConfig>;

    private constructor() {
        this.componentRegistry = new Map();
        this.registerComponents();
    }

    /**
     * 获取工厂单例
     */
    public static getInstance(): ComponentFactory {
        if (!ComponentFactory.instance) {
            ComponentFactory.instance = new ComponentFactory();
        }
        return ComponentFactory.instance;
    }

    /**
     * 注册所有组件
     */
    private registerComponents(): void {
        basicComponents.forEach((component) => {
            this.componentRegistry.set(component.widgetName, component);
        });
    }

    /**
     * 创建组件实例
     */
    public createComponent(
        widgetName: string,
        position: { x: number; y: number },
        customConfig?: Partial<ComponentInstance>
    ): ComponentInstance | null {
        const config = this.componentRegistry.get(widgetName);

        if (!config) {
            console.error(`Component ${widgetName} not found in registry`);
            return null;
        }

        const id = customConfig?.i || `${widgetName}-${Date.now()}`;

        // 深拷贝配置，避免引用问题
        const componentData = JSON.parse(JSON.stringify(config));

        return {
            ...componentData,
            x: position.x,
            y: position.y,
            w: config.w,
            h: config.h,
            i: id,
            type: widgetName,
            ...customConfig,
        };
    }

    /**
     * 获取组件配置
     */
    public getComponentConfig(widgetName: string): ComponentConfig | undefined {
        return this.componentRegistry.get(widgetName);
    }

    /**
     * 验证组件是否可以嵌套
     */
    public canNest(parentType: string, childType: string): boolean {
        // Tab组件不能嵌套
        if (parentType === 'tab' && childType === 'tab') {
            return false;
        }
        return true;
    }

    /**
     * 获取所有组件列表
     */
    public getAllComponents(): ComponentConfig[] {
        return Array.from(this.componentRegistry.values());
    }
}
