<template>
  <div class="form-field-widget">
    <div class="form-header">{{ config.title }}</div>
    <div class="form-content">
      <div v-for="(field, index) in formFields" :key="index" class="form-item">
        <label>{{ field.label }}</label>
        <el-input
          v-if="field.type === 'input'"
          v-model="field.value"
          :placeholder="field.placeholder"
        />
        <el-select
          v-else-if="field.type === 'select'"
          v-model="field.value"
          :placeholder="field.placeholder"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="field.value"
          type="date"
          :placeholder="field.placeholder"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const props = defineProps<{
  config: any;
}>();

const formFields = reactive([
  { label: '字段名称', type: 'input', placeholder: '请输入', value: '' },
  { label: '状态', type: 'select', placeholder: '请选择', value: '', options: [
    { label: '启用', value: '1' },
    { label: '禁用', value: '0' }
  ]},
  { label: '日期', type: 'date', placeholder: '请选择日期', value: '' },
]);
</script>

<style scoped lang="scss">
.form-field-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .form-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .form-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 13px;
        color: #606266;
        font-weight: 500;
      }
    }
  }
}
</style>
