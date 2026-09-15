export interface HierarchyNode {
  id: string
  parentId?: string | null
  children?: HierarchyNode[]
}

export interface PickerOption {
  label: string
  value: string
}

export function flattenHierarchy<T extends HierarchyNode>(rows: T[]): T[] {
  const result: T[] = []
  const seen = new Set<string>()

  const visit = (items: T[]) => {
    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        result.push(item)
      }
      visit((item.children || []) as T[])
    }
  }

  visit(rows)
  return result
}

export function toHierarchyOptions<T extends HierarchyNode>(rows: T[], labelOf: (item: T) => string): PickerOption[] {
  const flat = flattenHierarchy(rows)
  const byId = new Map(flat.map((item) => [item.id, item]))

  return flat.map((item) => {
    const labels: string[] = []
    const visited = new Set<string>()
    let current: T | undefined = item

    while (current && !visited.has(current.id)) {
      visited.add(current.id)
      labels.unshift(labelOf(current))
      current = current.parentId ? byId.get(current.parentId) : undefined
    }

    return { value: item.id, label: labels.filter(Boolean).join(' / ') }
  })
}
