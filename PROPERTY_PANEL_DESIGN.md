# 属性配置面板设计文档

## 设计模式应用

### 1. 工厂模式 (Factory Pattern)

**文件**: `src/designer/property-editors/PropertyEditorFactory.ts`

**作用**: 根据组件类型动态创建对应的属性编辑器

```typescript
const editorFactory = PropertyEditorFactory.getInstance();
const editor = editorFactory.getEditor('briefingCard'); // 返回 BriefingCardEditor
```

**优势**:

- ✅ 统一的编辑器创建逻辑
- ✅ 易于扩展新的编辑器
- ✅ 解耦组件类型和编辑器实现

### 2. 策略模式 (Strategy Pattern)

**实现**: 每个组件类型有独立的属性编辑器策略

**编辑器列表**:

- `BriefingCardEditor.vue` - 简报卡片编辑器
- `TabEditor.vue` - Tab组件编辑器
- `FormFieldEditor.vue` - 表单字段编辑器
- `DataTableEditor.vue` - 数据表格编辑器
- `CommonEditor.vue` - 通用编辑器（默认）

**优势**:

- ✅ 每个组件有专属的配置界面
- ✅ 易于维护和扩展
- ✅ 配置项清晰明确

### 3. 观察者模式 (Observer Pattern)

**实现**: 属性变化时通过事件通知更新

```typescript
// 属性编辑器触发更新
emit('update');

// PropertyPanel 监听并处理
@update="handlePropertyChange"

// 通知主设计器
emit('update', localConfig.value);
```

## 架构设计

### 组件层级

```
DesignerMain.vue
  └─ PropertyPanel.vue (属性面板容器)
      └─ 动态编辑器组件
          ├─ BriefingCardEditor.vue
          ├─ TabEditor.vue
          ├─ FormFieldEditor.vue
          ├─ DataTableEditor.vue
          └─ CommonEditor.vue
```

### 数据流

```
1. 用户点击组件
   ↓
2. ParserItem 触发 select 事件
   ↓
3. DesignerMain 更新 selectedComponent
   ↓
4. PropertyPanel 接收 selectedComponent
   ↓
5. PropertyEditorFactory 创建对应编辑器
   ↓
6. 用户修改属性
   ↓
7. 编辑器触发 update 事件
   ↓
8. PropertyPanel 通知 DesignerMain
   ↓
9. DesignerMain 使用 CommandManager 更新
   ↓
10. 支持撤销/重做
```

## 文件结构

```
src/designer/
├── PropertyPanel.vue                    # 属性面板容器
└── property-editors/                    # 属性编辑器目录
    ├── PropertyEditorFactory.ts         # 编辑器工厂
    ├── CommonEditor.vue                 # 通用编辑器
    ├── BriefingCardEditor.vue          # 简报卡片编辑器
    ├── TabEditor.vue                    # Tab编辑器
    ├── FormFieldEditor.vue             # 表单字段编辑器
    └── DataTableEditor.vue             # 数据表格编辑器
```

## 核心功能

### 1. PropertyPanel.vue

**职责**:

- 显示选中组件的基本信息
- 动态加载对应的属性编辑器
- 处理属性更新
- 提供关闭功能

**关键代码**:

```vue
<template>
  <div class="property-panel">
    <!-- 基本信息 -->
    <el-form>
      <el-form-item label="组件类型">
        <el-tag>{{ getComponentLabel(selectedComponent.type) }}</el-tag>
      </el-form-item>
    </el-form>

    <!-- 动态编辑器 -->
    <component
      :is="propertyEditorComponent"
      :config="localConfig"
      @update="handlePropertyChange"
    />
  </div>
</template>
```

### 2. PropertyEditorFactory.ts

**职责**:

- 注册所有属性编辑器
- 根据组件类型返回对应编辑器
- 支持动态注册新编辑器

**关键代码**:

```typescript
export class PropertyEditorFactory {
  private editors: Map<string, Component>;

  public getEditor(componentType: string): Component | null {
    return this.editors.get(componentType) || CommonEditor;
  }

  public registerEditor(componentType: string, editor: Component): void {
    this.editors.set(componentType, editor);
  }
}
```

### 3. 属性编辑器组件

**职责**:

- 提供特定组件的属性配置界面
- 处理用户输入
- 触发更新事件

**示例 - BriefingCardEditor.vue**:

```vue
<template>
  <el-form>
    <el-form-item label="卡片样式">
      <el-radio-group
        v-model="localConfig.card.cardStyle"
        @change="handleChange"
      >
        <el-radio label="card">卡片</el-radio>
        <el-radio label="plain">平铺</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="标题字体大小">
      <el-input-number
        v-model="localConfig.card.titleFontSize"
        @change="handleChange"
      />
    </el-form-item>
  </el-form>
</template>
```

## 使用指南

### 1. 添加新的属性编辑器

**步骤 1**: 创建编辑器组件

```vue
<!-- src/designer/property-editors/MyComponentEditor.vue -->
<template>
  <div class="my-component-editor">
    <el-form label-position="top">
      <el-form-item label="自定义属性">
        <el-input v-model="localConfig.customProp" @change="handleChange" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  config: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{ update: [] }>();

const localConfig = ref<any>({});

watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = { ...newConfig };
  },
  { immediate: true, deep: true },
);

function handleChange() {
  emit('update');
}
</script>
```

