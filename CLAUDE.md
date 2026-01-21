# Vue 3 可视化布局设计器项目

## 项目概述

这是一个基于 Vue 3 + Vite 的可视化布局设计器项目，允许用户通过拖拽方式创建和管理页面布局。项目使用 grid-layout-plus 实现网格布局系统，支持组件的拖拽、调整大小和嵌套布局。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite (使用 rolldown-vite@7.2.2)
- **UI 库**: Element Plus 2.13.0
- **布局系统**: grid-layout-plus 1.1.1
- **拖拽**: vuedraggable 4.1.0
- **工具库**: lodash-es 4.17.22
- **样式**: Sass 1.97.2
- **包管理器**: pnpm

## 项目架构

### 目录结构

```
src/
├── components/          # 组件库
│   ├── index.js        # 组件导出入口
│   └── widgets/        # 可拖拽组件
│       ├── BriefingCard.vue    # 简报卡片
│       ├── Carousel.vue        # 轮播图
│       ├── DataDynamics.vue    # 数据动态
│       ├── DataEntry.vue       # 数据填报
│       ├── DataTable.vue       # 数据表格
│       ├── FormField.vue       # 表单字段
│       ├── Iframe.vue          # 嵌入页面
│       ├── RichText.vue        # 富文本
│       ├── Steps.vue           # 阶段条
│       ├── Tab.vue             # 多标签页（支持嵌套布局）
│       └── TimeLine.vue        # 时间线
├── config/
│   └── components.js   # 组件配置定义（basicComponents）
├── designer/           # 设计器主模块
│   ├── main.vue       # 设计器主组件
│   └── index.scss     # 设计器样式
├── parser/            # 组件解析器
│   ├── main.vue       # 解析器主组件
│   ├── componentMap.ts # 组件名称映射
│   └── utils.ts       # 工具函数
├── App.vue            # 应用根组件
├── main.js            # 应用入口
└── style.css          # 全局样式
```

### 核心模块

#### 1. Designer（设计器）

**文件**: `src/designer/main.vue`

设计器是项目的核心模块，提供可视化布局编辑功能：

- **左侧面板**: 组件库，展示所有可拖拽的组件
- **中间画布**: 基于 GridLayout 的拖拽布局区域
- **右侧面板**: 组件属性配置（预留）

**关键功能**:

- 从组件库拖拽组件到画布
- 组件在画布上的拖拽和调整大小
- 组件的删除和配置更新
- 与 Tab 组件的拖拽交互（防止重复添加）

**拖拽状态管理**:

```javascript
const dragItem = {
  x,
  y, // 位置
  w,
  h, // 尺寸
  i, // ID
  type, // 组件类型
  componentData, // 完整配置数据
};
```

**事件通信**:

- `drag-start-from-designer`: 通知子组件开始拖拽
- `dragging-over-tab`: Tab 组件通知是否在其上方拖拽
- `global-drag-end`: 通知所有组件拖拽结束

#### 2. Parser（解析器）

**文件**: `src/parser/main.vue`

解析器负责将配置数据渲染为实际组件：

- 根据 `item.type` 动态加载对应组件
- 提供统一的组件容器（el-card）
- 处理组件的删除和配置更新事件

**组件映射**: `src/parser/componentMap.ts`

```typescript
widgetName -> 全局组件名称
briefingCard -> BriefingCard
tab -> Tab
...
```

#### 3. Components（组件库）

**配置文件**: `src/config/components.js`

定义了所有可用组件的配置，每个组件包含：

```javascript
{
  icon: 'ElementPlus图标名',
  label: '显示名称',
  widgetName: '组件唯一标识',
  title: '默认标题',
  w, h: 默认宽高,
  minW, minH, maxW, maxH: 尺寸限制,
  card: { /* 卡片样式配置 */ },
  option: { /* 组件特定配置 */ },
  children: [] // Tab 组件专用
}
```

**组件列表**:

1. **briefingCard** - 简报卡片：展示简报信息
2. **steps** - 阶段条：流程步骤展示
3. **tab** - 多标签页：支持嵌套布局的容器组件
4. **formField** - 表单字段：表单控件
5. **dataTable** - 数据表格：数据展示
6. **dataEntry** - 数据填报：数据录入
7. **dataDynamics** - 数据动态：动态数据展示
8. **timeLine** - 时间线：时间轴展示
9. **carousel** - 轮播图：图片轮播
10. **richText** - 富文本：富文本编辑
11. **iframe** - 嵌入页面：外部页面嵌入

#### 4. Tab 组件（特殊组件）

**文件**: `src/components/widgets/Tab.vue`

Tab 是唯一支持嵌套布局的容器组件，具有以下特性：

**核心功能**:

- 多标签页管理（children 数组）
- 每个标签页独立的 GridLayout
- 支持从外部拖入组件
- 防止 Tab 组件自身被拖入（避免无限嵌套）

**拖拽处理**:

- 监听 `drag-start-from-designer` 事件获取拖拽信息
- 使用 `handleTabDragOver` 处理拖拽悬停
- 使用 `handleTabDrop` 处理组件放置
- 通过 `dragging-over-tab` 事件通知 designer

**数据结构**:

```javascript
{
  widgetName: 'tab',
  active: 'Tab 1',  // 当前激活的标签页
  children: [
    {
      name: 'Tab 1',
      children: []    // 该标签页的布局数据
    }
  ]
}
```

