<template>
  <div class="tab-editor">
    <el-form label-position="top" size="default">
      <el-form-item label="标签页管理">
        <el-space direction="vertical" style="width: 100%">
          <div
            v-for="(tab, index) in localConfig.children"
            :key="index"
            class="tab-item"
          >
            <el-input
              v-model="tab.name"
              placeholder="标签页名称"
              @change="handleChange"
            >
              <template #append>
                <el-button
                  :icon="Delete"
                  @click="removeTab(Number(index))"
                  :disabled="localConfig.children.length <= 1"
                />
              </template>
            </el-input>
          </div>

          <el-button
            type="primary"
            :icon="Plus"
            @click="addTab"
            style="width: 100%"
          >
            添加标签页
          </el-button>
        </el-space>
      </el-form-item>

      <el-form-item label="默认激活">
        <el-select
          v-model="localConfig.active"
          placeholder="选择默认激活的标签页"
          @change="handleChange"
          style="width: 100%"
        >
          <el-option
            v-for="tab in localConfig.children"
            :key="tab.name"
            :label="tab.name"
            :value="tab.name"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Delete, Plus } from '@element-plus/icons-vue';

interface Props {
  config: any;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', config: any): void;
}>();

const localConfig = ref<any>({
  children: [],
  active: '',
});

watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = {
      ...newConfig,
      children: [...(newConfig.children || [])],
    };
  },
  { immediate: true, deep: true },
);

function addTab() {
  const newTabName = `Tab ${localConfig.value.children.length + 1}`;
  localConfig.value.children.push({
    name: newTabName,
    children: [],
  });

  // 如果是第一个标签页，设置为默认激活
  if (localConfig.value.children.length === 1) {
    localConfig.value.active = newTabName;
  }

  handleChange();
}

function removeTab(index: number) {
  if (localConfig.value.children.length <= 1) {
    return;
  }

  const removedTab = localConfig.value.children[index];
  localConfig.value.children.splice(index, 1);

  // 如果删除的是当前激活的标签页，切换到第一个
  if (localConfig.value.active === removedTab.name) {
    localConfig.value.active = localConfig.value.children[0]?.name || '';
  }

  handleChange();
}

function handleChange() {
  emit('update', localConfig.value);
}
</script>

<style lang="scss" scoped>
.tab-editor {
  .tab-item {
    width: 100%;

    .el-input {
      width: 100%;
    }
  }

  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
