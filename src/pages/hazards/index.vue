<script setup lang="ts">
import { computed, ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import SmisTopBar from '@/components/SmisTopBar.vue'
import SmisStatusTag from '@/components/SmisStatusTag.vue'
import SmisEmpty from '@/components/SmisEmpty.vue'
import SmisIcon from '@/components/SmisIcon.vue'
import SmisSearchBar from '@/components/SmisSearchBar.vue'
import SmisStatusTabs from '@/components/SmisStatusTabs.vue'
import SmisListFooter from '@/components/SmisListFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { listHazards } from '@/api/smis'
import type { HazardOverview, HazardRecord, HazardStatus } from '@/api/types'
import { formatDate, hazardLevelBadge } from '@/utils/format'
import { getErrorMessage } from '@/api/supabase'

const PAGE_SIZE = 15
const auth = useAuthStore()
const loading = ref(false)
const loadingMore = ref(false)
const keyword = ref('')
const status = ref<HazardStatus | ''>('')
const rows = ref<HazardRecord[]>([])
const total = ref(0)
const overview = ref<HazardOverview>({ total: 0, pendingApproval: 0, rectifying: 0, pendingAcceptance: 0, completed: 0, closed: 0 })
const tabs: Array<{ value: HazardStatus | ''; label: string }> = [
  { value: '', label: '全部' },
  { value: 'pending_approval', label: '待核准' },
  { value: 'rectifying', label: '整改中' },
  { value: 'pending_acceptance', label: '待验收' },
  { value: 'completed', label: '已完成' }
]
const finished = computed(() => rows.value.length >= total.value)

async function load(reset = true) {
  if (loading.value || loadingMore.value || !(await auth.ensureValidSession())) return
  reset ? (loading.value = true) : (loadingMore.value = true)
  const from = reset ? 0 : rows.value.length
  try {
    const data = await listHazards(auth.token, {
      status: status.value,
      keyword: keyword.value,
      from,
      to: from + PAGE_SIZE - 1
    })
    rows.value = reset ? data.records : [...rows.value, ...data.records]
    total.value = data.total
    overview.value = data.overview
  } catch (error) {
    uni.showToast({ title: getErrorMessage(error), icon: 'none' })
  } finally {
    loading.value = false
    loadingMore.value = false
    uni.stopPullDownRefresh()
  }
}

function select(value: string) {
  status.value = value as HazardStatus | ''
  void load(true)
}
function openDetail(id: string) { uni.navigateTo({ url: `/pages/hazards/detail?id=${id}` }) }

onShow(() => load(true))
onPullDownRefresh(() => load(true))
onReachBottom(() => { if (!finished.value) void load(false) })
</script>

<template>
  <view class="page-shell">
    <SmisTopBar title="隐患治理" eyebrow="HAZARD CLOSURE" subtitle="从上报到验收，全程可追溯" show-back />
    <view class="page-body hazard-body">
      <view class="overview surface-card">
        <view><text class="strong">{{ overview.total }}</text><text>全部隐患</text></view>
        <view><text class="strong">{{ overview.rectifying }}</text><text>整改中</text></view>
        <view class="overview__alert"><text class="strong">{{ overview.pendingAcceptance }}</text><text>待验收</text></view>
      </view>

      <view class="hazard-tools surface-card">
        <SmisSearchBar v-model="keyword" placeholder="隐患编号 / 位置" action-label="查询" :disabled="loading" embedded @search="load(true)" />
        <SmisStatusTabs :model-value="status" :tabs="tabs" embedded @update:model-value="select" />
      </view>

      <view v-if="loading" class="loading"><wd-loading color="#4f46e5" /><text>正在同步隐患台账…</text></view>
      <view v-else-if="rows.length" class="hazard-list">
        <button v-for="item in rows" :key="item.id" class="hazard surface-card" @tap="openDetail(item.id)">
          <view class="hazard__head">
            <view class="hazard__level">{{ hazardLevelBadge(item.hazardLevel) }}</view>
            <view><text>{{ item.hazardNo }}</text><text class="small">{{ formatDate(item.reportedAt, true) }}</text></view>
            <SmisStatusTag :status="item.status" />
          </view>
          <text class="hazard__desc line-clamp-2">{{ item.description }}</text>
          <view class="hazard__place"><SmisIcon name="location" size="27rpx" /><text class="line-clamp-2">{{ item.location }}</text></view>
          <view class="hazard__foot"><text>上报：{{ item.reporterEmployeeName }}</text><text v-if="item.rectificationResponsibleEmployeeName">整改：{{ item.rectificationResponsibleEmployeeName }}</text><SmisIcon name="chevron" size="28rpx" /></view>
        </button>
        <SmisListFooter :loading="loadingMore" :finished="finished" :count="rows.length" />
      </view>
      <SmisEmpty v-else title="暂无隐患记录" description="现场发现问题，可通过底部“随手拍”立即上报" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.hazard-body { padding-bottom: 50rpx; }
.overview { padding: 26rpx 18rpx; display: grid; grid-template-columns: repeat(3, 1fr); }
.overview > view { display: flex; flex-direction: column; align-items: center; }
.overview > view + view { border-left: 1rpx solid var(--smis-line); }
.overview .strong { color: var(--smis-primary); font-size: 38rpx; font-weight: 800; line-height: 1; }
.overview text { margin-top: 9rpx; color: var(--smis-text-muted); font-size: 19rpx; font-weight: 600; }
.overview__alert .strong { color: var(--smis-warning); }
.hazard-tools { margin-top: 20rpx; padding: 10rpx; display: flex; flex-direction: column; gap: 8rpx; overflow: hidden; }
.loading { height: 280rpx; color: var(--smis-text-secondary); display: flex; align-items: center; justify-content: center; gap: 14rpx; font-size: 20rpx; }
.hazard-list { margin-top: 20rpx; display: flex; flex-direction: column; gap: 16rpx; }
.hazard { width: 100%; min-width: 0; margin: 0; padding: 24rpx; text-align: left; overflow: hidden; }
.hazard__head { display: flex; align-items: center; gap: 14rpx; }
.hazard__level { width: 58rpx; height: 58rpx; flex: 0 0 58rpx; border-radius: 17rpx; color: var(--smis-warning); background: #fff1df; font-size: 25rpx; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.hazard__head > view:nth-child(2) { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.hazard__head > view text { font-size: 23rpx; font-weight: 700; }
.hazard__head .small { margin-top: 4rpx; color: var(--smis-text-muted); font-size: 17rpx; font-weight: 500; }
.hazard__desc { display: block; margin-top: 17rpx; font-size: 26rpx; line-height: 1.5; font-weight: 700; }
.hazard__place { margin-top: 14rpx; color: var(--smis-text-secondary); font-size: 20rpx; display: flex; gap: 8rpx; }
.hazard__foot { margin-top: 18rpx; padding-top: 15rpx; border-top: 1rpx solid var(--smis-line); color: var(--smis-text-muted); font-size: 18rpx; display: flex; align-items: center; gap: 13rpx; }
.hazard__foot text:first-child { flex: 1; }
</style>
