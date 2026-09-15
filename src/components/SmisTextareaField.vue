<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | null
  label?: string
  hint?: string
  placeholder?: string
  maxlength?: number
  prop?: string
  required?: boolean
  disabled?: boolean
  compact?: boolean
}>(), {
  label: '',
  hint: '',
  placeholder: '请输入…',
  maxlength: 500,
  prop: '',
  required: false,
  disabled: false,
  compact: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = computed({
  get: () => props.modelValue || '',
  set: (value: string | number) => emit('update:modelValue', String(value))
})
</script>

<template>
  <view class="smis-textarea-field" :class="{ 'smis-textarea-field--compact': compact }">
    <view v-if="label || hint" class="smis-textarea-field__head">
      <text v-if="label" class="smis-textarea-field__label">
        {{ label }}<text v-if="required" class="required-mark"> *</text>
      </text>
      <text v-if="hint" class="smis-textarea-field__hint">{{ hint }}</text>
    </view>
    <wd-textarea
      v-model="model"
      custom-class="smis-textarea-field__control"
      custom-textarea-class="smis-textarea-field__input"
      :prop="prop"
      clearable
      show-word-limit
      no-border
      :disabled="disabled"
      :maxlength="maxlength"
      :placeholder="placeholder"
    />
  </view>
</template>

<style scoped lang="scss">
.smis-textarea-field {
  box-sizing: border-box;
  padding: 18rpx;
  overflow: hidden;
  border: 1rpx solid var(--smis-control-border);
  border-radius: var(--smis-control-radius);
  background: var(--smis-control-bg);
  transition:
    border-color 160ms cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.smis-textarea-field:focus-within {
  border-color: rgba(79, 70, 229, 0.48);
  box-shadow: 0 0 0 5rpx rgba(79, 70, 229, 0.09);
}

.smis-textarea-field__head {
  min-width: 0;
  margin-bottom: 10rpx;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16rpx;
}

.smis-textarea-field__label {
  min-width: 0;
  color: var(--smis-text-secondary);
  font-size: 21rpx;
  font-weight: 750;
  line-height: 1.35;
}

.required-mark { color: var(--smis-danger); }

.smis-textarea-field__hint {
  flex: 0 1 auto;
  overflow: hidden;
  color: var(--smis-text-muted);
  font-size: 17rpx;
  line-height: 1.35;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.smis-textarea-field__control) {
  padding: 0 !important;
  background: transparent !important;
}

:deep(.smis-textarea-field__control .wd-textarea__value) {
  padding-bottom: 34rpx !important;
  background: transparent !important;
}

:deep(.smis-textarea-field__control .smis-textarea-field__input) {
  width: 100% !important;
  height: 112rpx !important;
  min-height: 112rpx !important;
  color: var(--smis-text) !important;
  font-size: 23rpx !important;
  line-height: 1.55 !important;
}

:deep(.smis-textarea-field__control .wd-textarea__count) {
  right: 0 !important;
  bottom: 0 !important;
  color: var(--smis-text-muted) !important;
  background: transparent !important;
  font-size: 17rpx !important;
  font-variant-numeric: tabular-nums;
}

:deep(.smis-textarea-field__control .wd-textarea__clear) {
  color: var(--smis-text-muted) !important;
  background: transparent !important;
}

.smis-textarea-field--compact :deep(.smis-textarea-field__control .smis-textarea-field__input) {
  height: 88rpx !important;
  min-height: 88rpx !important;
}
</style>
