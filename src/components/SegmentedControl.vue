<template>
  <el-segmented
    :model-value="modelValue"
    :options="options"
    :size="size"
    @update:model-value="handleChange"
  >
    <template #default="{ item }">
      <div class="segmented-item">
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </div>
    </template>
  </el-segmented>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface SegmentedOption {
  label: string;
  value: string | number;
  icon?: Component;
}

interface Props {
  modelValue: string | number;
  options: SegmentedOption[];
  size?: 'large' | 'default' | 'small';
}

withDefaults(defineProps<Props>(), {
  size: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

function handleChange(value: string | number) {
  emit('update:modelValue', value);
}
</script>

<style lang="scss">
.el-segmented {
  --el-segmented-bg-color: var(--el-fill-color-light);
  --el-segmented-item-selected-bg-color: #ffffff;
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-border-radius-base: 8px;

  border-radius: 8px;
  padding: 4px;

  .el-segmented__group {
    gap: 4px;
  }

  .el-segmented__item {
    border-radius: 6px;
    padding: 6px 16px;

    &.is-selected {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>

<style lang="scss" scoped>
.segmented-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
</style>
