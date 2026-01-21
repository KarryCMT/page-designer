<template>
  <div class="data-entry-widget">
    <div class="entry-header">{{ config.title }}</div>
    <div class="entry-content">
      <el-form :model="formData" label-width="80px" size="small">
        <el-form-item label="姓名">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const props = defineProps<{
  config: any;
}>();

const formData = reactive({
  name: '',
  email: '',
  remark: '',
});

function handleSubmit() {
  console.log('提交数据:', formData);
  alert('提交成功！');
}

function handleReset() {
  formData.name = '';
  formData.email = '';
  formData.remark = '';
}
</script>

<style scoped lang="scss">
.data-entry-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .entry-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .entry-content {
    flex: 1;
    overflow: auto;
  }
}
</style>
