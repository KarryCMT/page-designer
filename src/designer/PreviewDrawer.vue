<template>
  <el-drawer
    v-model="visible"
    direction="btt"
    size="100%"
    :before-close="handleClose"
    class="preview-drawer"
    :close-on-press-escape="true"
    :show-close="false"
  >
    <!-- 自定义 header -->
    <template #header>
      <div class="preview-toolbar">
        <div class="toolbar-left">预览模式</div>

        <div class="toolbar-center">
          <!-- 设备切换 -->
          <SegmentedControl
            v-model="deviceType"
            :options="deviceOptions"
            size="default"
          />
        </div>

        <div class="toolbar-right">
          <el-icon @click="handleClose"><Close /></el-icon>
        </div>
      </div>
    </template>

    <!-- 预览画布 -->
    <div class="preview-canvas" :class="`device-${deviceType}`">
      <div class="preview-wrapper" :class="deviceClass">
        <RenderLayout
          :layout="mobileLayout"
          :row-height="30"
          :col-num="colNum"
          :margin="[10, 10]"
        />
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Close, Monitor, Iphone, Cellphone } from '@element-plus/icons-vue';
import RenderLayout from '../components/RenderLayout.vue';
import SegmentedControl from '../components/SegmentedControl.vue';

interface Props {
  modelValue: boolean;
  layout: any[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 设备类型
const deviceType = ref<'desktop' | 'tablet' | 'mobile'>('desktop');

// 设备选项配置
const deviceOptions = [
  {
    label: '桌面端',
    value: 'desktop',
    icon: Monitor,
  },
  {
    label: '平板',
    value: 'tablet',
    icon: Cellphone,
  },
  {
    label: '移动端',
    value: 'mobile',
    icon: Iphone,
  },
];

// 根据设备类型计算列数
const colNum = computed(() => {
  switch (deviceType.value) {
    case 'mobile':
      return 1; // 移动端单列
    case 'tablet':
      return 6; // 平板 6 列
    case 'desktop':
    default:
      return 12; // 桌面端 12 列
  }
});

// 根据设备类型调整布局
const mobileLayout = computed(() => {
  if (deviceType.value === 'mobile') {
    // 移动端：每个组件占满一行
    let currentY = 0;
    return props.layout.map((item) => {
      const newItem = {
        ...item,
        x: 0,
        y: currentY,
        w: 1, // 占满单列
        h: item.h || 4,
      };
      currentY += newItem.h;
      return newItem;
    });
  } else if (deviceType.value === 'tablet') {
    // 平板：调整为 6 列布局
    return props.layout.map((item) => ({
      ...item,
      x: Math.floor((item.x / 12) * 6), // 按比例缩放 x 坐标
      w: Math.ceil((item.w / 12) * 6), // 按比例缩放宽度
    }));
  } else {
    // 桌面端：保持原布局
    return props.layout;
  }
});

// 设备样式类
const deviceClass = computed(() => {
  return {
    'device-desktop': deviceType.value === 'desktop',
    'device-tablet': deviceType.value === 'tablet',
    'device-mobile': deviceType.value === 'mobile',
  };
});

function handleClose() {
  visible.value = false;
}
</script>

<style lang="scss">
.preview-drawer {
  .el-drawer__header {
    padding: 0 !important;
    margin-bottom: 0 !important;
  }

  .el-drawer__body {
    padding: 0 !important;
  }
}
</style>
<style lang="scss" scoped>
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 8px;
  height: 48px;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .toolbar-center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex: 1;
  }
}

.preview-canvas {
  height: 100%;
  background-color: var(--el-fill-color-lighter);
  overflow: auto;
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  .preview-wrapper {
    width: 100%;
    height: 100%;
    transition: all 0.3s ease;
    background-color: var(--el-bg-color);
    overflow: auto;
    position: relative; // 为伪元素提供定位上下文

    // 桌面端 - 全宽
    &.device-desktop {
      max-width: 100%;
      border: 1px solid var(--el-border-color);
    }

    // 平板 - iPad 尺寸 (768px x 1024px)
    &.device-tablet {
      max-width: 768px;
      height: 1024px;
      margin-top: 20px;
      border: 16px solid #2c2c2c;
      border-radius: 24px;
      box-shadow:
        0 0 0 2px #1a1a1a,
        0 10px 40px rgba(0, 0, 0, 0.3);

      &::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 4px;
        background-color: #444;
        border-radius: 2px;
        z-index: 10;
      }
    }

    // 移动端 - iPhone 尺寸 (375px x 812px)
    &.device-mobile {
      max-width: 375px;
      height: 812px;
      margin-top: 20px;
      border: 12px solid #2c2c2c;
      border-radius: 36px;
      box-shadow:
        0 0 0 2px #1a1a1a,
        0 10px 40px rgba(0, 0, 0, 0.3);
      position: relative;

      // 刘海屏效果
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 24px;
        background-color: #2c2c2c;
        border-radius: 0 0 16px 16px;
        z-index: 10;
      }

      // 底部指示条
      &::after {
        content: '';
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 120px;
        height: 4px;
        background-color: #444;
        border-radius: 2px;
      }
    }
  }

  :deep(.vgl-layout) {
    background-color: transparent;
    width: 100%;
    min-height: 100%;
    padding: 20px;
    box-sizing: border-box;
  }

  :deep(.vgl-item) {
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    box-sizing: border-box;
    cursor: default;

    // 预览模式下禁用拖拽和调整大小的视觉效果
    &:hover {
      border-color: var(--el-border-color);
    }
  }

  // 隐藏删除按钮等操作按钮
  :deep(.el-card__header) {
    .el-button {
      display: none;
    }
  }

  // 移动端模式下调整内容
  &.device-mobile {
    .preview-wrapper {
      :deep(.vgl-layout) {
        padding: 32px 12px 16px; // 顶部留出刘海空间
      }
    }
  }

  // 平板模式下调整内容
  &.device-tablet {
    .preview-wrapper {
      :deep(.vgl-layout) {
        padding: 24px 16px;
      }
    }
  }
}
</style>
