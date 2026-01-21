/**
 * 核心模块导出
 */

export { ComponentFactory } from './ComponentFactory';
export type { ComponentInstance } from './ComponentFactory';

export { EventBus, DesignerEvents } from './EventBus';

export { CommandManager, AddComponentCommand, RemoveComponentCommand, UpdateComponentCommand } from './CommandManager';
export type { Command } from './CommandManager';

export { DragStrategyFactory } from './DragStrategy';
export type { DragStrategy, DragContext } from './DragStrategy';

export { DesignerStore } from './DesignerStore';
