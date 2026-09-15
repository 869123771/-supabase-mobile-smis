<script setup lang="ts">
import SmisIcon from './SmisIcon.vue'
import SmisStatusTag from './SmisStatusTag.vue'

defineProps<{
  title: string
  code: string
  status: string
  place?: string
  start?: string
  end?: string
  progress?: string
  dangerCount?: number
}>()
defineEmits<{ tap: [] }>()
</script>

<template>
  <button class="card" :class="`card--${status}`" @tap="$emit('tap')">
    <view class="card__head">
      <view class="card__title-wrap">
        <view class="card__rail" />
        <view class="card__heading">
          <text class="card__title line-clamp-2">{{ title }}</text>
          <text class="card__code">{{ code }}</text>
        </view>
      </view>
      <SmisStatusTag :status="status" />
    </view>
    <view v-if="place" class="card__meta">
      <SmisIcon name="location" size="28rpx" />
      <text class="line-clamp-2">{{ place }}</text>
    </view>
    <view class="card__foot">
      <text>{{ start }}{{ end ? ` — ${end}` : '' }}</text>
      <text v-if="dangerCount" class="card__danger">{{ dangerCount }} 项异常</text>
      <text v-else-if="progress" class="card__progress">{{ progress }}</text>
      <SmisIcon name="chevron" size="28rpx" />
    </view>
  </button>
</template>

<style scoped lang="scss">
.card { width: 100%; margin: 0; padding: 26rpx; text-align: left; border-radius: var(--smis-radius-lg); background: #fff; box-shadow: var(--smis-shadow-card); border: 1rpx solid var(--smis-line-soft); }
.card__head { display: flex; align-items: flex-start; gap: 20rpx; }
.card__title-wrap { min-width: 0; flex: 1; display: flex; gap: 16rpx; }
.card__rail { flex: 0 0 auto; width: 7rpx; height: 72rpx; border-radius: 8rpx; background: var(--smis-primary); }
.card--in_progress .card__rail { background: var(--smis-warning); }
.card--overdue .card__rail { background: var(--smis-danger); }
.card--completed .card__rail { background: var(--smis-success); }
.card__heading { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.card__title { color: var(--smis-text); font-size: 29rpx; line-height: 1.42; font-weight: 800; text-wrap: pretty; }
.card__code { margin-top: 9rpx; color: var(--smis-text-muted); font-size: 20rpx; font-variant-numeric: tabular-nums; }
.card__meta { margin-top: 22rpx; padding: 14rpx 16rpx; border-radius: 14rpx; color: var(--smis-text-secondary); background: var(--smis-control-bg); display: flex; align-items: flex-start; gap: 10rpx; font-size: 22rpx; }
.card__foot { margin-top: 18rpx; padding-top: 18rpx; border-top: 1rpx solid var(--smis-line-soft); color: var(--smis-text-muted); font-size: 20rpx; display: flex; align-items: center; gap: 10rpx; }
.card__foot > text:first-child { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
.card__danger { flex: 0 0 auto; color: var(--smis-danger); font-weight: 800; }
.card__progress { flex: 0 0 auto; color: var(--smis-text-secondary); font-weight: 700; }
</style>
