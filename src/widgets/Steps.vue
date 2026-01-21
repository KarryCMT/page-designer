<template>
  <div class="steps-widget">
    <div class="steps-header">{{ config.title }}</div>
    <div class="steps-content">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{ active: step.active }"
      >
        <div class="step-icon">{{ index + 1 }}</div>
        <div class="step-title">{{ step.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  config: any;
}>();

const steps = computed(() => [
  { title: '阶段一', active: false },
  { title: '阶段二', active: true },
  { title: '阶段三', active: false },
  { title: '阶段四', active: false },
]);
</script>

<style scoped lang="scss">
.steps-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .steps-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .steps-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .step-item {
      display: flex;
      align-items: center;
      gap: 12px;

      &.active {
        .step-icon {
          background-color: #409eff;
          color: white;
        }
      }

      .step-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #e4e7ed;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #606266;
        font-weight: 600;
      }

      .step-title {
        font-size: 13px;
        color: #303133;
      }
    }
  }
}
</style>
