<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UploadChangeEvent, UploadErrorEvent, UploadFileItem, UploadMethod } from 'wot-design-uni/components/wd-upload/types'
import SmisIcon from './SmisIcon.vue'
import { getErrorMessage, uploadFile } from '@/api/supabase'

const props = withDefaults(defineProps<{
  modelValue: string[]
  token: string
  folder: string
  title?: string
  description?: string
  max?: number
  required?: boolean
  disabled?: boolean
}>(), {
  title: '现场照片',
  description: '请拍摄清晰完整的现场环境与问题细节',
  max: 6,
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'update:uploading': [value: boolean]
}>()

const fileList = ref<UploadFileItem[]>([])
const activeUploads = ref(0)
let nextUid = 1

function remoteFiles(urls: string[]): UploadFileItem[] {
  return urls.map((url) => ({ uid: nextUid++, url, status: 'success', percent: 100 }))
}

function successfulUrls(items = fileList.value) {
  return items.filter((item) => item.status === 'success').map((item) => item.url)
}

function sameValues(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

watch(() => props.modelValue, (urls) => {
  if (!activeUploads.value && !sameValues(successfulUrls(), urls)) fileList.value = remoteFiles(urls)
}, { immediate: true })

function setUploading(delta: number) {
  activeUploads.value = Math.max(0, activeUploads.value + delta)
  emit('update:uploading', activeUploads.value > 0)
}

const customUpload: UploadMethod = async (file, formData, options) => {
  setUploading(1)
  try {
    const remoteUrl = await uploadFile(file.url, props.token, props.folder)
    file.url = remoteUrl
    options.onProgress({ progress: 100, totalBytesSent: 1, totalBytesExpectedToSend: 1 }, file)
    options.onSuccess({ data: JSON.stringify({ url: remoteUrl }), statusCode: 200, header: {}, errMsg: 'uploadFile:ok' }, file, formData)
  } catch (error) {
    options.onError({ errMsg: getErrorMessage(error, '图片上传失败') }, file, formData)
  } finally {
    setUploading(-1)
  }
}

function updateFiles(items: UploadFileItem[]) {
  fileList.value = items
}

function sync(event: UploadChangeEvent) {
  emit('update:modelValue', successfulUrls(event.fileList))
}

function fail(event: UploadErrorEvent) {
  uni.showToast({ title: getErrorMessage(event.error, '图片上传失败，请重试'), icon: 'none', duration: 2500 })
}
</script>

<template>
  <view class="evidence-upload">
    <view class="evidence-upload__head">
      <view>
        <text class="evidence-upload__title">{{ title }}<text v-if="required" class="required-mark"> *</text></text>
        <text class="evidence-upload__description">{{ description }}</text>
      </view>
      <text class="evidence-upload__quota">{{ modelValue.length }} / {{ max }}</text>
    </view>

    <wd-upload
      :file-list="fileList"
      action="custom"
      accept="image"
      multiple
      :limit="max"
      :disabled="disabled"
      :auto-upload="true"
      :show-limit-num="false"
      :source-type="['camera', 'album']"
      :size-type="['compressed']"
      image-mode="aspectFill"
      custom-class="evidence-upload__control"
      custom-preview-class="evidence-upload__preview"
      custom-evoke-class="evidence-upload__evoke"
      :upload-method="customUpload"
      @update:file-list="updateFiles"
      @change="sync"
      @fail="fail"
    >
      <view class="evidence-upload__add">
        <SmisIcon name="camera" size="40rpx" />
        <text>{{ activeUploads ? '上传中…' : '拍照 / 相册' }}</text>
        <text class="small">最多 {{ max }} 张</text>
      </view>
    </wd-upload>
  </view>
</template>

<style scoped lang="scss">
.evidence-upload__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.evidence-upload__head > view { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.evidence-upload__title { color: var(--smis-text); font-size: 23rpx; font-weight: 800; }
.required-mark { color: var(--smis-danger); }
.evidence-upload__description { margin-top: 6rpx; color: var(--smis-text-muted); font-size: 19rpx; line-height: 1.45; }
.evidence-upload__quota { flex: 0 0 auto; color: var(--smis-text-muted); font-size: 19rpx; font-variant-numeric: tabular-nums; }
:deep(.evidence-upload__control) { margin-top: 16rpx; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12rpx; }
:deep(.evidence-upload__preview), :deep(.evidence-upload__evoke) { width: 100% !important; height: 156rpx !important; margin: 0 !important; border-radius: 17rpx !important; }
:deep(.evidence-upload__preview) { overflow: hidden; background: var(--smis-control-bg); box-shadow: inset 0 0 0 1rpx rgba(0, 0, 0, 0.08); }
:deep(.wd-upload__picture) { width: 100% !important; height: 100% !important; }
:deep(.wd-upload__close) { top: 8rpx !important; right: 8rpx !important; font-size: 36rpx !important; color: #fff !important; filter: drop-shadow(0 2rpx 5rpx rgba(0, 0, 0, 0.32)); }
:deep(.evidence-upload__evoke) { overflow: hidden; border: 2rpx dashed rgba(79, 70, 229, 0.24); background: var(--smis-primary-soft); }
.evidence-upload__add { width: 100%; height: 100%; color: var(--smis-primary); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx; }
.evidence-upload__add text { font-size: 19rpx; font-weight: 800; }
.evidence-upload__add .small { color: var(--smis-text-muted); font-size: 17rpx; font-weight: 500; }
</style>
