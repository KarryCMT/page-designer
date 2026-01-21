/**
 * 命令管理器 - 命令模式
 * 实现撤销/重做功能
 */

export interface Command {
    execute(): void;
    undo(): void;
    redo(): void;
}

/**
 * 添加组件命令
 */
export class AddComponentCommand implements Command {
    private layout: any[];
    private component: any;
    private index: number = -1;

    constructor(layout: any[], component: any) {
        this.layout = layout;
        this.component = component;
    }

    execute(): void {
        this.layout.push(this.component);
        this.index = this.layout.length - 1;
    }

    undo(): void {
        if (this.index !== -1) {
            this.layout.splice(this.index, 1);
        }
    }

    redo(): void {
        this.execute();
    }
}

/**
 * 删除组件命令
 */
export class RemoveComponentCommand implements Command {
    private layout: any[];
    private component: any;
    private index: number = -1;

    constructor(layout: any[], componentId: string) {
        this.layout = layout;
        this.index = layout.findIndex((item) => item.i === componentId);
        if (this.index !== -1) {
            this.component = { ...layout[this.index] };
        }
    }

    execute(): void {
        if (this.index !== -1) {
            this.layout.splice(this.index, 1);
        }
    }

    undo(): void {
        if (this.index !== -1 && this.component) {
            this.layout.splice(this.index, 0, this.component);
        }
    }

    redo(): void {
        this.execute();
    }
}

/**
 * 更新组件命令
 */
export class UpdateComponentCommand implements Command {
    private layout: any[];
    private componentId: string;
    private oldConfig: any;
    private newConfig: any;
    private index: number = -1;

    constructor(layout: any[], componentId: string, newConfig: any) {
        this.layout = layout;
        this.componentId = componentId;
        this.newConfig = newConfig;
        this.index = layout.findIndex((item) => item.i === componentId);
        if (this.index !== -1) {
            this.oldConfig = { ...layout[this.index] };
        }
    }

    execute(): void {
        if (this.index !== -1) {
            this.layout[this.index] = { ...this.layout[this.index], ...this.newConfig };
        }
    }

    undo(): void {
        if (this.index !== -1 && this.oldConfig) {
            this.layout[this.index] = this.oldConfig;
        }
    }

    redo(): void {
        this.execute();
    }
}

/**
 * 命令管理器
 */
export class CommandManager {
    private static instance: CommandManager;
    private history: Command[] = [];
    private currentIndex: number = -1;
    private maxHistorySize: number = 50;

    private constructor() { }

    public static getInstance(): CommandManager {
        if (!CommandManager.instance) {
            CommandManager.instance = new CommandManager();
        }
        return CommandManager.instance;
    }

    /**
     * 执行命令
     */
    public execute(command: Command): void {
        // 清除当前位置之后的历史
        this.history = this.history.slice(0, this.currentIndex + 1);

        command.execute();
        this.history.push(command);
        this.currentIndex++;

        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    /**
     * 撤销
     */
    public undo(): boolean {
        if (!this.canUndo()) {
            return false;
        }

        const command = this.history[this.currentIndex];
        command.undo();
        this.currentIndex--;
        return true;
    }

    /**
     * 重做
     */
    public redo(): boolean {
        if (!this.canRedo()) {
            return false;
        }

        this.currentIndex++;
        const command = this.history[this.currentIndex];
        command.redo();
        return true;
    }

    /**
     * 是否可以撤销
     */
    public canUndo(): boolean {
        return this.currentIndex >= 0;
    }

    /**
     * 是否可以重做
     */
    public canRedo(): boolean {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * 清空历史
     */
    public clear(): void {
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * 获取历史记录数量
     */
    public getHistorySize(): number {
        return this.history.length;
    }
}
