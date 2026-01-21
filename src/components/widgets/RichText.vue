<template>
  <div class="rich-text-widget">
    <div class="rich-text-header">{{ config.title }}</div>
    <div class="rich-text-content">
      <div v-html="htmlContent" class="rich-text-display"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  config: any;
}>();

const htmlContent = ref(`
  <h2>富文本编辑器示例</h2>
  <p>这是一个<b>富文本编辑器</b>组件示例。</p>
  <p>支持以下功能：</p>
  <ul>
    <li>文本格式化（粗体、斜体、下划线）</li>
    <li>段落对齐</li>
    <li>插入链接和图片</li>
    <li>列表功能</li>
  </ul>
  <p>您可以通过配置传入自定义的 HTML 内容。</p>
`);
</script>

<style scoped lang="scss">
.rich-text-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .rich-text-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .rich-text-content {
    flex: 1;
    overflow: auto;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 16px;

    .rich-text-display {
      font-size: 14px;
      line-height: 1.6;
      color: #303133;

      :deep(h2) {
        font-size: 18px;
        margin: 0 0 12px 0;
        color: #303133;
      }

      :deep(p) {
        margin: 0 0 8px 0;
      }

      :deep(ul) {
        margin: 8px 0;
        padding-left: 20px;
      }

      :deep(li) {
        margin: 4px 0;
      }

      :deep(b) {
        color: #409eff;
      }
    }
  }
}
</style>
