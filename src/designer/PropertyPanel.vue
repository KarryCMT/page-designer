<template>
  <div class="attr-panel" :class="{ collapsed: isCollapsed }">
    <!-- 收起状态的展开按钮 -->
    <div v-if="isCollapsed" class="collapsed-trigger" @click="toggleCollapse">
      <el-icon><DArrowLeft /></el-icon>
    </div>

    <!-- 展开状态 -->
    <template v-else>
      <!-- 面板头部 -->
      <div class="attr-panel-header">
        <el-button text class="collapse-btn" @click="toggleCollapse">
          <el-icon><DArrowRight /></el-icon>
        </el-button>
      </div>

      <!-- 属性面板内容 -->
      <div class="property-panel">
        <div class="panel-header">
          <h3>属性面板</h3>
          <el-button
            v-if="selectedComponent"
            text
            type="danger"
            size="small"
            @click="handleClose"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div class="panel-content">
          <!-- 未选中组件时的空状态 -->
          <el-empty
            v-if="!selectedComponent"
            description="请选择一个组件"
            :image-size="100"
          />

          <!-- 已选中组件时显示属性配置 -->
          <div v-else class="property-form">
            <!-- 组件基本信息 -->
            <el-divider content-position="left">基本信息</el-divider>
            <el-form label-position="top" size="default">
              <el-form-item label="组件类型">
                <el-tag>{{ getComponentLabel(selectedComponent.type) }}</el-tag>
              </el-form-item>

              <el-form-item label="组件ID">
                <el-input :value="selectedComponent.i" disabled />
              </el-form-item>

              <el-form-item label="标题">
                <el-input
                  v-model="localConfig.title"
                  placeholder="请输入标题"
                  @change="handlePropertyChange"
                />
              </el-form-item>
            </el-form>

            <!-- 动态属性配置区域 -->
            <el-divider content-position="left">组件配置</el-divider>
            <component
              :is="propertyEditorComponent"
              v-if="propertyEditorComponent"
              :config="localConfig"
              @update="handlePropertyChange"
            />

            <!-- 布局配置 -->
            <el-divider content-position="left">布局配置</el-divider>
            <el-form label-position="top" size="default">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item label="宽度">
                    <el-input-number
                      v-model="localConfig.w"
                      :min="selectedComponent.minW || 1"
                      :max="12"
                      @change="handlePropertyChange"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="高度">
                    <el-input-number
                      v-model="localConfig.h"
                      :min="selectedComponent.minH || 1"
                      :max="20"
                      @change="handlePropertyChange"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <!-- 可见性配置 -->
            <el-divider content-position="left">可见性</el-divider>
            <el-form label-position="top" size="default">
              <el-form-item label="显示平台">
                <el-checkbox-group
                  v-model="localConfig.visibility"
                  @change="handlePropertyChange"
                >
                  <el-checkbox label="pc">PC端</el-checkbox>
                  <el-checkbox label="app">移动端</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue';
import { Close, DArrowLeft, DArrowRight } from '@element-plus/icons-vue';
import { ComponentFactory } from '../core';
import { PropertyEditorFactory } from '../property/PropertyEditorFactory';

interface Props {
  selectedComponent: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [config: any];
  close: [];
}>();

const componentFactory = ComponentFactory.getInstance();
const editorFactory = PropertyEditorFactory.getInstance();

// 本地配置副本，避免直接修改props
const localConfig = ref<any>({});

// 动态获取属性编辑器组件
const propertyEditorComponent = shallowRef<any>(null);

// 收起状态
const isCollapsed = ref(false);

// 监听选中组件变化
watch(
  () => props.selectedComponent,
  (newComponent) => {
    if (newComponent) {
      // 深拷贝配置
      localConfig.value = JSON.parse(JSON.stringify(newComponent));

      // 获取对应的属性编辑器
      propertyEditorComponent.value = editorFactory.getEditor(
        newComponent.type,
      );
    } else {
      localConfig.value = {};
      propertyEditorComponent.value = null;
    }
  },
  { immediate: true, deep: true },
);

// 获取组件显示名称
function getComponentLabel(type: string): string {
  const config = componentFactory.getComponentConfig(type);
  return config?.label || type;
}

// 处理属性变化
function handlePropertyChange() {
  // 通知父组件更新
  emit('update', localConfig.value);
}

// 关闭面板
function handleClose() {
  emit('close');
}

// 切换收起/展开
function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<style lang="scss" scoped>
// 外层容器样式（从 index.scss 移过来）
.attr-panel {
  width: 320px;
  flex-shrink: 0;
  background-color: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease;

  &.collapsed {
    width: 50px;
    overflow: visible;
  }

  .attr-panel-header {
    height: 40px;
    padding: 10px;
    border-bottom: 1px solid var(--el-border-color);
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .collapse-btn {
      padding: 4px;
    }
  }

  .collapsed-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
    height: 100%;

    .el-icon {
      color: var(--el-text-color-regular);
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }
}

// 原有的属性面板内容样式
.property-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);

  .panel-header {
    height: 40px;
    padding: 15px;
    border-bottom: 1px solid var(--el-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;

    .property-form {
      .el-divider {
        margin: 20px 0 15px;
      }

      .el-form {
        .el-form-item {
          margin-bottom: 18px;
        }
      }
    }
  }
}
</style>
