# 核心模块 (Core Modules)

这个目录包含了设计器的核心功能模块，采用多种设计模式实现。

## 模块说明

### 📦 ComponentFactory.ts

**设计模式**: 工厂模式 + 单例模式

负责组件的创建和管理。

```typescript
const factory = ComponentFactory.getInstance();

// 创建组件
const component = factory.createComponent('briefingCard', { x: 0, y: 0 });

// 获取组件配置
const config = factory.getComponentConfig('briefingCard');

// 验证嵌套规则
const canNest = factory.canNest('tab', 'briefingCard'); // true
const canNest2 = factory.canNest('tab', 'tab'); // false
```

### 📡 EventBus.ts

**设计模式**: 观察者模式 + 单例模式

提供类型安全的事件通信机制。

```typescript
const eventBus = EventBus.getInstance();

// 订阅事件
const unsubscribe = eventBus.on(DesignerEvents.COMPONENT_ADD, (component) => {
  console.log('Component added:', component);
});

// 触发事件
eventBus.emit(DesignerEvents.COMPONENT_ADD, newComponent);

// 一次性订阅
eventBus.once(DesignerEvents.DRAG_END, () => {
  console.log('Drag ended');
});

// 取消订阅
unsubscribe();
```

### ⚡ CommandManager.ts

**设计模式**: 命令模式 + 单例模式

实现操作的撤销/重做功能。

```typescript
const commandManager = CommandManager.getInstance();

// 执行命令
const addCommand = new AddComponentCommand(layout, component);
commandManager.execute(addCommand);

// 撤销
if (commandManager.canUndo()) {
  commandManager.undo();
}

// 重做
if (commandManager.canRedo()) {
  commandManager.redo();
}
```

### 🎯 DragStrategy.ts

**设计模式**: 策略模式

为不同场景提供不同的拖拽策略。

```typescript
// 获取策略
const canvasStrategy = DragStrategyFactory.getStrategy('canvas');
const tabStrategy = DragStrategyFactory.getStrategy('tab');

// 使用策略
if (canvasStrategy.canDrop(widgetName)) {
  canvasStrategy.handleDragOver(context);
  const result = canvasStrategy.handleDrop(context);
}
```

### 🏪 DesignerStore.ts

**设计模式**: 单例模式 + 观察者模式

集中管理设计器的所有状态。

```typescript
const store = DesignerStore.getInstance();

// 获取只读状态
const state = store.getState();
console.log(state.layout, state.canUndo, state.canRedo);

// 操作方法
store.addComponent('briefingCard', { x: 0, y: 0 });
store.removeComponent('component-id');
store.updateComponent('component-id', { title: 'New Title' });

// 撤销/重做
store.undo();
store.redo();

// 导入/导出
const config = store.exportConfig();
store.importConfig(config);
```

## 事件列表

```typescript
enum DesignerEvents {
  DRAG_START = 'drag:start', // 开始拖拽
  DRAG_MOVE = 'drag:move', // 拖拽移动
  DRAG_END = 'drag:end', // 结束拖拽
  DRAG_OVER_TAB = 'drag:over-tab', // 拖拽到Tab上方
  COMPONENT_ADD = 'component:add', // 添加组件
  COMPONENT_REMOVE = 'component:remove', // 删除组件
  COMPONENT_UPDATE = 'component:update', // 更新组件
  LAYOUT_CHANGE = 'layout:change', // 布局变化
  TAB_DROP = 'tab:drop', // Tab内部放置
}
```

## 命令类型

- `AddComponentCommand` - 添加组件
- `RemoveComponentCommand` - 删除组件
- `UpdateComponentCommand` - 更新组件配置

## 使用示例

### 完整示例

