import { defineStore } from 'pinia'
import { passwordLogin, refreshToken, signOut } from '@/api/supabase'
import type { Session } from '@/api/types'
import { useDictionaryStore } from './dictionary'

const STORAGE_KEY = 'smis-mobile-session'
let refreshPromise: Promise<void> | null = null

function normalize(session: Session | null) {
  if (session && !session.expires_at && session.expires_in) session.expires_at = Math.floor(Date.now() / 1000) + session.expires_in
  return session
}

export const useAuthStore = defineStore('auth', {
  state: () => ({ session: null as Session | null, booted: false }),
  getters: {
    token: (state) => state.session?.access_token || '',
    user: (state) => state.session?.user || null,
    isLoggedIn: (state) => Boolean(state.session?.access_token),
    isTokenExpired: (state) => !state.session?.expires_at || state.session.expires_at * 1000 - Date.now() < 180000
  },
  actions: {
    hydrate() {
      if (this.booted) return
      const cached = uni.getStorageSync(STORAGE_KEY)
      try { this.session = normalize(cached ? (typeof cached === 'string' ? JSON.parse(cached) : cached) : null) } catch { this.session = null }
      this.booted = true
    },
    persist() { this.session ? uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.session)) : uni.removeStorageSync(STORAGE_KEY) },
    clear(redirect = false) {
      this.session = null; this.persist(); useDictionaryStore().clear()
      if (redirect) uni.reLaunch({ url: '/pages/login/index' })
    },
    async login(account: string, password: string) {
      this.session = normalize(await passwordLogin(account, password)); this.persist()
      await useDictionaryStore().load(this.token, true)
    },
    async ensureValidSession() {
      this.hydrate()
      if (!this.token) { this.clear(true); return false }
      if (!this.isTokenExpired) return true
      if (!refreshPromise) refreshPromise = (async () => {
        try {
          if (!this.session?.refresh_token) throw new Error('登录已过期')
          this.session = normalize(await refreshToken(this.session.refresh_token)); this.persist()
          await useDictionaryStore().load(this.token, true)
        } catch (error) { this.clear(true); throw error } finally { refreshPromise = null }
      })()
      try { await refreshPromise; return true } catch { return false }
    },
    async logout() { try { if (this.token) await signOut(this.token) } finally { this.clear(true) } }
  }
})
