import { defineStore } from 'pinia'
import { listDictionaries, type DictionaryEntry, type DictionaryType } from '@/api/dictionary'

export const useDictionaryStore = defineStore('dictionary', {
  state: () => ({ types: [] as DictionaryType[], entries: [] as DictionaryEntry[], loaded: false, loading: false }),
  getters: {
    typeIdByCode: (state) => Object.fromEntries(state.types.map((item) => [item.code, item.id])) as Record<string, string>
  },
  actions: {
    async load(token: string, force = false) {
      if (!token || this.loading || (this.loaded && !force)) return
      this.loading = true
      try { Object.assign(this, await listDictionaries(token)); this.loaded = true } finally { this.loading = false }
    },
    label(typeCode: string, value?: string | null, fallback = '--') {
      if (!value) return fallback
      const typeId = this.typeIdByCode[typeCode]
      return this.entries.find((item) => item.typeId === typeId && item.value === value)?.label || value
    },
    labelAny(typeCodes: string[], value?: string | null, fallback = '--') {
      if (!value) return fallback
      for (const code of typeCodes) {
        const label = this.label(code, value, '')
        if (label && label !== value) return label
      }
      return value
    },
    clear() { this.types = []; this.entries = []; this.loaded = false; this.loading = false }
  }
})
