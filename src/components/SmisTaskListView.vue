<script setup lang="ts">
import { ref } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import SmisTopBar from './SmisTopBar.vue'
import SmisTaskCard from './SmisTaskCard.vue'
import SmisEmpty from './SmisEmpty.vue'
import SmisIcon from './SmisIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { listHazardInspectionTasks, listRiskTasks } from '@/api/smis'
import type { HazardInspectionTask, RiskTask, TaskOverview, TaskStatus } from '@/api/types'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/api/supabase'

const props = defineProps<{ kind: 'risk' | 'inspection' }>()
const auth = useAuthStore()
const loading = ref(false)
const keyword = ref('')
const status = ref<TaskStatus | ''>('')
const rows = ref<Array<RiskTask | HazardInspectionTask>>([])
const overview = ref<TaskOverview>({ total: 0, notStarted: 0, inProgress: 0, overdue: 0, completed: 0, cancelled: 0 })
const tabs: Array<{ value: TaskStatus | ''; label: string }> = [
  { value: '', label: '全部' },
  { value: 'not_started', label: '待执行' },
  { value: 'in_progress', label: '执行中' },
  { value: 'overdue', label: '已逾期' },
  { value: 'completed', label: '已完成' }
]

async function load() {
  if (!(await auth.ensureValidSession())) return
  loading.value = true
  try {
    const data = props.kind === 'risk'
      ? await listRiskTasks(auth.token, { keyword: keyword.value, status: status.value || undefined, to: 49 })
      : await listHazardInspectionTasks(auth.token, { keyword: keyword.value, status: status.value || undefined, to: 49 })
    rows.value = data.records
    overview.value = data.overview
  } catch (error) {
    uni.showToast({ title: getErrorMessage(error), icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

function select(value: TaskStatus | '') {
  status.value = value
  void load()
}

function title(item: RiskTask | HazardInspectionTask) {
  return props.kind === 'risk' ? (item as RiskTask).riskPointName : (item as HazardInspectionTask).inspectionObject
}

function place(item: RiskTask | HazardInspectionTask) {
  return props.kind === 'risk' ? `风险等级 ${(item as RiskTask).riskLevelName}` : (item as HazardInspectionTask).inspectionTypeName
}

function progress(item: RiskTask | HazardInspectionTask) {
  return props.kind === 'risk'
    ? `${(item as RiskTask).completedItemCount}/${item.itemCount} 项`
    : `${(item as HazardInspectionTask).normalCount + (item as HazardInspectionTask).abnormalCount}/${item.itemCount} 项`
}

function abnormal(item: RiskTask | HazardInspectionTask) {
  return props.kind === 'risk' ? (item as RiskTask).abnormalCount : (item as HazardInspectionTask).abnormalCount
}

function open(item: RiskTask | HazardInspectionTask) {
  uni.navigateTo({ url: `/pages/${props.kind}/detail?id=${item.id}` })
}

onShow(load)
onPullDownRefresh(load)
</script>

<template>
  <view class="page-shell">
    <SmisTopBar
      :title="kind === 'risk' ? '风险巡查' : '隐患排查'"
      :eyebrow="kind === 'risk' ? 'RISK CONTROL' : 'FIELD INSPECTION'"
      :subtitle="kind === 'risk' ? '分级管控，责任到人' : '逐项检查，异常转隐患'"
      show-back
    />
    <view class="page-body task-body">
      <view class="summary surface-card">
        <view><text class="strong">{{ overview.total }}</text><text>任务总数</text></view>
        <view><text class="strong">{{ overview.inProgress }}</text><text>执行中</text></view>
        <view class="summary__overdue"><text class="strong">{{ overview.overdue }}</text><text>已逾期</text></view>
      </view>

      <view class="task-tools surface-card">
        <view class="search">
          <SmisIcon name="search" size="32rpx" />
          <input
            v-model="keyword"
            type="search"
            name="task-search"
            aria-label="搜索任务"
            autocomplete="off"
            :placeholder="kind === 'risk' ? '任务编号 / 风险点' : '搜索任务编号'"
            confirm-type="search"
            @confirm="load"
          />
          <button @tap="load">搜索</button>
        </view>
        <scroll-view class="tabs" scroll-x :show-scrollbar="false">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            :class="{ 'tab--active': status === tab.value }"
            :aria-pressed="status === tab.value"
            @tap="select(tab.value)"
          >
            {{ tab.label }}
          </button>
        </scroll-view>
      </view>

      <view v-if="loading" class="loading surface-card" aria-live="polite">
        <wd-loading color="#4f46e5" />
        <text>正在同步任务…</text>
      </view>
      <view v-else-if="rows.length" class="task-list">
        <SmisTaskCard
          v-for="item in rows"
          :key="item.id"
          :title="title(item)"
          :code="item.taskNo"
          :status="item.status"
          :place="place(item)"
          :start="formatDate(item.plannedStartAt)"
          :end="formatDate(item.plannedEndAt)"
          :progress="progress(item)"
          :danger-count="abnormal(item)"
          @tap="open(item)"
        />
      </view>
      <SmisEmpty v-else title="暂无排查任务" description="任务由 Web 端计划生成，发布后会同步到这里" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.task-body { padding-top: 28rpx; padding-bottom: 56rpx; }
.summary { padding: 28rpx 16rpx; display: grid; grid-template-columns: repeat(3, 1fr); }
.summary > view { position: relative; display: flex; flex-direction: column; align-items: center; }
.summary > view + view::before { position: absolute; left: 0; top: 8rpx; bottom: 8rpx; width: 1rpx; content: ''; background: var(--smis-line-soft); }
.summary .strong { color: var(--smis-primary); font-size: 40rpx; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
.summary text { margin-top: 10rpx; color: var(--smis-text-muted); font-size: 21rpx; font-weight: 600; }
.summary__overdue .strong { color: var(--smis-danger); }
.task-tools { margin-top: 20rpx; padding: 12rpx; overflow: visible; }
.search { height: 84rpx; padding-left: 18rpx; border-radius: 18rpx; color: var(--smis-text-muted); background: var(--smis-control-bg); display: flex; align-items: center; gap: 12rpx; }
.search:focus-within { box-shadow: 0 0 0 3rpx rgba(79, 70, 229, 0.16); }
.search input { min-width: 0; flex: 1; color: var(--smis-text); font-size: 24rpx; }
.search button { height: 64rpx; margin: 0 2rpx 0 0; padding: 0 24rpx; border-radius: 14rpx; color: #fff; background: var(--smis-primary-gradient); font-size: 22rpx; font-weight: 700; }
.tabs { width: 100%; margin-top: 12rpx; white-space: nowrap; }
.tabs button { display: inline-flex; min-width: 108rpx; height: 64rpx; margin: 0 8rpx 0 0; padding: 0 20rpx; border-radius: 16rpx; color: var(--smis-text-secondary); background: transparent; align-items: center; justify-content: center; font-size: 21rpx; font-weight: 600; }
.tabs .tab--active { color: var(--smis-primary); background: var(--smis-primary-soft); font-weight: 800; }
.task-list { margin-top: 20rpx; display: flex; flex-direction: column; gap: 18rpx; }
.loading { min-height: 280rpx; margin-top: 20rpx; display: flex; align-items: center; justify-content: center; gap: 14rpx; color: var(--smis-text-secondary); font-size: 22rpx; }
</style>
