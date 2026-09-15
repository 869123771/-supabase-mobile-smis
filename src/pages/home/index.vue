<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SmisBottomNav from '@/components/SmisBottomNav.vue'
import SmisIcon from '@/components/SmisIcon.vue'
import SmisStatusTag from '@/components/SmisStatusTag.vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { listEquipment, listHazardInspectionTasks, listHazards, listRiskTasks } from '@/api/smis'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/api/supabase'

const auth = useAuthStore(); const profileStore = useProfileStore()
function nav(url:string){uni.navigateTo({url})}
function openWorkbench(){uni.reLaunch({url:'/pages/workbench/index'})}
const loading = ref(false); const error = ref('')
const dashboard = ref({ risk: { total: 0, notStarted: 0, inProgress: 0, overdue: 0, completed: 0 }, inspection: { total: 0, notStarted: 0, inProgress: 0, overdue: 0, completed: 0 }, hazard: { total: 0, pendingApproval: 0, rectifying: 0, pendingAcceptance: 0, completed: 0, closed: 0 }, equipment: { total: 0, inUse: 0, boilerCount: 0, dueSoon: 0 } })
const taskRows = ref<Array<{ id: string; type: 'risk'|'inspection'; title: string; code: string; status: string; end: string }>>([])
const userName = computed(() => profileStore.profile?.employeeName || String(auth.user?.user_metadata?.name || auth.user?.email || '安全员'))
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
const pendingTotal = computed(() => dashboard.value.risk.notStarted + dashboard.value.risk.inProgress + dashboard.value.risk.overdue + dashboard.value.inspection.notStarted + dashboard.value.inspection.inProgress + dashboard.value.inspection.overdue)
const closureRate = computed(() => dashboard.value.hazard.total ? Math.round(((dashboard.value.hazard.completed + dashboard.value.hazard.closed) / dashboard.value.hazard.total) * 100) : 100)

async function load() {
  if (!(await auth.ensureValidSession())) return
  loading.value = true; error.value = ''
  try {
    await profileStore.load(auth.token)
    const [risk, inspection, hazard, equipment] = await Promise.all([
      listRiskTasks(auth.token, { to: 4 }), listHazardInspectionTasks(auth.token, { to: 4 }), listHazards(auth.token, { to: 4 }), listEquipment(auth.token, { to: 0 })
    ])
    dashboard.value = { risk: risk.overview, inspection: inspection.overview, hazard: hazard.overview, equipment: equipment.overview }
    taskRows.value = [
      ...risk.records.map(item => ({ id: item.id, type: 'risk' as const, title: item.riskPointName, code: item.taskNo, status: item.status, end: item.plannedEndAt })),
      ...inspection.records.map(item => ({ id: item.id, type: 'inspection' as const, title: item.inspectionObject, code: item.taskNo, status: item.status, end: item.plannedEndAt }))
    ].filter(item => !['completed','cancelled'].includes(item.status)).slice(0, 3)
  } catch (e) { error.value = getErrorMessage(e, '安全数据同步失败，请稍后重试') } finally { loading.value = false }
}
function openTask(item: typeof taskRows.value[number]) { uni.navigateTo({ url: `/pages/${item.type}/detail?id=${item.id}` }) }
onShow(load)
</script>