```typescript
import {
  DesignerStore,
  EventBus,
  DesignerEvents,
  ComponentFactory,
} from '@/core';

// 1. 初始化
const store = DesignerStore.getInstance();
const eventBus = store.getEventBus();
const factory = store.getComponentFactory();

// 2. 监听事件
eventBus.on(DesignerEvents.LAYOUT_CHANGE, (layout) => {
  console.log('Layout updated:', layout);
});

// 3. 添加组件
store.addComponent('briefingCard', { x: 0, y: 0 });

// 4. 更新组件
store.updateComponent('component-id', {
  title: 'Updated Title',
});

// 5. 删除组件
store.removeComponent('component-id');

// 6. 撤销/重做
store.undo();
store.redo();

// 7. 导出配置
const config = store.exportConfig();
console.log(config);
```

### Vue组件中使用

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { DesignerStore, DesignerEvents } from '@/core';

const store = DesignerStore.getInstance();
const state = store.getState();
const eventBus = store.getEventBus();

// 监听事件
const unsubscribers: Array<() => void> = [];

onMounted(() => {
  unsubscribers.push(
    eventBus.on(DesignerEvents.COMPONENT_ADD, (component) => {
      console.log('Component added:', component);
    }),
  );
});

onUnmounted(() => {
  unsubscribers.forEach((unsub) => unsub());
});

function handleAddComponent() {
  store.addComponent('briefingCard', { x: 0, y: 0 });
}
</script>

<template>
  <div>
    <button @click="handleAddComponent">添加组件</button>
    <button @click="store.undo()" :disabled="!state.canUndo">撤销</button>
    <button @click="store.redo()" :disabled="!state.canRedo">重做</button>
  </div>
</template>
```

## 架构优势

✅ **关注点分离**: 每个模块职责单一
✅ **类型安全**: 完整的TypeScript类型支持
✅ **易于测试**: 模块独立，便于单元测试
✅ **可扩展**: 基于接口设计，易于扩展
✅ **可维护**: 代码结构清晰，易于维护

## 扩展指南

### 添加新的拖拽策略

```typescript
export class CustomDragStrategy implements DragStrategy {
  canDrop(widgetName: string): boolean {
    // 自定义规则
    return true;
  }

  handleDragOver(context: DragContext): void {
    // 自定义拖拽逻辑
  }

  handleDrop(context: DragContext): any | null {
    // 自定义放置逻辑
    return null;
  }

  cleanup(context: DragContext): void {
    // 清理逻辑
  }
}

// 注册策略
DragStrategyFactory.strategies.set('custom', new CustomDragStrategy());
```

### 添加新的命令

```typescript
export class CustomCommand implements Command {
  execute(): void {
    // 执行逻辑
  }

  undo(): void {
    // 撤销逻辑
  }

  redo(): void {
    // 重做逻辑
  }
}

// 使用命令
const command = new CustomCommand();
commandManager.execute(command);
```

### 添加新的事件

```typescript
// 在 EventBus.ts 中添加
export enum DesignerEvents {
  // ... 现有事件
  CUSTOM_EVENT = 'custom:event',
}

// 使用
eventBus.emit(DesignerEvents.CUSTOM_EVENT, data);
```

## 性能考虑

- 单例模式避免重复创建实例
- 命令历史限制为50条
- 事件使用Set存储，O(1)查找
- 深拷贝仅在必要时使用

## 测试建议

```typescript
describe('ComponentFactory', () => {
  it('should create component correctly', () => {
    const factory = ComponentFactory.getInstance();
    const component = factory.createComponent('briefingCard', { x: 0, y: 0 });

    expect(component).toBeDefined();
    expect(component.type).toBe('briefingCard');
    expect(component.x).toBe(0);
    expect(component.y).toBe(0);
  });
});

describe('EventBus', () => {
  it('should emit and receive events', () => {
    const eventBus = EventBus.getInstance();
    let received = false;

    eventBus.on(DesignerEvents.COMPONENT_ADD, () => {
      received = true;
    });

    eventBus.emit(DesignerEvents.COMPONENT_ADD);
    expect(received).toBe(true);
  });
});
```
