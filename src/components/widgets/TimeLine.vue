<template>
  <div class="time-line-widget">
    <div class="timeline-header">{{ config.title }}</div>
    <div class="timeline-content">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in timelineData"
          :key="index"
          :timestamp="item.time"
          placement="top"
        >
          <el-card>
            <h4>{{ item.title }}</h4>
            <p>{{ item.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  config: any;
}>();

const timelineData = ref([
  {
    time: '2024-01-01 10:00',
    title: '项目启动',
    content: '项目正式启动，团队组建完成',
  },
  {
    time: '2024-01-15 14:00',
    title: '需求评审',
    content: '完成需求评审，确定项目范围',
  },
  {
    time: '2024-02-01 09:00',
    title: '开发阶段',
    content: '进入开发阶段，核心功能开发中',
  },
]);
</script>

<style scoped lang="scss">
.time-line-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  .timeline-header {
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .timeline-content {
    flex: 1;
    overflow: auto;

    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #303133;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: #606266;
      line-height: 1.6;
    }
  }
}
</style>
