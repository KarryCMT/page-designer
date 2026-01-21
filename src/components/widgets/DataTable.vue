<template>
  <div class="data-table-widget">
    <div class="table-header">{{ config.title }}</div>
    <el-table :data="tableData" style="width: 100%" size="small" border>
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
      />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  config: any;
}>();

const tableData = ref([
  { name: '张三', age: 25, city: '北京' },
  { name: '李四', age: 30, city: '上海' },
  { name: '王五', age: 28, city: '广州' },
  { name: '赵六', age: 35, city: '深圳' },
]);

const columns = [
  { prop: 'name', label: '姓名', width: '120' },
  { prop: 'age', label: '年龄', width: '80' },
  { prop: 'city', label: '城市', width: '120' },
];
</script>

<style scoped lang="scss">
.data-table-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .table-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }
}
</style>
