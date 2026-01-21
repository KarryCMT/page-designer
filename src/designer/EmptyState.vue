<template>
  <div class="empty-state-overlay">
    <div class="empty-state-content">
      <!-- 图标区域 -->
      <div class="icon-wrapper">
        <el-icon :size="iconSize" class="empty-icon">
          <component :is="icon" />
        </el-icon>
        <!-- 装饰圆圈 -->
        <div class="icon-circle circle-1"></div>
        <div class="icon-circle circle-2"></div>
      </div>

      <!-- 描述区域 -->
      <div class="description-wrapper">
        <slot name="description">
          <p class="empty-description">{{ description }}</p>
        </slot>
      </div>

      <!-- 操作区域 -->
      <div v-if="$slots.default" class="action-wrapper">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description?: string;
  icon?: any;
  iconSize?: number;
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  iconSize: 80,
});
</script>

<style lang="scss" scoped>
.empty-state-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #f2f3f5 100%);
  z-index: 10;
  pointer-events: none;

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    pointer-events: auto;
    animation: fadeInUp 0.6s ease-out;
  }

  .icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 140px;

    .empty-icon {
      color: var(--el-color-primary);
      opacity: 0.8;
      z-index: 2;
      animation: float 3s ease-in-out infinite;
    }

    .icon-circle {
      position: absolute;
      border-radius: 50%;
      border: 2px solid var(--el-color-primary);
      opacity: 0.1;

      &.circle-1 {
        width: 100px;
        height: 100px;
        animation: pulse 2s ease-in-out infinite;
      }

      &.circle-2 {
        width: 140px;
        height: 140px;
        animation: pulse 2s ease-in-out infinite 0.5s;
      }
    }
  }

  .description-wrapper {
    text-align: center;
    max-width: 400px;

    :deep(.empty-title) {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
      line-height: 1.5;
    }

    :deep(.empty-hint) {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin: 0;
      line-height: 1.6;
    }

    .empty-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin: 0;
      line-height: 1.6;
    }
  }

  .action-wrapper {
    margin-top: 8px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.2;
  }
}
</style>
