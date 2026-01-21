<template>
  <div class="carousel-widget">
    <div class="carousel-header">{{ config.title }}</div>
    <div class="carousel-content">
      <el-carousel height="300px" :interval="config?.interval || 3000">
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <div class="carousel-item-content">
            <img v-if="item.image" :src="item.image" :alt="item.title" />
            <div class="carousel-text">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  config: any;
}>();

const carouselItems = ref([
  {
    title: '轮播图1',
    description: '这是第一张轮播图的描述内容',
    image: '',
  },
  {
    title: '轮播图2',
    description: '这是第二张轮播图的描述内容',
    image: '',
  },
  {
    title: '轮播图3',
    description: '这是第三张轮播图的描述内容',
    image: '',
  },
]);
</script>

<style scoped lang="scss">
.carousel-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .carousel-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .carousel-content {
    flex: 1;
    overflow: hidden;

    .carousel-item-content {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-align: center;
      padding: 20px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .carousel-text {
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }

        p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
  }
}
</style>
