<template>
  <div class="iframe-widget">
    <div class="iframe-header">{{ config.title }}</div>
    <div class="iframe-content">
      <iframe
        :src="config?.url || defaultUrl"
        frameborder="0"
        allowfullscreen
        class="iframe-container"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  config: any;
}>();

const defaultUrl = ref('https://www.example.com');
</script>

<style scoped lang="scss">
.iframe-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .iframe-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .iframe-content {
    flex: 1;
    overflow: hidden;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    .iframe-container {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}
</style>
