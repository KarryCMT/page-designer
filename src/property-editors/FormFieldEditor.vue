<template>
  <div class="form-field-editor">
    <el-form label-position="top" size="default">
      <el-form-item label="字段类型">
        <el-select
          v-model="localConfig.fieldType"
          placeholder="选择字段类型"
          @change="handleChange"
          style="width: 100%"
        >
          <el-option label="文本输入" value="input" />
          <el-option label="多行文本" value="textarea" />
          <el-option label="数字输入" value="number" />
          <el-option label="日期选择" value="date" />
          <el-option label="下拉选择" value="select" />
          <el-option label="单选框" value="radio" />
          <el-option label="复选框" value="checkbox" />
        </el-select>
      </el-form-item>

      <el-form-item label="字段名称">
        <el-input
          v-model="localConfig.fieldName"
          placeholder="请输入字段名称"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="占位符">
        <el-input
          v-model="localConfig.placeholder"
          placeholder="请输入占位符文本"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="必填">
        <el-switch
          v-model="localConfig.required"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="禁用">
        <el-switch
          v-model="localConfig.disabled"
          @change="handleChange"
        />
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
const emit = defineEmits<{
  update: [];
}>();

const localConfig = ref<any>({});

watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = { ...newConfig };
  },
  { immediate: true, deep: true }
);

function handleChange() {
  emit('update');
}
</script>

<style lang="scss" scoped>
.form-field-editor {
  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
