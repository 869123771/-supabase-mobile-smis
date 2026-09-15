import { keysToCamel, request, restPath } from './supabase'

export interface DictionaryType { id: string; code: string; name: string }
export interface DictionaryEntry { id: string; typeId: string; value: string; label: string; color?: string; tagType?: string }

export async function listDictionaries(token: string) {
  const [types, entries] = await Promise.all([
    request<unknown[]>(restPath('sys_dict_type', '?select=id,code,name&status=eq.1&node_type=eq.dictionary&order=sort.asc&limit=1000'), { token }),
    request<unknown[]>(restPath('sys_dictionary', '?select=id,type_id,value,label,color,tag_type&status=eq.1&order=sort.asc&limit=2000'), { token })
  ])
  return { types: keysToCamel<DictionaryType[]>(types), entries: keysToCamel<DictionaryEntry[]>(entries) }
}
