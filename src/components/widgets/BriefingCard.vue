<template>
  <div class="briefing-card-widget">
    <div class="card-header">
      <i :class="config.card?.cardIcon"></i>
      <span>{{ config.title }}</span>
    </div>
    <div class="card-content">
      <h4>{{ config.subTitle }}</h4>
      <div class="briefing-list">
        <div v-for="(item, index) in config.option?.briefingFields" :key="index" class="briefing-item">
          <span class="label">{{ item.label }}:</span>
          <span class="value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  config: any;
}>();
</script>

<style scoped lang="scss">
.briefing-card-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    font-size: 14px;

    i {
      font-size: 16px;
    }
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #303133;
    }

    .briefing-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .briefing-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        background-color: #f5f7fa;
        border-radius: 4px;
        font-size: 12px;

        .label {
          color: #606266;
          font-weight: 500;
        }

        .value {
          color: #303133;
        }
      }
    }
  }
}
</style>
