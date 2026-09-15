<script setup lang="ts">
import SmisIcon from './SmisIcon.vue'

withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
}>(), { description: '', icon: 'shield' })
</script>

<template>
  <view class="form-section surface-card">
    <view class="form-section__head">
      <view class="form-section__icon"><SmisIcon :name="icon" size="34rpx" /></view>
      <view class="form-section__copy">
        <text class="form-section__title">{{ title }}</text>
        <text v-if="description" class="form-section__description">{{ description }}</text>
      </view>
      <slot name="aside" />
    </view>
    <view class="form-section__body"><slot /></view>
  </view>
</template>

<style scoped lang="scss">
.form-section { padding: 26rpx; overflow: visible; }
.form-section + .form-section { margin-top: 18rpx; }
.form-section__head { display: flex; align-items: center; gap: 16rpx; }
.form-section__icon { width: 58rpx; height: 58rpx; flex: 0 0 58rpx; border-radius: 18rpx; color: var(--smis-primary); background: var(--smis-primary-soft); display: flex; align-items: center; justify-content: center; }
.form-section__copy { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.form-section__title { color: var(--smis-text); font-size: 28rpx; font-weight: 800; line-height: 1.25; }
.form-section__description { margin-top: 5rpx; color: var(--smis-text-muted); font-size: 20rpx; line-height: 1.45; }
.form-section__body { margin-top: 20rpx; }
</style>
