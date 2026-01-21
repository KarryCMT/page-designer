<template>
  <div class="briefing-card-editor">
    <el-form label-position="top" size="default">
      <!-- 卡片样式 -->
      <el-form-item label="卡片样式">
        <el-radio-group
          v-model="localConfig.card.cardStyle"
          @change="handleChange"
        >
          <el-radio label="card">卡片</el-radio>
          <el-radio label="plain">平铺</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 标题配置 -->
      <el-form-item label="标题字体大小">
        <el-input-number
          v-model="localConfig.card.titleFontSize"
          :min="12"
          :max="32"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="标题颜色">
        <el-color-picker
          v-model="localConfig.card.titleFontColor"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="标题对齐">
        <el-radio-group
          v-model="localConfig.card.titleLeft"
          @change="handleChange"
        >
          <el-radio label="left">左对齐</el-radio>
          <el-radio label="center">居中</el-radio>
          <el-radio label="right">右对齐</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="标题加粗">
        <el-switch
          v-model="localConfig.card.titleFontWeight"
          @change="handleChange"
        />
      </el-form-item>

      <!-- 背景配置 -->
      <el-form-item label="背景类型">
        <el-radio-group
          v-model="localConfig.card.backgroundType"
          @change="handleChange"
        >
          <el-radio label="color">颜色</el-radio>
          <el-radio label="image">图片</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="localConfig.card.backgroundType === 'color'"
        label="背景颜色"
      >
        <el-color-picker
          v-model="localConfig.card.titleBgColor"
          @change="handleChange"
        />
      </el-form-item>

      <!-- 简报字段配置 -->
      <el-form-item label="简报字段">
        <el-input
          v-model="localConfig.option.briefingFields"
          type="textarea"
          :rows="3"
          placeholder="配置简报字段"
          @change="handleChange"
        />
      </el-form-item>

      <!-- 行数配置 -->
      <el-form-item label="显示行数">
        <el-input-number
          v-model="localConfig.option.rowNumber"
          :min="1"
          :max="20"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="显示边框">
        <el-switch
          v-model="localConfig.option.showBorder"
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
  card: {},
  option: {}
});

watch(
  () => props.config,
  (newConfig) => {
    localConfig.value = {
      ...newConfig,
      card: { ...newConfig.card },
      option: { ...newConfig.option }
    };
  },
  { immediate: true, deep: true }
);

function handleChange() {
  emit('update');
}
</script>

<style lang="scss" scoped>
.briefing-card-editor {
  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
