<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ status?: string | null; label?: string }>()
const labels: Record<string, string> = {
  not_started: '待执行', in_progress: '执行中', overdue: '已逾期', completed: '已完成', cancelled: '已取消',
  pending_approval: '待核准', rectifying: '整改中', pending_acceptance: '待验收', closed: '已关闭',
  normal: '正常', abnormal: '异常', pending: '待检查', in_use: '在用', stopped: '停用', scrapped: '报废',
  maintenance: '检修中', fault: '故障', idle: '闲置', active: '有效', enabled: '启用', disabled: '停用'
}
const text = computed(() => props.label || labels[props.status || ''] || props.status || '--')
const tone = computed(() => {
  if (['completed','closed','normal','in_use','enabled','active'].includes(props.status || '')) return 'success'
  if (['overdue','abnormal','fault'].includes(props.status || '')) return 'danger'
  if (['in_progress','rectifying','pending_acceptance','maintenance'].includes(props.status || '')) return 'warning'
  return 'neutral'
})
</script>

<template><text class="tag" :class="`tag--${tone}`"><text class="tag__dot">●</text>{{ text }}</text></template>
<style scoped>
.tag { display: inline-flex; align-items: center; min-height: 44rpx; padding: 0 16rpx; border-radius: 999rpx; font-size: 21rpx; font-weight: 700; line-height: 1; white-space: nowrap; background: #edf1f4; color: #61717d; }
.tag__dot { margin-right: 8rpx; font-size: 14rpx; line-height: 1; }
.tag--success { background: #e7f4ee; color: #257354; }.tag--warning { background: #fff1df; color: #aa5b1f; }.tag--danger { background: #fbe9e8; color: #ae3735; }
</style>
