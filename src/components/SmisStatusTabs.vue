<script setup lang="ts">
export interface StatusTab {
  label: string
  value: string
}

withDefaults(defineProps<{ modelValue: string; tabs: StatusTab[]; embedded?: boolean }>(), { embedded: false })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <view class="status-tabs" :class="{ 'surface-card': !embedded, 'status-tabs--embedded': embedded }">
    <wd-tabs
      :model-value="modelValue"
      custom-class="status-tabs__control"
      color="#4f46e5"
      inactive-color="#66738a"
      :line-height="3"
      :line-width="22"
      slidable="always"
      :show-scrollbar="false"
      @update:model-value="emit('update:modelValue', String($event))"
    >
      <wd-tab v-for="tab in tabs" :key="tab.value" :name="tab.value" :title="tab.label" />
    </wd-tabs>
  </view>
</template>

<style scoped lang="scss">
.status-tabs { padding: 0 8rpx; overflow: hidden; }
.status-tabs--embedded { border-top: 1rpx solid var(--smis-line-soft); border-radius: 0; box-shadow: none; }
:deep(.wd-tabs__nav) { background: transparent; }
:deep(.wd-tabs__nav-item) { min-width: 112rpx; min-height: 72rpx; padding: 0 18rpx; font-size: 20rpx; font-weight: 650; white-space: nowrap; display: flex; align-items: center; justify-content: center; }
:deep(.wd-tabs__line) { border-radius: 999rpx; }
:deep(.wd-tabs__container) { display: none; }
</style>
