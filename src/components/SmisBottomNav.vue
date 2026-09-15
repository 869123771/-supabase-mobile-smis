<script setup lang="ts">
import SmisIcon from './SmisIcon.vue'

type NavKey = 'home' | 'messages' | 'quick' | 'workbench' | 'mine'
const props = defineProps<{ active: NavKey }>()
const items = [
  { key: 'home', label: '首页', icon: 'home', url: '/pages/home/index' },
  { key: 'messages', label: '消息', icon: 'message', url: '/pages/messages/index' },
  { key: 'quick', label: '随手拍', icon: 'camera', url: '/pages/quick-report/index' },
  { key: 'workbench', label: '工作台', icon: 'work', url: '/pages/workbench/index' },
  { key: 'mine', label: '我的', icon: 'user', url: '/pages/mine/index' }
] as const

function go(item: (typeof items)[number]) {
  if (item.key === props.active) return
  uni.reLaunch({ url: item.url })
}
</script>

<template>
  <view class="nav bottom-nav">
    <button
      v-for="item in items"
      :key="item.key"
      class="nav__item"
      :class="{ 'nav__item--active': item.key === active }"
      :aria-label="item.label"
      :aria-current="item.key === active ? 'page' : undefined"
      hover-class="nav__item--pressed"
      @tap="go(item)"
    >
      <view v-if="item.key === active" class="nav__active-pill" />
      <view class="nav__icon-box"><SmisIcon :name="item.icon" size="40rpx" /></view>
      <text>{{ item.label }}</text>
    </button>
  </view>
</template>

<style scoped lang="scss">
.nav {
  position: fixed;
  left: 18rpx;
  right: 18rpx;
  bottom: calc(16rpx + env(safe-area-inset-bottom));
  z-index: 30;
  height: 116rpx;
  padding: 8rpx 12rpx;
  overflow: visible;
  background: rgba(255, 255, 255, 0.94);
  border: 1rpx solid rgba(224, 230, 240, 0.9);
  border-radius: 32rpx;
  backdrop-filter: blur(28rpx) saturate(150%);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  box-shadow: 0 20rpx 54rpx rgba(29, 39, 66, 0.15), 0 2rpx 0 rgba(255, 255, 255, 0.95) inset;
}

.nav__item {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 22rpx;
  background: transparent;
  color: #929daf;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1;
}

.nav__item--pressed { background: rgba(79, 70, 229, 0.06); }
.nav__item--active { color: #4f46e5; font-weight: 800; }
.nav__active-pill { position: absolute; top: 3rpx; width: 68rpx; height: 60rpx; border-radius: 20rpx; background: linear-gradient(180deg, #eef2ff, #e8edff); }
.nav__icon-box { position: relative; z-index: 1; width: 58rpx; height: 56rpx; border-radius: 18rpx; color: currentColor; display: flex; align-items: center; justify-content: center; }
.nav__item text { position: relative; z-index: 1; line-height: 1; }

.nav__item:nth-child(3) .nav__active-pill { display: none; }
.nav__item:nth-child(3) .nav__icon-box {
  width: 68rpx;
  height: 68rpx;
  margin-top: -24rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.96);
  border-radius: 24rpx;
  color: #fff;
  background: var(--smis-primary-gradient);
  box-shadow: var(--smis-shadow-primary);
}
.nav__item:nth-child(3) text { margin-top: -2rpx; }

@media screen and (min-width: 768px) {
  .nav {
    left: 50%;
    right: auto;
    width: min(calc(100vw - 36rpx), 484px);
    transform: translateX(-50%);
  }
}
</style>
