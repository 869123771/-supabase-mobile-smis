<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useDictionaryStore } from '@/stores/dictionary'

let startupPromise: Promise<void> | null = null

function loadStartupData() {
  if (startupPromise) return startupPromise

  startupPromise = (async () => {
    const auth = useAuthStore()
    auth.hydrate()
    if (!auth.isLoggedIn) {
      uni.reLaunch({ url: '/pages/login/index' })
      return
    }

    const isValid = await auth.ensureValidSession()
    if (isValid) await useDictionaryStore().load(auth.token)
  })()
    .catch((error) => {
      console.warn('startup data loading failed', error)
    })
    .finally(() => {
      startupPromise = null
    })

  return startupPromise
}

onLaunch(() => {
  void loadStartupData()
})

onShow(() => {
  void loadStartupData()
})
</script>

<style lang="scss">
@use '@/styles/theme.scss';
@use '@/styles/page-polish.scss';

page {
  min-height: 100%;
  background: var(--smis-bg);
  color: var(--smis-text);
  font-family:
    'HarmonyOS Sans', 'HarmonyOS Sans SC', 'PingFang SC', MiSans, 'Noto Sans SC', -apple-system, BlinkMacSystemFont,
    'Segoe UI', 'Microsoft YaHei', sans-serif;
  font-weight: 400;
  font-synthesis: none;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

page::before {
  position: fixed;
  inset: 0;
  z-index: -1;
  content: '';
  pointer-events: none;
  background:
    radial-gradient(circle at 6% 0, rgba(79, 70, 229, 0.055), transparent 440rpx),
    radial-gradient(circle at 96% 36%, rgba(37, 99, 235, 0.035), transparent 420rpx);
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

button::after {
  border: 0;
}

button,
[role='button'] {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

button {
  font-family: inherit;
  line-height: 1.2;
  vertical-align: middle;
}

.wd-button__content,
.wd-button__text {
  min-width: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wd-button__text {
  gap: 8rpx;
}

button:focus-visible,
[role='button']:focus-visible {
  outline: 4rpx solid rgba(79, 70, 229, 0.32);
  outline-offset: 4rpx;
}

input,
textarea {
  caret-color: var(--smis-primary);
}
</style>