**步骤 2**: 在工厂中注册

```typescript
// PropertyEditorFactory.ts
import MyComponentEditor from './MyComponentEditor.vue';

private registerEditors(): void {
  // ... 其他编辑器
  this.editors.set('myComponent', MyComponentEditor);
}
```

### 2. 选中组件

```typescript
// 在 DesignerMain.vue 中
function handleSelectComponent(component: any) {
  selectedComponent.value = component;
}
```

### 3. 更新属性

```typescript
// 在 PropertyPanel.vue 中
function handlePropertyChange() {
  emit('update', localConfig.value);
}

// 在 DesignerMain.vue 中
function handleConfigUpdate(newConfig: any) {
  const command = new UpdateComponentCommand(
    layout.value,
    newConfig.i,
    newConfig,
  );
  commandManager.execute(command);
}
```

## 特性

### ✅ 已实现功能

1. **动态编辑器加载**
   - 根据组件类型自动加载对应编辑器
   - 支持回退到通用编辑器

2. **基本信息显示**
   - 组件类型
   - 组件ID
   - 标题配置

3. **布局配置**
   - 宽度/高度调整
   - 最小/最大值限制

4. **可见性配置**
   - PC端/移动端显示控制

5. **组件特定配置**
   - 简报卡片：样式、字体、颜色等
   - Tab组件：标签页管理
   - 表单字段：字段类型、验证规则
   - 数据表格：数据源、分页等

6. **撤销/重做支持**
   - 所有属性修改都支持撤销
   - 使用 CommandManager 管理

7. **选中状态**
   - 点击组件高亮显示
   - 边框和阴影效果

### 🔄 交互流程

1. **选中组件**

   ```
   用户点击组件 → ParserItem 触发 select 事件 → 更新 selectedComponent
   ```

2. **编辑属性**

   ```
   修改属性 → 编辑器触发 update → PropertyPanel 通知主设计器 → 使用命令模式更新
   ```

3. **取消选中**
   ```
   点击关闭按钮 → PropertyPanel 触发 close → 清空 selectedComponent
   ```

## 扩展性

### 1. 添加新的配置项

在对应的编辑器中添加表单项：

```vue
<el-form-item label="新配置项">
  <el-input
    v-model="localConfig.newProp"
    @change="handleChange"
  />
</el-form-item>
```

### 2. 自定义验证

```typescript
function handleChange() {
  // 添加验证逻辑
  if (localConfig.value.someValue < 0) {
    ElMessage.error('值不能小于0');
    return;
  }
  emit('update');
}
```

### 3. 复杂配置

```vue
<!-- 嵌套配置 -->
<el-collapse>
  <el-collapse-item title="高级配置">
    <el-form-item label="高级选项">
      <!-- 复杂配置项 -->
    </el-form-item>
  </el-collapse-item>
</el-collapse>
```

## 最佳实践

### 1. 属性命名

```typescript
// ✅ 推荐
localConfig.card.titleFontSize;
localConfig.option.showBorder;

// ❌ 不推荐
localConfig.tfs;
localConfig.sb;
```

### 2. 事件处理

```typescript
// ✅ 推荐 - 使用 @change
<el-input v-model="value" @change="handleChange" />

// ❌ 不推荐 - 使用 @input（会频繁触发）
<el-input v-model="value" @input="handleChange" />
```

### 3. 深拷贝配置

```typescript
// ✅ 推荐
localConfig.value = JSON.parse(JSON.stringify(newConfig));

// ❌ 不推荐 - 直接引用
localConfig.value = newConfig;
```

### 4. 条件渲染

```vue
<!-- ✅ 推荐 - 使用 v-if -->
<el-form-item v-if="localConfig.type === 'color'" label="颜色">
  <el-color-picker v-model="localConfig.color" />
</el-form-item>

<!-- ✅ 推荐 - 使用 v-show（频繁切换时）-->
<el-form-item v-show="showAdvanced" label="高级选项">
  <!-- ... -->
</el-form-item>
```

## 性能优化

### 1. 使用 shallowRef

```typescript
// 编辑器组件不需要深度响应
const propertyEditorComponent = shallowRef<any>(null);
```

### 2. 防抖处理

```typescript
import { debounce } from 'lodash-es';

const handleChange = debounce(() => {
  emit('update');
}, 300);
```

### 3. 懒加载编辑器

```typescript
// 使用动态导入
const editors = {
  briefingCard: () => import('./BriefingCardEditor.vue'),
  tab: () => import('./TabEditor.vue'),
};
```

## 总结

通过应用工厂模式和策略模式，我们实现了：

✅ **灵活的编辑器系统** - 每个组件有专属配置界面
✅ **易于扩展** - 添加新编辑器只需两步
✅ **类型安全** - 完整的 TypeScript 支持
✅ **撤销/重做** - 所有修改都可撤销
✅ **良好的用户体验** - 选中高亮、实时预览

这个设计为属性配置提供了强大而灵活的基础！
