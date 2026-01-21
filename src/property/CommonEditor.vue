<template>
  <div class="common-editor">
    <el-form label-position="top" size="default">
      <el-form-item label="显示标签">
        <el-switch
          v-model="localConfig.showLabel"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="渲染键">
        <el-input
          v-model="localConfig.renderKey"
          placeholder="用于强制重新渲染"
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
.common-editor {
  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
