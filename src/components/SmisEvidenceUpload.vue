<script setup lang="ts">
import { ref, watch } from 'vue'
import SmisIcon from './SmisIcon.vue'
import { getErrorMessage, uploadFile } from '@/api/supabase'
import { chooseImages } from '@/utils/file'

type EvidenceStatus = 'ready' | 'uploading' | 'failed'

interface EvidenceItem {
  id: string
  url: string
  localPath?: string
  remoteUrl?: string
  status: EvidenceStatus
  error?: string
}

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

const items = ref<EvidenceItem[]>([])
const choosing = ref(false)
const activeUploads = ref(0)
let nextId = 1

function createRemoteItems(urls: string[]): EvidenceItem[] {
  return urls.map((url) => ({ id: `remote-${nextId++}`, url, remoteUrl: url, status: 'ready' }))
}

function successfulUrls() {
  return items.value.flatMap((item) => item.status === 'ready' && item.remoteUrl ? [item.remoteUrl] : [])
}

function sameValues(left: string[], right: string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function updateBusyState() {
  emit('update:uploading', choosing.value || activeUploads.value > 0)
}

function syncValue() {
  emit('update:modelValue', successfulUrls())
}

watch(() => props.modelValue, (urls) => {
  if (choosing.value || activeUploads.value) return
  if (!sameValues(successfulUrls(), urls)) items.value = createRemoteItems(urls)
}, { immediate: true })

async function uploadItem(item: EvidenceItem) {
  if (!item.localPath) return false
  item.status = 'uploading'
  item.error = ''
  activeUploads.value += 1
  updateBusyState()
  try {
    const remoteUrl = await uploadFile(item.localPath, props.token, props.folder)
    item.url = remoteUrl
    item.remoteUrl = remoteUrl
    item.status = 'ready'
    syncValue()
    return true
  } catch (error) {
    item.status = 'failed'
    item.error = getErrorMessage(error, '照片上传失败，请重试')
    return false
  } finally {
    activeUploads.value = Math.max(0, activeUploads.value - 1)
    updateBusyState()
  }
}

async function addPhotos() {
  if (props.disabled || choosing.value || activeUploads.value || items.value.length >= props.max) return
  choosing.value = true
  updateBusyState()
  try {
    const paths = await chooseImages(props.max - items.value.length)
    if (!paths.length) return
    const additions: EvidenceItem[] = paths.map((path) => ({
      id: `local-${nextId++}`,
      url: path,
      localPath: path,
      status: 'uploading'
    }))
    items.value = [...items.value, ...additions]
    const results = await Promise.all(additions.map(uploadItem))
    if (results.some((success) => !success)) {
      uni.showToast({ title: '部分照片上传失败，请点击重试', icon: 'none', duration: 2500 })
    }
  } catch (error) {
    uni.showToast({ title: getErrorMessage(error, '无法选择照片，请重试'), icon: 'none', duration: 2500 })
  } finally {
    choosing.value = false
    updateBusyState()
  }
}

async function retry(item: EvidenceItem) {
  if (props.disabled || item.status !== 'failed') return
  const success = await uploadItem(item)
  if (!success) uni.showToast({ title: item.error || '照片上传失败，请重试', icon: 'none', duration: 2500 })
}

function remove(item: EvidenceItem) {
  if (props.disabled || item.status === 'uploading') return
  items.value = items.value.filter((candidate) => candidate.id !== item.id)
  syncValue()
}

function preview(item: EvidenceItem) {
  const urls = items.value.filter((candidate) => candidate.status !== 'failed').map((candidate) => candidate.url)
  if (urls.length) uni.previewImage({ urls, current: item.url })
}
</script>

<template>
  <view class="evidence-upload">
    <view class="evidence-upload__head">
      <view>
        <text class="evidence-upload__title">{{ title }}<text v-if="required" class="required-mark"> *</text></text>
        <text class="evidence-upload__description">{{ description }}</text>
      </view>
      <text class="evidence-upload__quota">{{ successfulUrls().length }} / {{ max }}</text>
    </view>

    <view class="evidence-upload__grid">
      <view v-for="item in items" :key="item.id" class="evidence-upload__preview">
        <button class="evidence-upload__preview-action" aria-label="预览现场照片" @tap="preview(item)">
          <image :src="item.url" mode="aspectFill" lazy-load />
        </button>

        <view v-if="item.status === 'uploading'" class="evidence-upload__mask" aria-live="polite">
          <wd-loading color="#ffffff" size="34rpx" />
          <text>上传中…</text>
        </view>
        <button
          v-else-if="item.status === 'failed'"
          class="evidence-upload__mask evidence-upload__retry"
          aria-label="重新上传这张照片"
          @tap="retry(item)"
        >
          <SmisIcon name="refresh" size="34rpx" />
          <text>上传失败</text>
          <text class="small">点击重试</text>
        </button>

        <button
          v-if="!disabled && item.status !== 'uploading'"
          class="evidence-upload__remove"
          aria-label="移除这张照片"
          @tap="remove(item)"
        >
          <SmisIcon name="close" size="25rpx" />
        </button>
      </view>

      <button
        v-if="items.length < max"
        class="evidence-upload__add"
        :disabled="disabled || choosing || activeUploads > 0"
        @tap="addPhotos"
      >
        <wd-loading
          v-if="choosing || activeUploads > 0"
          type="ring"
          color="#4f46e5"
          size="30rpx"
        />
        <view v-else class="evidence-upload__add-content">
          <wd-icon name="camera" size="42rpx" />
          <text>拍照上传</text>
        </view>
      </button>
    </view>
    <text class="evidence-upload__hint">已上传 {{ successfulUrls().length }}/{{ max }} 张，可从相册选择或直接拍摄</text>
  </view>
</template>

<style scoped lang="scss">
.evidence-upload__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18rpx; }
.evidence-upload__head > view { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.evidence-upload__title { color: var(--smis-text); font-size: 23rpx; font-weight: 800; }
.required-mark { color: var(--smis-danger); }
.evidence-upload__description { margin-top: 6rpx; color: var(--smis-text-muted); font-size: 19rpx; line-height: 1.45; }
.evidence-upload__quota { flex: 0 0 auto; color: var(--smis-text-muted); font-size: 19rpx; font-variant-numeric: tabular-nums; }
.evidence-upload__grid { margin-top: 16rpx; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12rpx; }
.evidence-upload__preview,
.evidence-upload__add { box-sizing: border-box; position: relative; width: 100%; min-width: 0; aspect-ratio: 1; margin: 0; padding: 0; overflow: hidden; border-radius: 17rpx; }
.evidence-upload__preview { background: var(--smis-control-bg); box-shadow: inset 0 0 0 1rpx rgba(0, 0, 0, .08); }
.evidence-upload__preview-action { width: 100%; height: 100%; margin: 0; padding: 0; border: 0; border-radius: inherit; background: transparent; }
.evidence-upload__preview-action image { display: block; width: 100%; height: 100%; }
.evidence-upload__mask { position: absolute; inset: 0; z-index: 2; margin: 0; padding: 12rpx; border: 0; border-radius: inherit; color: #fff; background: rgba(18, 25, 43, .66); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6rpx; font-size: 18rpx; line-height: 1.2; backdrop-filter: blur(5rpx); }
.evidence-upload__retry { width: 100%; height: 100%; }
.evidence-upload__retry .small { color: rgba(255, 255, 255, .72); font-size: 16rpx; }
.evidence-upload__remove { position: absolute; top: 6rpx; right: 6rpx; z-index: 3; width: 56rpx; height: 56rpx; margin: 0; padding: 0; border: 0; border-radius: 50%; color: #fff; background: rgba(18, 25, 43, .72); display: flex; align-items: center; justify-content: center; box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .18); }
.evidence-upload__add { border: 2rpx dashed rgba(79, 70, 229, .28); color: var(--smis-primary); background: #f4f5ff; display: flex; align-items: center; justify-content: center; font-size: 19rpx; font-weight: 800; line-height: 1; }
.evidence-upload__add-content { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10rpx; line-height: 1; }
.evidence-upload__add-content :deep(.wd-icon) { display: flex; line-height: 1; }
.evidence-upload__add-content text { display: block; line-height: 1.2; }
.evidence-upload__hint { display: block; margin-top: 12rpx; color: var(--smis-text-muted); font-size: 18rpx; line-height: 1.45; }
.evidence-upload__add:active { transform: scale(.98); }
.evidence-upload__add[disabled] { opacity: .62; }
.evidence-upload button::after { display: none; }

@media (prefers-reduced-motion: reduce) {
  .evidence-upload__add:active { transform: none; }
}
</style>