<template>
  <view class="page-shell">
    <view class="hero">
      <view class="hero__top"><view><text class="hero__eyebrow">现场安全工作台</text><text class="hero__hello">{{ greeting }}，{{ userName }}</text><text class="hero__sub">今天也要把风险挡在作业之前</text></view><view class="hero__badge"><SmisIcon name="shield" size="42rpx" /></view></view>
      <view class="hero__summary"><view><text>今日待办</text><text class="strong">{{ pendingTotal }}</text></view><view class="hero__divider" /><view><text>隐患闭环率</text><text class="strong">{{ closureRate }}<text class="small">%</text></text></view><view class="hero__divider" /><view><text>设备在用</text><text class="strong">{{ dashboard.equipment.inUse }}</text></view></view>
      <view class="track"><view class="track__step track__step--done"><view class="i" /><text>待执行</text></view><view class="track__line track__line--done"/><view class="track__step track__step--active"><view class="i" /><text>整改中</text></view><view class="track__line"/><view class="track__step"><view class="i" /><text>待验收</text></view><view class="track__line"/><view class="track__step"><view class="i" /><text>已闭环</text></view></view>
    </view>
    <view class="page-body home-body">
      <view v-if="error" class="error-banner" aria-live="polite"><text>{{ error }}</text><button @tap="load">重新同步</button></view>
      <view class="quick-grid">
        <button class="quick-card" @tap="nav('/pages/risk/index')"><view class="quick-card__icon quick-card__icon--blue"><SmisIcon name="risk" size="42rpx" /></view><text>风险管控</text><text class="small">{{ dashboard.risk.overdue }} 项逾期</text></button>
        <button class="quick-card" @tap="nav('/pages/inspection/index')"><view class="quick-card__icon quick-card__icon--yellow"><SmisIcon name="inspection" size="42rpx" /></view><text>隐患排查</text><text class="small">{{ dashboard.inspection.inProgress }} 项执行中</text></button>
        <button class="quick-card" @tap="nav('/pages/hazards/index')"><view class="quick-card__icon quick-card__icon--orange"><SmisIcon name="hazard" size="42rpx" /></view><text>隐患治理</text><text class="small">{{ dashboard.hazard.rectifying }} 项整改中</text></button>
        <button class="quick-card" @tap="nav('/pages/equipment/index')"><view class="quick-card__icon quick-card__icon--green"><SmisIcon name="equipment" size="42rpx" /></view><text>设备台账</text><text class="small">{{ dashboard.equipment.dueSoon }} 台临检</text></button>
      </view>
      <view class="section-head"><view><text class="section-title">优先处理</text><text class="section-subtitle">按逾期与截止时间排序</text></view><button @tap="openWorkbench">查看全部</button></view>
      <view v-if="loading" class="loading-card surface-card"><wd-loading color="#4f46e5" /> <text>正在同步安全任务…</text></view>
      <view v-else-if="taskRows.length" class="task-list">
        <button v-for="item in taskRows" :key="item.id" class="task-row surface-card" @tap="openTask(item)"><view class="task-row__date"><text>{{ new Date(item.end).getDate() }}</text><text class="small">{{ new Date(item.end).getMonth()+1 }}月</text></view><view class="task-row__copy"><text class="line-clamp-2">{{ item.title }}</text><text class="small">{{ item.code }} · 截止 {{ formatDate(item.end, true) }}</text></view><SmisStatusTag :status="item.status" /></button>
      </view>
      <view v-else class="safe-state surface-card"><view><SmisIcon name="check" size="48rpx" /></view><text>当前没有紧急任务</text><text class="small">保持巡检节奏，异常及时随手拍</text></view>
      <button class="schedule-card" @tap="nav('/pages/schedule/index')"><view><text>我的排班</text><text class="small">查看本月班次与跨日安排</text></view><SmisIcon name="schedule" size="44rpx"/><SmisIcon name="chevron" size="30rpx"/></button>
    </view>
    <SmisBottomNav active="home" />
  </view>
</template>

