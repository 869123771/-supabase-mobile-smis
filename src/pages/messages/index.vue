<script setup lang="ts">
import { computed, ref } from 'vue'
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import SmisBottomNav from '@/components/SmisBottomNav.vue'
import SmisTopBar from '@/components/SmisTopBar.vue'
import SmisIcon from '@/components/SmisIcon.vue'
import SmisListFooter from '@/components/SmisListFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { listHazards, listRiskTasks } from '@/api/smis'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/api/supabase'

type MessageRow = { id: string; type: string; title: string; body: string; time: string; url: string }

const PAGE_SIZE = 8
const auth = useAuthStore()
const loading = ref(false)
const loadingMore = ref(false)
const rows = ref<MessageRow[]>([])
const riskOffset = ref(0)
const hazardOffset = ref(0)
const riskTotal = ref(0)
const hazardTotal = ref(0)
const grouped = computed(() => rows.value)
const finished = computed(() => riskOffset.value >= riskTotal.value && hazardOffset.value >= hazardTotal.value)

async function load(reset = true) {
  if (loading.value || loadingMore.value || !(await auth.ensureValidSession())) return
  reset ? (loading.value = true) : (loadingMore.value = true)
  const riskFrom = reset ? 0 : riskOffset.value
  const hazardFrom = reset ? 0 : hazardOffset.value
  try {
    const [risk, hazard] = await Promise.all([
      listRiskTasks(auth.token, { status: 'overdue', from: riskFrom, to: riskFrom + PAGE_SIZE - 1 }),
      listHazards(auth.token, { status: 'pending_acceptance', from: hazardFrom, to: hazardFrom + PAGE_SIZE - 1 })
    ])
    riskTotal.value = risk.total
    hazardTotal.value = hazard.total
    riskOffset.value = riskFrom + risk.records.length
    hazardOffset.value = hazardFrom + hazard.records.length
    const additions: MessageRow[] = [
      ...risk.records.map((item) => ({ id: item.id, type: '逾期提醒', title: item.riskPointName, body: `风险巡查 ${item.taskNo} 已超过计划时间`, time: item.plannedEndAt, url: `/pages/risk/detail?id=${item.id}` })),
      ...hazard.records.map((item) => ({ id: item.id, type: '待验收', title: item.description, body: `隐患 ${item.hazardNo} 已提交整改，请及时验收`, time: item.rectificationCompletedAt || item.reportedAt, url: `/pages/hazards/detail?id=${item.id}` }))
    ]
    const merged = reset ? additions : [...rows.value, ...additions]
    rows.value = [...new Map(merged.map((item) => [`${item.type}-${item.id}`, item])).values()]
      .sort((left, right) => +new Date(right.time) - +new Date(left.time))
  } catch (error) {
    uni.showToast({ title: getErrorMessage(error, '提醒加载失败'), icon: 'none' })
  } finally {
    loading.value = false
    loadingMore.value = false
    uni.stopPullDownRefresh()
  }
}

function open(url: string) { uni.navigateTo({ url }) }
onShow(() => load(true))
onPullDownRefresh(() => load(true))
onReachBottom(() => { if (!finished.value) void load(false) })
</script>

<template>
  <view class="page-shell">
    <SmisTopBar title="安全消息" eyebrow="SAFETY NOTICE" subtitle="只聚焦需要你处理的变化" />
    <view class="page-body message-body">
      <view v-if="loading" class="state"><wd-loading color="#4f46e5" /><text>正在读取提醒…</text></view>
      <view v-else-if="grouped.length" class="message-list">
        <button v-for="item in grouped" :key="`${item.type}-${item.id}`" class="message surface-card" @tap="open(item.url)">
          <view class="message__icon"><SmisIcon name="notice" size="38rpx" /></view>
          <view class="message__copy">
            <view><text>{{ item.type }}</text><text class="small">{{ formatDate(item.time, true) }}</text></view>
            <text class="strong line-clamp-2">{{ item.title }}</text>
            <text class="paragraph line-clamp-2">{{ item.body }}</text>
          </view>
          <SmisIcon name="chevron" size="28rpx" />
        </button>
        <SmisListFooter :loading="loadingMore" :finished="finished" :count="rows.length" />
      </view>
      <view v-else class="state surface-card"><view class="state__safe"><SmisIcon name="check" size="50rpx" /></view><text>没有待处理消息</text><text class="small">逾期任务和待验收隐患会出现在这里</text></view>
    </view>
    <SmisBottomNav active="messages" />
  </view>
</template>

<style scoped lang="scss">
.message-body { padding-top: 26rpx; }
.message-list { display: flex; flex-direction: column; gap: 16rpx; }
.message { width: 100%; min-width: 0; margin: 0; padding: 24rpx; text-align: left; display: flex; align-items: center; gap: 18rpx; overflow: hidden; }
.message__icon { width: 66rpx; height: 66rpx; flex: 0 0 66rpx; border-radius: 20rpx; color: var(--smis-warning); background: #fff1df; display: flex; align-items: center; justify-content: center; }
.message__copy { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.message__copy > view { display: flex; justify-content: space-between; gap: 12rpx; }
.message__copy > view text { color: var(--smis-warning); font-size: 18rpx; font-weight: 700; }
.message__copy .small { color: var(--smis-text-muted); font-size: 17rpx; font-weight: 500; }
.message__copy .strong { margin-top: 8rpx; color: var(--smis-text); font-size: 25rpx; font-weight: 750; line-height: 1.4; }
.message__copy .paragraph { margin: 5rpx 0 0; color: var(--smis-text-secondary); font-size: 19rpx; line-height: 1.45; }
.state { min-height: 360rpx; padding: 60rpx; color: var(--smis-text-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14rpx; }
.state__safe { width: 86rpx; height: 86rpx; border-radius: 26rpx; color: var(--smis-success); background: #e5f3ec; display: flex; align-items: center; justify-content: center; }
.state > text { font-size: 26rpx; font-weight: 700; }
.state > .small { color: var(--smis-text-muted); font-size: 19rpx; line-height: 1.5; text-align: center; }
</style>
