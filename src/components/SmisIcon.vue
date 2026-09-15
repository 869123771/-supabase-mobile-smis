<script setup lang="ts">
import { computed } from 'vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

const props = withDefaults(defineProps<{ name: string; size?: string | number; color?: string }>(), { size: 36, color: '' })
const type = computed(() => ({
  home: 'home', message: 'chatboxes', camera: 'camera-filled', work: 'list', user: 'person',
  back: 'left', menu: 'more-filled', search: 'search', equipment: 'gear', schedule: 'calendar', risk: 'flag',
  inspection: 'checkbox', hazard: 'info-filled', chevron: 'right', clock: 'calendar',
  location: 'location', organization: 'staff', scan: 'scan', notice: 'notification',
  shield: 'locked', photo: 'image', close: 'closeempty', refresh: 'refreshempty', check: 'checkmarkempty'
}[props.name] || 'circle') as string)
</script>

<template><view class="icon" aria-hidden="true"><UniIcons :type="type" :size="size" :color="color || 'currentColor'" /></view></template>

<style scoped>.icon { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; line-height: 1; }</style>
