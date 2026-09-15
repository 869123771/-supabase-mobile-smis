import { useAuthStore } from '@/stores/auth'

export async function requireSession() {
  return useAuthStore().ensureValidSession()
}