**关键修复**:

- 解决了从外层拖入时创建额外组件的问题
- 当鼠标从外层移入 Tab 时，立即清理外层占位符
- 在 dragEnd 时检查 `isDraggingOverTab` 标记，避免重复添加

## 拖拽系统工作流程

### 1. 从组件库拖拽到画布

```
用户拖拽组件
  ↓
startDragFromSource() - 初始化 dragItem
  ↓
drag() - 在画布上显示占位符
  ↓
dragEnd() - 添加组件到 layout
```

### 2. 从组件库拖拽到 Tab 组件

```
用户拖拽组件
  ↓
startDragFromSource() - 初始化 dragItem
  ↓
发送 'drag-start-from-designer' 事件
  ↓
鼠标移入 Tab 区域
  ↓
Tab.handleTabDragOver() - 显示 Tab 内占位符
  ↓
发送 'dragging-over-tab' 事件 (true)
  ↓
Designer.handleDraggingOverTab() - 清理外层占位符
  ↓
Tab.handleTabDrop() - 添加组件到 Tab
  ↓
发送 'dragging-over-tab' 事件 (false)
  ↓
Designer.dragEnd() - 检测到在 Tab 内，不添加到外层
```

### 3. 外层移动后拖入 Tab（已修复）

```
用户拖拽组件
  ↓
在外层画布移动（创建外层占位符）
  ↓
鼠标移入 Tab 区域
  ↓
Tab 发送 'dragging-over-tab' (true)
  ↓
Designer.handleDraggingOverTab() 检测到状态变化
  ↓
立即清理外层占位符（关键修复）
  ↓
Tab 显示内部占位符
  ↓
释放鼠标
  ↓
Tab.handleTabDrop() 添加到 Tab
  ↓
Designer.dragEnd() 检测到 isDraggingOverTab，直接返回
```

## 关键技术点

### 1. GridLayout 配置

```javascript
{
  layout: [],           // 布局数据数组
  rowHeight: 30,        // 行高
  colNum: 12,          // 列数
  margin: [10, 10],    // 间距
  isDraggable: true,   // 可拖拽
  isResizable: true,   // 可调整大小
  verticalCompact: true, // 垂直压缩
  useCssTransforms: true // 使用 CSS 变换
}
```

### 2. 组件深拷贝

为避免引用问题，添加组件时使用深拷贝：

```javascript
const componentConfig = JSON.parse(JSON.stringify(dragItem.componentData));
```

### 3. 事件通信机制

使用 CustomEvent 实现跨组件通信：

```javascript
// 发送
window.dispatchEvent(new CustomEvent('event-name', { detail: data }));

// 接收
window.addEventListener('event-name', handler);
```

### 4. 节流优化

使用 lodash-es 的 throttle 优化拖拽性能：

```javascript
const drag = throttle(() => {
  /* ... */
}, 50);
```

## 开发指南

### 启动项目

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 添加新组件

1. 在 `src/components/widgets/` 创建组件文件
2. 在 `src/components/index.js` 导出组件
3. 在 `src/config/components.js` 添加组件配置
4. 在 `src/parser/componentMap.ts` 添加映射关系
5. 在 `src/main.js` 注册全局组件（如果需要）

### 组件开发规范

每个 widget 组件应该：

- 接收 `config` prop（组件配置数据）
- 发送 `update:config` 事件（配置更新）
- 发送 `remove` 事件（删除组件）
- 使用 TypeScript 类型定义

示例：

```vue
<script setup lang="ts">
const props = defineProps<{ config: any }>();
const emit = defineEmits(['update:config', 'remove']);
</script>
```

## 已知问题和解决方案

### 问题 1: Tab 组件拖入时创建额外组件

**现象**: 从左侧拖动组件，先在外层移动，然后移入 Tab 时会创建两个组件

**原因**:

- 外层 designer 在拖拽时创建了占位符
- 移入 Tab 时，外层占位符未及时清理
- dragEnd 时两个地方都尝试添加组件

**解决方案**:

1. 在 `handleDraggingOverTab` 中检测状态变化
2. 当 `isDraggingOverTab` 从 false 变为 true 时，立即清理外层占位符
3. 在 `dragEnd` 开头检查 `isDraggingOverTab` 和 `droppedInTabComponent`
4. 如果在 Tab 区域，清理占位符并直接返回

## 未来优化方向

1. **属性面板**: 实现右侧属性配置面板
2. **撤销/重做**: 添加操作历史管理
3. **组件库扩展**: 支持自定义组件注册
4. **布局模板**: 提供预设布局模板
5. **数据持久化**: 保存和加载布局配置
6. **响应式预览**: 支持不同设备尺寸预览
7. **组件联动**: 实现组件间的数据联动
8. **性能优化**: 大量组件时的渲染优化

## 注意事项

1. **TypeScript 支持**: 部分文件使用 TypeScript，但类型定义不完整
2. **lodash-es 类型**: 需要安装 `@types/lodash-es` 以获得完整类型支持
3. **组件嵌套**: 目前只有 Tab 组件支持嵌套，其他组件不支持
4. **拖拽限制**: Tab 组件不能拖入自身，避免无限嵌套
5. **事件清理**: 组件卸载时需要清理事件监听器

## 相关文档

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [grid-layout-plus 文档](https://github.com/grid-layout-plus/grid-layout-plus)
