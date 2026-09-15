<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import SmisEvidenceUpload from '@/components/SmisEvidenceUpload.vue'
import SmisIcon from '@/components/SmisIcon.vue'
import SmisStatusTag from '@/components/SmisStatusTag.vue'
import SmisTopBar from '@/components/SmisTopBar.vue'
import SmisTextareaField from '@/components/SmisTextareaField.vue'
import { useAuthStore } from '@/stores/auth'
import { getHazard, submitHazardAcceptance, submitHazardRectification } from '@/api/smis'
import { getErrorMessage } from '@/api/supabase'
import type { HazardDetail } from '@/api/types'
import { formatDate, hazardLevelBadge } from '@/utils/format'

const auth = useAuthStore()
const detail = ref<HazardDetail | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const action = reactive({ description: '', imageUrls: [] as string[] })
const actionTitle = computed(() => detail.value?.status === 'rectifying'
  ? '提交整改'
  : detail.value?.status === 'pending_acceptance' ? '验收处理' : '')

async function load(id: string) {
  if (!(await auth.ensureValidSession())) return
  loading.value = true
  try {
    detail.value = await getHazard(auth.token, id)
  } catch (error) {
    uni.showToast({ title: getErrorMessage(error), icon: 'none' })
  } finally {
    loading.value = false
  }
}

function preview(url: string) {
  if (detail.value) uni.previewImage({ urls: detail.value.imageUrls, current: url })
}

async function submit(result?: 'passed' | 'rejected') {
  if (!detail.value || saving.value || uploading.value) return
  if (!action.description.trim()) {
    uni.showToast({ title: '请填写处理说明', icon: 'none' })
    return
  }
  if (!action.imageUrls.length) {
    uni.showToast({ title: '请上传现场证据', icon: 'none' })
    return
  }

  saving.value = true
  try {
    if (detail.value.status === 'rectifying') {
      await submitHazardRectification(auth.token, detail.value.id, {
        completedAt: new Date().toISOString(),
        description: action.description.trim(),
        imageUrls: action.imageUrls
      })
    } else {
      await submitHazardAcceptance(auth.token, detail.value.id, {
        result: result || 'passed',
        description: action.description.trim(),
        imageUrls: action.imageUrls
      })
    }
    uni.showToast({ title: result === 'rejected' ? '已退回整改' : '处理已提交', icon: 'success' })
    action.description = ''
    action.imageUrls = []
    await load(detail.value.id)
  } catch (error) {
    uni.showToast({ title: getErrorMessage(error, '处理失败'), icon: 'none' })
  } finally {
    saving.value = false
  }
}

onLoad((query) => load(String(query?.id || '')))
</script>

<template>
  <view class="page-shell">
    <SmisTopBar :title="detail?.hazardNo || '隐患详情'" subtitle="隐患治理闭环" show-back />
    <view class="page-body detail-body">
      <view v-if="loading" class="loading" aria-live="polite"><wd-loading color="#4f46e5" /></view>

      <template v-else-if="detail">
        <view class="hazard-main surface-card">
          <view class="hazard-main__head">
            <view class="level">{{ hazardLevelBadge(detail.hazardLevel) }}</view>
            <view><SmisStatusTag :status="detail.status" /><text>{{ detail.inspectionTypeName || '现场隐患' }}</text></view>
          </view>
          <text class="hazard-main__desc">{{ detail.description }}</text>
          <view class="hazard-main__place"><SmisIcon name="location" size="30rpx" /><text>{{ detail.location }}</text></view>
          <scroll-view v-if="detail.imageUrls.length" class="photos" scroll-x>
            <image
              v-for="url in detail.imageUrls"
              :key="url"
              :src="url"
              mode="aspectFill"
              role="button"
              aria-label="预览隐患现场照片"
              @tap="preview(url)"
            />
          </scroll-view>
        </view>

        <view class="facts surface-card">
          <text class="title">隐患信息</text>
          <view><text>上报人</text><text class="strong">{{ detail.reporterEmployeeName }}</text></view>
          <view><text>上报时间</text><text class="strong">{{ formatDate(detail.reportedAt, true) }}</text></view>
          <view><text>整改责任人</text><text class="strong">{{ detail.rectificationResponsibleEmployeeName || '待核准指定' }}</text></view>
          <view><text>整改期限</text><text class="strong">{{ formatDate(detail.rectificationDeadline) }}</text></view>
          <view v-if="detail.rectificationSuggestion"><text>整改建议</text><text class="strong">{{ detail.rectificationSuggestion }}</text></view>
        </view>

        <view class="timeline">
          <text class="title">闭环轨迹</text>
          <view v-for="(event, index) in detail.events" :key="event.id" class="event">
            <view class="event__rail"><view class="i" :class="{ 'event__dot--current': index === 0 }" /><view v-if="index < detail.events.length - 1" class="span" /></view>
            <view class="event__copy">
              <view><text class="strong">{{ event.eventTitle }}</text><text class="small">{{ formatDate(event.eventAt, true) }}</text></view>
              <text>{{ event.eventContent || event.operatorEmployeeName || '节点已记录' }}</text>
            </view>
          </view>
        </view>

        <view v-if="actionTitle" class="action surface-card">
          <view class="action__head">
            <view class="action__icon"><SmisIcon :name="detail.status === 'rectifying' ? 'hazard' : 'check'" size="34rpx" /></view>
            <view><text class="title">{{ actionTitle }}</text><text>填写说明并上传现场证据</text></view>
          </view>
          <SmisTextareaField
            v-model="action.description"
            class="action__textarea"
            label="处理说明"
            hint="必填"
            required
            :maxlength="500"
            :placeholder="detail.status === 'rectifying' ? '说明整改措施与完成情况…' : '填写验收意见…'"
          />
          <SmisEvidenceUpload
            v-model="action.imageUrls"
            v-model:uploading="uploading"
            :token="auth.token"
            folder="smis/hazard-action"
            title="处理证据"
            description="至少 1 张，确保整改结果或验收现场清晰可见"
            required
            :max="6"
            :disabled="saving"
          />
          <wd-button
            v-if="detail.status === 'rectifying'"
            custom-class="smis-primary-action action__primary"
            type="primary"
            block
            :round="false"
            :loading="saving"
            :disabled="saving || uploading"
            @click="submit()"
          >提交整改，等待验收</wd-button>
          <view v-else class="accept-actions">
            <wd-button custom-class="smis-secondary-action" :round="false" :disabled="saving || uploading" @click="submit('rejected')">退回整改</wd-button>
            <wd-button custom-class="smis-primary-action" type="success" :round="false" :loading="saving" :disabled="saving || uploading" @click="submit('passed')">验收通过</wd-button>
          </view>
        </view>
      </template>

      <view v-else class="loading surface-card">隐患不存在或无权查看</view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.detail-body { padding-top: 26rpx; padding-bottom: 50rpx; }
