<script setup lang="ts">
defineProps<{
  loading?: boolean
  finished?: boolean
  count?: number
}>()
</script>

<template>
  <view v-if="loading || (count && finished)" class="list-footer" aria-live="polite">
    <template v-if="loading"><wd-loading color="#4f46e5" size="18px" /><text>正在加载更多…</text></template>
    <template v-else><view class="list-footer__line" /><text>已加载全部 {{ count }} 条</text><view class="list-footer__line" /></template>
  </view>
</template>

<style scoped lang="scss">
.list-footer { min-height: 96rpx; padding: 18rpx 12rpx 8rpx; color: var(--smis-text-muted); display: flex; align-items: center; justify-content: center; gap: 14rpx; font-size: 18rpx; line-height: 1.4; }
.list-footer__line { width: 42rpx; height: 1rpx; background: var(--smis-line); }
</style>
