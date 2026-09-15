<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { getErrorMessage } from '@/api/supabase'

const auth = useAuthStore()
const profile = useProfileStore()
const account = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)
const accountValue = computed(() => account.value.trim())
const canSubmit = computed(() => Boolean(accountValue.value && password.value && !loading.value))

onLoad(() => {
  auth.hydrate()
  const cachedAccount = uni.getStorageSync('smis-mobile-account')
  if (cachedAccount) account.value = String(cachedAccount)
  if (auth.isLoggedIn) uni.reLaunch({ url: '/pages/home/index' })
})

async function submit() {
  if (loading.value) return
  if (!accountValue.value) {
    uni.showToast({ title: '请输入手机号或邮箱', icon: 'none' })
    return
  }
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    await auth.login(accountValue.value, password.value)
    if (remember.value) uni.setStorageSync('smis-mobile-account', accountValue.value)
    else uni.removeStorageSync('smis-mobile-account')
    await profile.load(auth.token, true)
    uni.reLaunch({ url: '/pages/home/index' })
  } catch (error) {
    uni.showToast({ title: getErrorMessage(error, '登录失败，请稍后重试'), icon: 'none', duration: 2500 })
  } finally {
    loading.value = false
  }
}

function forgotPassword() {
  uni.showToast({ title: '请联系系统管理员重置密码', icon: 'none' })
}
</script>

<template>
  <view class="login-page">
    <view class="login-page__orb login-page__orb--one" />
    <view class="login-page__orb login-page__orb--two" />
    <view class="login-page__grid" />

    <view class="login-page__hero">
      <view class="login-page__brand">
        <view class="login-page__mark">
          <view class="login-page__mark-main" />
          <view class="login-page__mark-dots">
            <text />
            <text />
            <text />
          </view>
        </view>
        <text class="login-page__name">SMIS</text>
        <text class="login-page__badge">移动端</text>
      </view>
      <text class="login-page__eyebrow">智慧安全协同</text>
      <text class="login-page__title">每一处风险，都清晰可控</text>
      <text class="login-page__description">设备、排班、风险与隐患集中处理，让现场安全闭环更简单。</text>
      <view class="login-page__trust">
        <view><text class="login-page__trust-dot" />任务实时同步</view>
        <view><text class="login-page__trust-dot" />数据安全连接</view>
      </view>
    </view>

    <view class="login-form">
      <view class="login-form__head">
        <view>
          <text class="login-form__title">账号登录</text>
          <text class="login-form__hint">使用 Web 端同一账号</text>
        </view>
        <text class="login-form__secure">安全登录</text>
      </view>
      <wd-input
        v-model="account"
        class="login-form__field"
        aria-label="手机号或邮箱"
        prefix-icon="phone"
        placeholder="请输入手机号/邮箱"
        type="text"
        confirm-type="next"
        clearable
        no-border
        :disabled="loading"
      />
      <wd-input
        v-model="password"
        class="login-form__field"
        aria-label="登录密码"
        prefix-icon="lock-on"
        placeholder="请输入登录密码"
        show-password
        confirm-type="done"
        no-border
        :disabled="loading"
        @confirm="submit"
      />

      <view class="login-form__options">
        <wd-checkbox
          v-model="remember"
          class="login-form__remember"
          shape="square"
          checked-color="#4f46e5"
          :disabled="loading"
        >
          记住我
        </wd-checkbox>
        <button class="login-form__link" hover-class="login-form__link--pressed" @tap="forgotPassword">
          忘记密码？
        </button>
      </view>

      <wd-button
        class="login-form__button"
        custom-class="smis-primary-action"
        type="primary"
        size="large"
        block
        :round="false"
        :loading="loading"
        :disabled="!canSubmit"
        @click="submit"
      >
        登录
      </wd-button>
    </view>

    <view class="login-page__agreement">
      登录即表示您已阅读并同意
      <text>《用户协议》</text>
      和
      <text>《隐私政策》</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(70rpx + env(safe-area-inset-top)) 34rpx calc(32rpx + env(safe-area-inset-bottom));
  overflow-x: hidden;
  background:
    radial-gradient(circle at 92% 2%, rgba(79, 70, 229, 0.12), transparent 360rpx),
    linear-gradient(180deg, #f7f8ff 0%, #ffffff 54%, #f8fafc 100%);
  display: flex;
  flex-direction: column;
}

.login-page__orb {
  position: absolute;
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
}

.login-page__orb--one {
  top: -220rpx;
  right: -220rpx;
  width: 540rpx;
  height: 540rpx;
  border: 1rpx solid rgba(79, 70, 229, 0.12);
  box-shadow:
    0 0 0 74rpx rgba(79, 70, 229, 0.025),
    0 0 0 148rpx rgba(79, 70, 229, 0.018);
}

.login-page__orb--two {
  left: -120rpx;
  bottom: 120rpx;
  width: 260rpx;
  height: 260rpx;
  background: rgba(56, 189, 248, 0.05);
  filter: blur(8rpx);
}

