import type { FleetGroup } from '../data/fleetEntities'
import type { TranslationKey } from '../i18n/strings'

const demoGroupTranslationKeys: Record<string, TranslationKey> = {
  riyadh: 'group_riyadh',
  'riyadh-north': 'group_riyadh_north',
  'riyadh-south': 'group_riyadh_south',
  'riyadh-east': 'group_riyadh_east',
  'riyadh-west': 'group_riyadh_west',
  'riyadh-central': 'group_riyadh_central',
}

export function getFleetGroupDisplayName(group: FleetGroup, translate: (key: TranslationKey) => string): string {
  const translationKey = demoGroupTranslationKeys[group.id]
  return translationKey ? translate(translationKey) : group.name
}

/** Returns the group and every nested group below it. */
export function getGroupBranchIds(groupId: string, groups: FleetGroup[]): Set<string> {
  const branch = new Set<string>([groupId])
  let changed = true
  while (changed) {
    changed = false
    for (const group of groups) {
      if (group.parentId && branch.has(group.parentId) && !branch.has(group.id)) {
        branch.add(group.id)
        changed = true
      }
    }
  }
  return branch
}

/** Group membership is independent from the vehicle's display zone. */
export function matchesGroupFilter(groupId: string | null | undefined, selectedGroupIds: string[], groups: FleetGroup[]): boolean {
  if (selectedGroupIds.length === 0) return true
  if (!groupId) return false
  return selectedGroupIds.some(selectedId => getGroupBranchIds(selectedId, groups).has(groupId))
}

export function getGroupDepth(group: FleetGroup, groups: FleetGroup[]): number {
  let depth = 0
  let parentId = group.parentId
  const visited = new Set<string>([group.id])
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId)
    depth += 1
    parentId = groups.find(item => item.id === parentId)?.parentId ?? null
  }
  return depth
}