<style scoped lang="scss">
.hero { position: relative; overflow: hidden; }
.hero::before { position: absolute; inset: 0; content: ''; opacity: .12; background-image: linear-gradient(rgba(255,255,255,.3) 1rpx,transparent 1rpx),linear-gradient(90deg,rgba(255,255,255,.3) 1rpx,transparent 1rpx); background-size: 72rpx 72rpx; pointer-events: none; }
.hero::after { position: absolute; top: -240rpx; right: -180rpx; width: 520rpx; height: 520rpx; content: ''; border: 1rpx solid rgba(255,255,255,.12); border-radius: 50%; box-shadow: 0 0 0 70rpx rgba(255,255,255,.035),0 0 0 140rpx rgba(255,255,255,.02); pointer-events: none; }
.hero > * { position: relative; z-index: 1; }
.hero { padding: calc(38rpx + env(safe-area-inset-top)) 30rpx 32rpx; color: #fff; background: var(--smis-hero-gradient); }.hero__top { display: flex; align-items: center; justify-content: space-between; }.hero__top > view:first-child { display: flex; flex-direction: column; }.hero__hello { font-size: 36rpx; font-weight: 700; }.hero__sub { margin-top: 8rpx; font-size: 23rpx; opacity: .72; }.hero__badge { width: 82rpx; height: 82rpx; border-radius: 26rpx; background: rgba(255,255,255,.11); color: var(--smis-safety); display:flex;align-items:center;justify-content:center; }.hero__summary { margin-top: 34rpx; padding: 28rpx 10rpx; border: 1rpx solid rgba(255,255,255,.12); border-radius: 24rpx; background: rgba(255,255,255,.07); display: grid; grid-template-columns: 1fr 1rpx 1fr 1rpx 1fr; }.hero__summary > view:not(.hero__divider) { display:flex;flex-direction:column;align-items:center; }.hero__summary text { font-size:21rpx;opacity:.72; }.hero__summary .strong { margin-top:8rpx;font-size:40rpx;line-height:1;font-weight:700; }.hero__summary .small { font-size:22rpx; }.hero__divider { width:1rpx;background:rgba(255,255,255,.14); }.track { margin-top: 28rpx; display:flex;align-items:flex-start; }.track__step { width:92rpx;display:flex;flex-direction:column;align-items:center;gap:9rpx;color:rgba(255,255,255,.48);font-size:19rpx; }.track__step .i { width:17rpx;height:17rpx;border:3rpx solid rgba(255,255,255,.38);border-radius:50%; }.track__step--done,.track__step--active { color:#fff; }.track__step--done .i { border-color:var(--smis-success);background:var(--smis-success); }.track__step--active .i { border-color:var(--smis-safety);background:var(--smis-safety);box-shadow:0 0 0 8rpx rgba(245,185,66,.15); }.track__line { flex:1;height:2rpx;margin-top:8rpx;background:rgba(255,255,255,.18); }.track__line--done{background:var(--smis-success);}.home-body{padding-top:28rpx}.error-banner{margin-bottom:22rpx;padding:20rpx;border-radius:18rpx;background:#fbe9e8;color:var(--smis-danger);display:flex;align-items:center;gap:16rpx;font-size:22rpx}.error-banner text{flex:1}.error-banner button{margin:0;min-height:64rpx;padding:0 24rpx;border-radius:14rpx;background:#fff;color:var(--smis-danger);font-size:21rpx}.quick-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18rpx}.quick-card{min-width:0;margin:0;padding:24rpx;border-radius:22rpx;background:#fff;text-align:left;box-shadow:var(--smis-shadow);display:grid;grid-template-columns:64rpx 1fr;grid-template-rows:auto auto;column-gap:16rpx}.quick-card__icon{grid-row:1/3;width:64rpx;height:64rpx;border-radius:19rpx;display:flex;align-items:center;justify-content:center}.quick-card__icon--blue{background:#eef2ff;color:var(--smis-primary)}.quick-card__icon--yellow{background:#fff4d8;color:#9a6712}.quick-card__icon--orange{background:#fcece0;color:var(--smis-warning)}.quick-card__icon--green{background:#e4f3ec;color:var(--smis-success)}.quick-card>text{font-size:26rpx;font-weight:700;color:var(--smis-text)}.quick-card>.small{margin-top:6rpx;color:var(--smis-text-muted);font-size:20rpx}.section-head{margin:38rpx 0 20rpx;display:flex;align-items:flex-end;justify-content:space-between}.section-head>view{display:flex;flex-direction:column}.section-head button{min-height:68rpx;margin:0;padding:0 12rpx;background:transparent;color:var(--smis-primary);font-size:22rpx}.loading-card{padding:50rpx;display:flex;align-items:center;justify-content:center;gap:16rpx;color:var(--smis-text-secondary);font-size:23rpx}.task-row{width:100%;margin:0 0 16rpx;padding:22rpx;text-align:left;display:flex;align-items:center;gap:18rpx}.task-row__date{width:68rpx;height:76rpx;border-radius:18rpx;background:#eef2ff;color:var(--smis-primary);display:flex;flex-direction:column;align-items:center;justify-content:center}.task-row__date text{font-size:28rpx;font-weight:700}.task-row__date .small{font-size:18rpx}.task-row__copy{min-width:0;flex:1;display:flex;flex-direction:column}.task-row__copy>text{font-size:25rpx;font-weight:700;line-height:1.4}.task-row__copy .small{margin-top:6rpx;color:var(--smis-text-muted);font-size:19rpx}.safe-state{padding:44rpx;display:flex;flex-direction:column;align-items:center}.safe-state>view{width:76rpx;height:76rpx;border-radius:24rpx;background:#e6f3ed;color:var(--smis-success);display:flex;align-items:center;justify-content:center}.safe-state>text{margin-top:16rpx;font-size:27rpx;font-weight:700}.safe-state .small{margin-top:8rpx;color:var(--smis-text-muted);font-size:21rpx}.schedule-card{width:100%;margin:20rpx 0 0;padding:28rpx;border-radius:22rpx;background:#211d59;color:#fff;text-align:left;display:flex;align-items:center;gap:20rpx}.schedule-card>view:first-child{min-width:0;flex:1;display:flex;flex-direction:column}.schedule-card text{font-size:28rpx;font-weight:700}.schedule-card .small{margin-top:7rpx;font-size:21rpx;opacity:.68}
</style>
