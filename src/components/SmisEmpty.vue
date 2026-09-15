<script setup lang="ts">
import SmisIcon from './SmisIcon.vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '暂无数据',
    description: '当前筛选条件下没有记录',
  },
)
</script>

<template>
  <view class="empty" role="status">
    <view class="empty__visual" aria-hidden="true">
      <view class="i empty__orbit" />
      <view class="empty__icon">
        <SmisIcon name="shield" size="44rpx" />
      </view>
    </view>
    <text class="empty__title">{{ title }}</text>
    <text class="empty__desc">{{ description }}</text>
  </view>
</template>

<style scoped>
.empty {
  min-height: 360rpx;
  padding: 86rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--smis-text-muted);
}

.empty__visual {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty__orbit {
  position: absolute;
  inset: 0;
  border: 2rpx dashed rgba(79, 70, 229, 0.2);
  border-radius: 50%;
}

.empty__icon {
  width: 82rpx;
  height: 82rpx;
  border: 1rpx solid rgba(79, 70, 229, 0.12);
  border-radius: 27rpx;
  background: linear-gradient(145deg, #ffffff 0%, var(--smis-primary-soft) 100%);
  box-shadow: 0 14rpx 28rpx rgba(49, 46, 129, 0.12);
  color: var(--smis-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty__title {
  margin-top: 25rpx;
  color: var(--smis-text);
  font-size: 29rpx;
  font-weight: 750;
  line-height: 1.4;
}

.empty__desc {
  max-width: 460rpx;
  margin-top: 9rpx;
  text-align: center;
  font-size: 23rpx;
  line-height: 1.65;
}
</style>
