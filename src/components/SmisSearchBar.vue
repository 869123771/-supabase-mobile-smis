<script setup lang="ts">
import SmisIcon from './SmisIcon.vue'

withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  actionLabel?: string
  disabled?: boolean
  embedded?: boolean
}>(), { placeholder: '请输入关键词…', actionLabel: '', disabled: false, embedded: false })

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
}>()
</script>

<template>
  <view class="smis-search" :class="{ 'surface-card': !embedded, 'smis-search--embedded': embedded }">
    <view class="smis-search__icon"><SmisIcon name="search" size="29rpx" /></view>
    <view class="smis-search__field">
      <wd-input
        :model-value="modelValue"
        custom-class="smis-search__input"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        clearable
        no-border
        confirm-type="search"
        @update:model-value="emit('update:modelValue', String($event))"
        @confirm="emit('search')"
        @clear="emit('search')"
      />
    </view>
    <view v-if="actionLabel" class="smis-search__action-wrap">
      <wd-button
        custom-class="smis-search__action"
        type="primary"
        size="small"
        :round="false"
        :disabled="disabled"
        @click="emit('search')"
      >{{ actionLabel }}</wd-button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.smis-search { width: 100%; height: 88rpx; min-height: 88rpx; padding: 8rpx 9rpx 8rpx 18rpx; color: var(--smis-text-muted); display: flex; flex-wrap: nowrap; align-items: center; gap: 10rpx; overflow: hidden; }
.smis-search--embedded { border: 1rpx solid var(--smis-control-border); border-radius: 17rpx; background: var(--smis-control-bg); box-shadow: none; }
.smis-search__icon { width: 32rpx; height: 32rpx; flex: 0 0 32rpx; display: flex; align-items: center; justify-content: center; line-height: 1; }
.smis-search__field { min-width: 0; height: 66rpx; flex: 1 1 auto; overflow: hidden; display: flex; align-items: center; }
.smis-search__action-wrap { width: 90rpx; height: 64rpx; flex: 0 0 90rpx; display: flex; align-items: center; justify-content: center; }
.smis-search__field :deep(.wd-input),
:deep(.smis-search__input) { width: 100% !important; min-width: 0; height: 66rpx; min-height: 66rpx; padding: 0 !important; background: transparent !important; }
:deep(.smis-search__input .wd-input__value) { width: 100%; height: 66rpx; min-height: 66rpx; padding: 0 !important; display: flex; align-items: center; }
:deep(.smis-search__input .wd-input__inner) { width: 100%; height: 66rpx; color: var(--smis-text); font-size: 22rpx; line-height: 66rpx; }
:deep(.smis-search__input .wd-input__placeholder) { line-height: 66rpx; }
:deep(.smis-search__action) { width: 90rpx !important; min-width: 90rpx !important; height: 64rpx !important; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 14rpx !important; background: var(--smis-primary-gradient) !important; font-size: 21rpx !important; font-weight: 800 !important; line-height: 1 !important; display: flex !important; align-items: center !important; justify-content: center !important; }
</style>
