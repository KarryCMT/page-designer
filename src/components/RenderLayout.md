# RenderLayout 组件

用于在不同页面渲染设计器生成的画布配置的独立组件。

## 功能特性

- 纯渲染模式：禁用拖拽和调整大小
- 响应式布局：自动适配移动端、平板、桌面端
- 完全独立：可在任何页面使用
- 自动隐藏：隐藏所有编辑操作按钮

## Props

| 参数             | 说明                                | 类型               | 默认值   |
| ---------------- | ----------------------------------- | ------------------ | -------- |
| layout           | 布局配置数据（从设计器导出的 JSON） | `Array`            | 必填     |
| rowHeight        | 行高                                | `number`           | 30       |
| colNum           | 列数（桌面端）                      | `number`           | 12       |
| margin           | 边距 [水平, 垂直]                   | `[number, number]` | [10, 10] |
| responsive       | 是否启用响应式布局                  | `boolean`          | true     |
| mobileBreakpoint | 移动端断点（px）                    | `number`           | 768      |
| tabletBreakpoint | 平板断点（px）                      | `number`           | 1024     |

## 响应式特性

组件默认启用响应式布局，会根据屏幕宽度自动调整：

- **移动端** (< 768px)：单列布局，组件垂直堆叠
- **平板** (768px - 1024px)：6 列布局，按比例缩放
- **桌面端** (> 1024px)：12 列布局（或自定义列数）

## 使用示例

### 基础使用（自动响应式）

```vue
<template>
  <!-- 默认启用响应式，自动适配所有设备 -->
  <RenderLayout :layout="layoutConfig" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RenderLayout } from '@/components';

// 从设计器导出的配置
const layoutConfig = ref([
  {
    i: '1',
    x: 0,
    y: 0,
    w: 6,
    h: 4,
    type: 'briefingCard',
    config: {
      title: '标题',
      content: '内容',
    },
  },
  // ... 更多组件
]);
</script>
```

### 禁用响应式（固定布局）

```vue
<template>
  <RenderLayout :layout="layoutConfig" :responsive="false" />
</template>
```

### 自定义断点

```vue
<template>
  <RenderLayout
    :layout="layoutConfig"
    :mobile-breakpoint="600"
    :tablet-breakpoint="900"
  />
</template>
```

### 自定义配置

```vue
<template>
  <RenderLayout
    :layout="layoutConfig"
    :row-height="40"
    :col-num="12"
    :margin="[15, 15]"
  />
</template>
```

### 从 API 加载配置

```vue
<template>
  <div v-loading="loading">
    <RenderLayout v-if="layoutConfig" :layout="layoutConfig" />
    <el-empty v-else description="暂无配置" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RenderLayout } from '@/components';
import axios from 'axios';

const layoutConfig = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/layout-config');
    layoutConfig.value = data;
  } catch (error) {
    console.error('加载配置失败:', error);
  } finally {
    loading.value = false;
  }
});
</script>
```

### 在移动端 H5 页面中使用

```vue
<template>
  <div class="mobile-page">
    <RenderLayout :layout="layoutConfig" :row-height="25" :margin="[8, 8]" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RenderLayout } from '@/components';

const layoutConfig = ref([
  /* 配置数据 */
]);
</script>

<style scoped>
.mobile-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
```

## 注意事项

1. **配置格式**：确保传入的 layout 数据格式与设计器导出的格式一致
2. **组件注册**：确保所有使用的组件类型都已在 `componentMap.ts` 中注册
3. **样式继承**：组件会继承父容器的宽高，建议设置明确的容器尺寸
4. **性能优化**：大量组件时建议使用虚拟滚动或分页加载
5. **移动端优化**：组件已内置移动端样式优化（字体大小、间距等）

## 响应式行为说明

### 桌面端 (> 1024px)

- 使用原始布局配置
- 保持设计器中的布局结构

### 平板 (768px - 1024px)

- 自动缩放到 6 列布局
- 按比例调整组件位置和宽度
- 保持相对布局关系

### 移动端 (< 768px)

- 强制单列布局
- 所有组件垂直堆叠
- 自动调整内边距和字体大小
- 表格支持横向滚动

## 与设计器的区别

| 特性     | 设计器 | RenderLayout |
| -------- | ------ | ------------ |
| 拖拽     | ✅     | ❌           |
| 调整大小 | ✅     | ❌           |
| 编辑按钮 | ✅     | ❌           |
| 删除操作 | ✅     | ❌           |
| 属性配置 | ✅     | ❌           |
| 响应式   | ❌     | ✅           |
| 纯展示   | ❌     | ✅           |
