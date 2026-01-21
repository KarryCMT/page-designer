<template>
  <div class="data-dynamics-widget">
    <div class="dynamics-header">{{ config.title }}</div>
    <div class="dynamics-content">
      <el-carousel v-if="config.option?.pictureType === 'data'" height="200" :autoplay="config.option?.autoPlay">
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <div class="carousel-item">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div v-else class="dynamic-list">
        <div v-for="(item, index) in dynamics" :key="index" class="dynamic-item">
          <div class="dynamic-icon">📊</div>
          <div class="dynamic-content">
            <div class="dynamic-title">{{ item.title }}</div>
            <div class="dynamic-time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  config: any;
}>();

const carouselItems = ref([
  { title: '数据动态1', description: '这是一段动态数据描述' },
  { title: '数据动态2', description: '这是另一段动态数据描述' },
  { title: '数据动态3', description: '还有一段动态数据描述' },
]);

const dynamics = ref([
  { title: '新用户注册', time: '2分钟前' },
  { title: '订单完成', time: '5分钟前' },
  { title: '系统更新', time: '10分钟前' },
]);
</script>

<style scoped lang="scss">
.data-dynamics-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .dynamics-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .dynamics-content {
    flex: 1;
    overflow: hidden;

    .carousel-item {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;

      h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
      }

      p {
        margin: 0;
        font-size: 13px;
        opacity: 0.9;
      }
    }

    .dynamic-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .dynamic-item {
        display: flex;
        gap: 10px;
        padding: 10px;
        background-color: #f5f7fa;
        border-radius: 4px;

        .dynamic-icon {
          font-size: 20px;
        }

        .dynamic-content {
          flex: 1;

          .dynamic-title {
            font-size: 13px;
            color: #303133;
            margin-bottom: 2px;
          }

          .dynamic-time {
            font-size: 11px;
            color: #909399;
          }
        }
      }
    }
  }
}
</style>
