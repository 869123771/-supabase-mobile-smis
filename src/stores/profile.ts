import { defineStore } from 'pinia'
import { getReportingOptions } from '@/api/smis'
import type { ReportingOptions } from '@/api/types'

export const useProfileStore = defineStore('profile', {
  state: () => ({ options: null as ReportingOptions | null, loading: false }),
  getters: { profile: (state) => state.options?.profile || null },
  actions: {
    async load(token: string, force = false) {
      if (!token || this.loading || (this.options && !force)) return this.options
      this.loading = true
      try { this.options = await getReportingOptions(token); return this.options } finally { this.loading = false }
    },
    clear() { this.options = null; this.loading = false }
  }
})
