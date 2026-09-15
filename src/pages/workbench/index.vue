<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import SmisBottomNav from '@/components/SmisBottomNav.vue'
import SmisIcon from '@/components/SmisIcon.vue'
import SmisTopBar from '@/components/SmisTopBar.vue'
import { requireSession } from '@/utils/guard'
type AppItem = { title: string; subtitle: string; icon: string; tone: string; url: string; available?: boolean }
const query = ref('')
const groups: Array<{ title: string; eyebrow: string; items: AppItem[] }> = [
  { title: '现场作业', eyebrow: 'FIELD WORK', items: [
    { title:'风险巡查',subtitle:'分级管控任务',icon:'risk',tone:'blue',url:'/pages/risk/index',available:true },
    { title:'隐患排查',subtitle:'逐项检查与留痕',icon:'inspection',tone:'yellow',url:'/pages/inspection/index',available:true },
    { title:'隐患治理',subtitle:'整改验收闭环',icon:'hazard',tone:'orange',url:'/pages/hazards/index',available:true },
    { title:'随手拍',subtitle:'现场快速上报',icon:'camera',tone:'red',url:'/pages/quick-report/index',available:true }
  ]},
  { title: '基础台账', eyebrow: 'FOUNDATION', items: [
    { title:'设备台账',subtitle:'设备状态与档案',icon:'equipment',tone:'green',url:'/pages/equipment/index',available:true },
    { title:'我的排班',subtitle:'月历与班次',icon:'schedule',tone:'violet',url:'/pages/schedule/index',available:true },
    { title:'风险辨识',subtitle:'风险源与措施',icon:'shield',tone:'blue',url:'',available:false },
    { title:'特殊作业',subtitle:'作业票协同',icon:'notice',tone:'orange',url:'',available:false }
  ]}
]
function open(item: AppItem) { item.available ? uni.navigateTo({ url: item.url }) : uni.showToast({ title: '该能力由 Web 端维护，移动端即将接入', icon: 'none' }) }
function visible(item: AppItem) { const value = query.value.trim(); return !value || `${item.title}${item.subtitle}`.includes(value) }
onShow(requireSession)
</script>
<template>
  <view class="page-shell"><SmisTopBar title="安全工作台" eyebrow="SAFETY WORKBENCH" subtitle="任务、台账与现场闭环" />
    <view class="page-body workbench-body">
      <view class="search"><SmisIcon name="search" size="34rpx" /><input v-model="query" type="search" name="workbench-search" aria-label="搜索工作台应用" autocomplete="off" placeholder="搜索应用" /><button v-if="query" aria-label="清空搜索" @tap="query=''">清除</button></view>
      <view v-for="group in groups" :key="group.title" class="app-group"><view class="app-group__head"><view><text>{{ group.eyebrow }}</text><text class="strong">{{ group.title }}</text></view><view class="i" /></view><view class="app-grid"><button v-for="item in group.items.filter(visible)" :key="item.title" class="app" :class="{ 'app--disabled': !item.available }" @tap="open(item)"><view class="app__icon" :class="`app__icon--${item.tone}`"><SmisIcon :name="item.icon" size="46rpx" /></view><view class="app__copy"><text>{{ item.title }}</text><text class="small">{{ item.subtitle }}</text></view><SmisIcon name="chevron" size="28rpx" /></button></view></view>
      <view class="web-note"><SmisIcon name="shield" size="38rpx" /><view><text>统一业务口径</text><text class="small">字典、权限、状态流转与 SMIS Web 端保持一致</text></view></view>
    </view><SmisBottomNav active="workbench" />
  </view>
</template>
<style scoped lang="scss">
.workbench-body{padding-top:26rpx}.search{height:88rpx;padding:0 22rpx;border:2rpx solid transparent;border-radius:22rpx;background:#fff;color:var(--smis-text-muted);display:flex;align-items:center;gap:16rpx;box-shadow:var(--smis-shadow)}.search:focus-within{border-color:var(--smis-primary)}.search input{min-width:0;flex:1;font-size:26rpx;color:var(--smis-text)}.search button{min-width:88rpx;min-height:70rpx;margin:0;padding:0;background:transparent;color:var(--smis-primary);font-size:21rpx}.app-group{margin-top:34rpx}.app-group__head{margin-bottom:16rpx;display:flex;align-items:flex-end;gap:18rpx}.app-group__head>view{display:flex;flex-direction:column}.app-group__head text{font-size:18rpx;color:var(--smis-primary);font-weight:700;letter-spacing:3rpx}.app-group__head .strong{margin-top:5rpx;font-size:30rpx}.app-group__head .i{flex:1;height:1rpx;background:var(--smis-line)}.app-grid{display:grid;grid-template-columns:1fr 1fr;gap:16rpx}.app{min-width:0;min-height:154rpx;margin:0;padding:22rpx;border-radius:22rpx;background:#fff;text-align:left;box-shadow:var(--smis-shadow);display:grid;grid-template-columns:64rpx 1fr 28rpx;align-items:center;gap:14rpx}.app__icon{width:64rpx;height:64rpx;border-radius:19rpx;display:flex;align-items:center;justify-content:center}.app__icon--blue{color:var(--smis-primary);background:#eef2ff}.app__icon--yellow{color:#96610e;background:#fff2d1}.app__icon--orange{color:var(--smis-warning);background:#faeadf}.app__icon--red{color:var(--smis-danger);background:#fbe9e8}.app__icon--green{color:var(--smis-success);background:#e4f2eb}.app__icon--violet{color:#715aa3;background:#f0ecf7}.app__copy{min-width:0;display:flex;flex-direction:column}.app__copy text{font-size:26rpx;font-weight:700;color:var(--smis-text)}.app__copy .small{margin-top:7rpx;color:var(--smis-text-muted);font-size:19rpx;line-height:1.35}.app--disabled{opacity:.58}.web-note{margin-top:28rpx;padding:25rpx;border-radius:20rpx;background:#eef2ff;color:var(--smis-primary);display:flex;align-items:center;gap:18rpx}.web-note>view{display:flex;flex-direction:column}.web-note text{font-size:24rpx;font-weight:700}.web-note .small{margin-top:6rpx;color:var(--smis-text-secondary);font-size:20rpx}
</style>
