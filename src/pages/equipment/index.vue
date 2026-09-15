<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
import SmisTopBar from '@/components/SmisTopBar.vue'
import SmisIcon from '@/components/SmisIcon.vue'
import SmisStatusTag from '@/components/SmisStatusTag.vue'
import SmisEmpty from '@/components/SmisEmpty.vue'
import SmisSearchBar from '@/components/SmisSearchBar.vue'
import SmisListFooter from '@/components/SmisListFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { useDictionaryStore } from '@/stores/dictionary'
import { listEquipment } from '@/api/smis'
import type { Equipment, EquipmentOverview } from '@/api/types'
import { getErrorMessage } from '@/api/supabase'

const PAGE_SIZE = 15
const auth = useAuthStore()
const dictionary = useDictionaryStore()
const keyword = ref('')
const rows = ref<Equipment[]>([])
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const overview = ref<EquipmentOverview>({ total: 0, inUse: 0, boilerCount: 0, dueSoon: 0 })
const finished = computed(() => rows.value.length >= total.value)

async function load(reset = true) {
  if (loading.value || loadingMore.value || !(await auth.ensureValidSession())) return
  reset ? (loading.value = true) : (loadingMore.value = true)
  const from = reset ? 0 : rows.value.length
  try {
    const data = await listEquipment(auth.token, { keyword: keyword.value, from, to: from + PAGE_SIZE - 1 })
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

function label(value: string, typeCodes: string[]) { return dictionary.labelAny(typeCodes, value, value) }
function openDetail(id: string) { uni.navigateTo({ url: `/pages/equipment/detail?id=${id}` }) }

onShow(() => load(true))
onLoad(() => dictionary.load(auth.token))
onPullDownRefresh(() => load(true))
onReachBottom(() => { if (!finished.value) void load(false) })
</script>

<template>
  <view class="page-shell">
    <SmisTopBar title="设备台账" eyebrow="EQUIPMENT LEDGER" subtitle="状态、位置与检验周期" show-back />
    <view class="page-body ledger-body">
      <view class="overview surface-card">
        <view><text>{{ overview.total }}</text><text class="small">设备总数</text></view>
        <view><text>{{ overview.inUse }}</text><text class="small">在用</text></view>
        <view class="overview__alert"><text>{{ overview.dueSoon }}</text><text class="small">临近检验</text></view>
      </view>

      <SmisSearchBar v-model="keyword" class="ledger-search" placeholder="设备编号 / 名称 / 型号" action-label="查询" :disabled="loading" @search="load(true)" />

      <view v-if="loading" class="loading"><wd-loading color="#4f46e5" /><text>正在读取设备档案…</text></view>
      <view v-else-if="rows.length" class="equipment-list">
        <button v-for="item in rows" :key="item.id" class="equipment surface-card" @tap="openDetail(item.id)">
          <view class="equipment__top">
            <view class="equipment__icon"><SmisIcon name="equipment" size="40rpx" /></view>
            <view class="equipment__copy"><text class="line-clamp-2">{{ item.equipmentName }}</text><text class="small">{{ item.equipmentCode }}</text></view>
            <SmisStatusTag :status="item.operationStatus" />
          </view>
          <view class="equipment__spec"><text>{{ item.category?.categoryName || label(item.equipmentKind, ['smisEquipmentKind']) }}</text><view class="i" /><text>{{ item.model || item.specification || '型号未录入' }}</text></view>
          <view class="equipment__location"><SmisIcon name="location" size="28rpx" /><text class="line-clamp-2">{{ item.location?.locationName || item.detailLocation || '位置未录入' }}</text></view>
          <view class="equipment__foot"><text>{{ label(item.useStatus, ['smisEquipmentUseStatus']) }}</text><text v-if="item.isSpecialEquipment" class="special">特种设备</text><SmisIcon name="chevron" size="28rpx" /></view>
        </button>
        <SmisListFooter :loading="loadingMore" :finished="finished" :count="rows.length" />
      </view>
      <SmisEmpty v-else title="未找到设备" description="请调整关键词或在 Web 端维护设备档案" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.ledger-body { padding-bottom: 50rpx; }
.overview { padding: 26rpx 18rpx; display: grid; grid-template-columns: repeat(3, 1fr); }
.overview > view { display: flex; flex-direction: column; align-items: center; }
.overview > view + view { border-left: 1rpx solid var(--smis-line); }
.overview text { color: var(--smis-primary); font-size: 38rpx; font-weight: 800; line-height: 1; }
.overview .small { margin-top: 9rpx; color: var(--smis-text-muted); font-size: 19rpx; font-weight: 600; }
.overview__alert text { color: var(--smis-warning); }
.ledger-search { margin-top: 20rpx; }
.loading { height: 320rpx; color: var(--smis-text-secondary); display: flex; align-items: center; justify-content: center; gap: 14rpx; font-size: 20rpx; }
.equipment-list { margin-top: 20rpx; display: flex; flex-direction: column; gap: 16rpx; }
.equipment { width: 100%; min-width: 0; margin: 0; padding: 24rpx; text-align: left; overflow: hidden; }
.equipment__top { display: flex; align-items: flex-start; gap: 16rpx; }
.equipment__icon { width: 64rpx; height: 64rpx; flex: 0 0 64rpx; border-radius: 19rpx; color: var(--smis-primary); background: var(--smis-primary-soft); display: flex; align-items: center; justify-content: center; }
.equipment__copy { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.equipment__copy text { font-size: 26rpx; font-weight: 700; line-height: 1.4; }
.equipment__copy .small { margin-top: 4rpx; color: var(--smis-text-muted); font-size: 18rpx; font-weight: 500; }
.equipment__spec { margin: 18rpx 0 0 80rpx; color: var(--smis-text-secondary); display: flex; align-items: center; gap: 12rpx; font-size: 20rpx; }
.equipment__spec .i { width: 1rpx; height: 22rpx; background: var(--smis-line); }
.equipment__location { margin-top: 18rpx; padding: 14rpx 16rpx; border-radius: 14rpx; color: var(--smis-text-secondary); background: var(--smis-control-bg); display: flex; gap: 9rpx; font-size: 20rpx; }
.equipment__foot { margin-top: 18rpx; padding-top: 16rpx; border-top: 1rpx solid var(--smis-line); color: var(--smis-text-muted); display: flex; align-items: center; gap: 10rpx; font-size: 18rpx; }
.equipment__foot text:first-child { flex: 1; }
.special { padding: 7rpx 12rpx; border-radius: 999rpx; color: var(--smis-warning); background: #fff1df; font-weight: 700; }
</style>
