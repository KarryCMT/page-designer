<template>
  <div class="data-table-editor">
    <el-form label-position="top" size="default">
      <el-form-item label="数据源表单ID">
        <el-input
          v-model="localConfig.option.dataTableConfig.dataSourceFormId"
          placeholder="请输入数据源表单ID"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="显示新增按钮">
        <el-switch
          v-model="localConfig.option.dataTableConfig.showAddData"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="单条数据搜索">
        <el-switch
          v-model="localConfig.option.dataTableConfig.isSearchSingerData"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="显示边框">
        <el-switch
          v-model="localConfig.option.showBorder"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="每页显示行数">
        <el-input-number
          v-model="localConfig.option.rowNumber"
          :min="5"
          :max="100"
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

const localConfig = ref<any>({
  option: {
    dataTableConfig: {}
  }
});

watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = {
      ...newConfig,
      option: {
        ...newConfig.option,
        dataTableConfig: { ...newConfig.option?.dataTableConfig }
      }
    };
  },
  { immediate: true, deep: true }
);

function handleChange() {
  emit('update');
}
</script>

<style lang="scss" scoped>
.data-table-editor {
  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