.loading { min-height: 340rpx; display: flex; align-items: center; justify-content: center; color: var(--smis-text-muted); }
.hazard-main { padding: 26rpx; }
.hazard-main__head { display: flex; align-items: center; gap: 15rpx; }
.level { width: 64rpx; height: 64rpx; border-radius: 19rpx; background: #fff1df; color: var(--smis-warning); font-size: 28rpx; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.hazard-main__head > view:nth-child(2) { min-width: 0; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 7rpx; }
.hazard-main__head > view > text { color: var(--smis-text-muted); font-size: 20rpx; }
.hazard-main__desc { display: block; margin-top: 20rpx; font-size: 29rpx; font-weight: 800; line-height: 1.55; overflow-wrap: anywhere; }
.hazard-main__place { margin-top: 16rpx; padding: 15rpx; border-radius: 15rpx; background: var(--smis-control-bg); color: var(--smis-text-secondary); font-size: 22rpx; display: flex; align-items: flex-start; gap: 8rpx; }
.photos { width: 100%; margin-top: 18rpx; white-space: nowrap; }
.photos image { display: inline-block; width: 220rpx; height: 160rpx; margin-right: 12rpx; border-radius: 16rpx; box-shadow: inset 0 0 0 1rpx rgba(0, 0, 0, 0.1); }
.facts { margin-top: 17rpx; padding: 25rpx; }
.title { display: block; margin-bottom: 17rpx; font-size: 28rpx; font-weight: 800; }
.facts > view { min-height: 70rpx; display: grid; grid-template-columns: 150rpx minmax(0, 1fr); gap: 16rpx; align-items: center; }
.facts > view + view { border-top: 1rpx solid var(--smis-line); }
.facts > view text { color: var(--smis-text-muted); font-size: 20rpx; }
.facts .strong { color: var(--smis-text); font-size: 22rpx; line-height: 1.5; overflow-wrap: anywhere; }
.timeline { margin-top: 27rpx; padding: 0 6rpx; }
.event { display: flex; gap: 16rpx; }
.event__rail { width: 24rpx; display: flex; flex-direction: column; align-items: center; }
.event__rail .i { width: 18rpx; height: 18rpx; border: 4rpx solid #9eb1bf; border-radius: 50%; background: var(--smis-bg); }
.event__rail .event__dot--current { border-color: var(--smis-safety); }
.event__rail .span { width: 2rpx; min-height: 76rpx; flex: 1; background: #d8e1e7; }
.event__copy { min-width: 0; flex: 1; padding-bottom: 28rpx; }
.event__copy > view { display: flex; justify-content: space-between; gap: 12rpx; }
.event__copy .strong { font-size: 23rpx; }
.event__copy .small { color: var(--smis-text-muted); font-size: 18rpx; }
.event__copy > text { display: block; margin-top: 7rpx; color: var(--smis-text-secondary); font-size: 20rpx; line-height: 1.45; }
.action { margin-top: 20rpx; padding: 25rpx; overflow: visible; }
.action__head { margin-bottom: 18rpx; display: flex; align-items: center; gap: 14rpx; }
.action__head .title { margin: 0; }
.action__head > view:last-child { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.action__head > view:last-child > text:last-child { margin-top: 4rpx; color: var(--smis-text-muted); font-size: 19rpx; }
.action__icon { width: 58rpx; height: 58rpx; border-radius: 18rpx; background: var(--smis-primary-soft); color: var(--smis-primary); display: flex; align-items: center; justify-content: center; }
.action__textarea { margin-bottom: 22rpx; }
:deep(.action__primary) { width: 100% !important; margin-top: 22rpx !important; }
.accept-actions { margin-top: 22rpx; display: grid; grid-template-columns: 1fr 1.45fr; gap: 12rpx; }
.accept-actions :deep(.wd-button) { width: 100% !important; margin: 0 !important; }
</style>