.login-page__grid {
  position: absolute;
  inset: 0 0 auto;
  height: 620rpx;
  opacity: 0.22;
  background-image:
    linear-gradient(rgba(79, 70, 229, 0.08) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(79, 70, 229, 0.08) 1rpx, transparent 1rpx);
  background-size: 82rpx 82rpx;
  mask-image: linear-gradient(to bottom, #000, transparent);
  pointer-events: none;
}

.login-page__hero,
.login-form,
.login-page__agreement {
  position: relative;
  z-index: 1;
}

.login-page__hero {
  padding: 0 14rpx;
}

.login-page__brand {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.login-page__mark {
  position: relative;
  width: 72rpx;
  height: 72rpx;
}

.login-page__mark-main {
  position: absolute;
  left: 5rpx;
  top: 14rpx;
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  border-radius: 14rpx;
  box-shadow: 0 12rpx 22rpx rgba(79, 70, 229, 0.22);
  transform: rotate(45deg);
}

.login-page__mark-dots {
  position: absolute;
  right: 0;
  top: 20rpx;
  width: 38rpx;
  height: 42rpx;
}

.login-page__mark-dots text {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #f59e0b;
}

.login-page__mark-dots text:nth-child(1) { left: 0; top: 14rpx; }
.login-page__mark-dots text:nth-child(2) { left: 16rpx; top: 0; }
.login-page__mark-dots text:nth-child(3) { right: 0; bottom: 0; }

.login-page__name {
  color: #172033;
  font-size: 50rpx;
  font-style: italic;
  font-weight: 900;
}

.login-page__badge {
  height: 42rpx;
  padding: 0 14rpx;
  border-radius: 10rpx;
  background: #4f46e5;
  color: #fff;
  font-size: 23rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.login-page__eyebrow {
  display: block;
  margin-top: 64rpx;
  color: #4f46e5;
  font-size: 19rpx;
  font-weight: 800;
}

.login-page__title {
  display: block;
  margin-top: 18rpx;
  color: #172033;
  font-size: 46rpx;
  font-weight: 900;
  line-height: 1.18;
  letter-spacing: -1rpx;
  text-wrap: balance;
}

.login-page__description {
  display: block;
  max-width: 590rpx;
  margin-top: 18rpx;
  color: #748096;
  font-size: 25rpx;
  font-weight: 500;
  line-height: 1.65;
}

.login-page__trust {
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  gap: 28rpx;
  color: #4b5870;
  font-size: 21rpx;
  font-weight: 600;
}

.login-page__trust view { display: flex; align-items: center; gap: 10rpx; }
.login-page__trust-dot {
  width: 9rpx;
  height: 9rpx;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 5rpx rgba(16, 185, 129, 0.1);
}

.login-form {
  margin-top: 62rpx;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.94);
  border: 1rpx solid #e7ebf2;
  border-radius: 28rpx;
  box-shadow: 0 24rpx 64rpx rgba(34, 39, 91, 0.14);
  backdrop-filter: blur(24rpx);
}

.login-form__head {
  margin-bottom: 28rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.login-form__title,
.login-form__hint { display: block; }
.login-form__title { color: #172033; font-size: 30rpx; font-weight: 800; }
.login-form__hint { margin-top: 8rpx; color: #748096; font-size: 21rpx; }
.login-form__secure {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  color: #059669;
  background: #ecfdf5;
  font-size: 20rpx;
  font-weight: 700;
}

.login-form__field {
  box-sizing: border-box;
  height: 98rpx;
  padding: 0 28rpx;
  border: 1rpx solid #e8ecf3;
  border-radius: 16rpx;
  background: linear-gradient(145deg, #f8fafc, #f5f7fb);
  color: #9aa5b7;
}

.login-form__field + .login-form__field { margin-top: 20rpx; }
.login-form__field :deep(.wd-input__value) { height: 98rpx; }
.login-form__field :deep(.wd-input__prefix) { margin-right: 24rpx; }
.login-form__field :deep(.wd-input__icon),
.login-form__field :deep(.wd-input__clear) { color: #9aa5b7; font-size: 38rpx; }
.login-form__field :deep(.wd-input__inner) { height: 98rpx; color: #172033; font-size: 28rpx; background: transparent; }
.login-form__field :deep(.wd-input__inner::placeholder) { color: #9aa5b7; }
.login-form__field.is-disabled { opacity: 0.72; }

.login-form__options {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #172033;
  font-size: 26rpx;
}

.login-form__remember { margin-bottom: 0; font-size: 24rpx; }
.login-form__remember :deep(.wd-checkbox__shape) { width: 32rpx; height: 32rpx; border-width: 2rpx; border-radius: 10rpx; }
.login-form__remember :deep(.wd-checkbox__label) { color: #172033; font-size: 23rpx; }
.login-form__link {
  min-height: 56rpx;
  margin: -12rpx 0;
  padding: 0 4rpx 0 18rpx;
  border: 0;
  color: #4f46e5;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 23rpx;
  font-weight: 700;
  line-height: 1;
}
.login-form__link--pressed { color: #3730a3; background: rgba(79, 70, 229, 0.06); }
.login-form__button { margin-top: 34rpx; }
.login-form__button.is-disabled { background: #c5cfeb; box-shadow: none; }

.login-page__agreement {
  margin-top: auto;
  padding-top: 30rpx;
  color: #9aa5b7;
  font-size: 20rpx;
  line-height: 1.6;
  text-align: center;
}

.login-page__agreement text { color: #4f46e5; }

@media screen and (max-height: 700px) {
  .login-page { padding-top: calc(38rpx + env(safe-area-inset-top)); }
  .login-page__eyebrow { margin-top: 34rpx; }
  .login-form { margin-top: 38rpx; }
}

@media screen and (min-width: 768px) {
  .login-page {
    max-width: 520px;
    margin: 0 auto;
    box-shadow: 0 0 80rpx rgba(34, 45, 74, 0.1);
  }
}
</style>
