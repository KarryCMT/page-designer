<template>
  <div class="render-layout">
    <!-- 空状态 -->
    <div v-if="layout.length === 0" class="empty-state">
      <el-empty description="暂无内容">
        <template #image>
          <el-icon :size="80" color="var(--el-color-info)">
            <Box />
          </el-icon>
        </template>
      </el-empty>
    </div>

    <!-- 布局内容 -->
    <GridLayout
      v-else
      :layout="responsiveLayout"
      :row-height="rowHeight"
      :col-num="responsiveColNum"
      :margin="margin"
      :is-draggable="false"
      :is-resizable="false"
      :vertical-compact="true"
      :use-css-transforms="true"
    >
      <template #item="{ item }">
        <ParserItem :item="item" :preview-mode="true" />
      </template>
    </GridLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Box } from '@element-plus/icons-vue';
import ParserItem from '../designer/ParserItem.vue';

interface Props {
  /** 布局配置数据 */
  layout: any[];
  /** 行高，默认 30 */
  rowHeight?: number;
  /** 列数，默认 12（桌面端），会根据屏幕自动调整 */
  colNum?: number;
  /** 边距 [水平, 垂直]，默认 [10, 10] */
  margin?: [number, number];
  /** 是否启用响应式，默认 true */
  responsive?: boolean;
  /** 移动端断点，默认 768px */
  mobileBreakpoint?: number;
  /** 平板断点，默认 1024px */
  tabletBreakpoint?: number;
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 30,
  colNum: 12,
  margin: () => [10, 10],
  responsive: true,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
});

// 屏幕宽度
const screenWidth = ref(window.innerWidth);

// 设备类型
const deviceType = computed(() => {
  if (!props.responsive) return 'desktop';

  if (screenWidth.value < props.mobileBreakpoint) {
    return 'mobile';
  } else if (screenWidth.value < props.tabletBreakpoint) {
    return 'tablet';
  }
  return 'desktop';
});

// 响应式列数
const responsiveColNum = computed(() => {
  if (!props.responsive) return props.colNum;

  switch (deviceType.value) {
    case 'mobile':
      return 1; // 移动端单列
    case 'tablet':
      return 6; // 平板 6 列
    case 'desktop':
    default:
      return props.colNum; // 桌面端使用传入的列数
  }
});

// 响应式布局
const responsiveLayout = computed(() => {
  if (!props.responsive || deviceType.value === 'desktop') {
    return props.layout;
  }

  if (deviceType.value === 'mobile') {
    // 移动端：每个组件占满一行，垂直堆叠
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
    // 平板：按比例缩放到 6 列布局
    return props.layout.map((item) => ({
      ...item,
      x: Math.floor((item.x / props.colNum) * 6), // 按比例缩放 x 坐标
      w: Math.ceil((item.w / props.colNum) * 6), // 按比例缩放宽度
    }));
  }

  return props.layout;
});

// 监听窗口大小变化
function handleResize() {
  screenWidth.value = window.innerWidth;
}

onMounted(() => {
  if (props.responsive) {
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (props.responsive) {
    window.removeEventListener('resize', handleResize);
  }
});
</script>

<style lang="scss" scoped>
.render-layout {
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color);
  position: relative;

  // 空状态样式
  .empty-state {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-bg-color);
  }

  :deep(.vgl-layout) {
    background-color: transparent;
    width: 100%;
    min-height: 100%;
  }

  :deep(.vgl-item) {
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    box-sizing: border-box;
    cursor: default;

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

  // 移动端优化
  @media (max-width: 768px) {
    :deep(.vgl-layout) {
      padding: 8px;
    }

    :deep(.vgl-item) {
      font-size: 14px;
    }

    // 移动端表格横向滚动
    :deep(.el-table) {
      font-size: 12px;
    }

    // 移动端表单优化
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }

  // 平板优化
  @media (min-width: 768px) and (max-width: 1024px) {
    :deep(.vgl-layout) {
      padding: 12px;
    }
  }
}
</style>
