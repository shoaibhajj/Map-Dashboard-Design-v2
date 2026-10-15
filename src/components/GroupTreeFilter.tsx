import { useEffect, useMemo, useState } from 'react'
import type { FleetGroup } from '../data/fleetEntities'
import { useLanguage } from '../contexts/LanguageContext'
import { getFleetGroupDisplayName } from '../utils/fleetGroups'

interface Props {
  groups: FleetGroup[]
  selectedIds: string[]
  onToggle: (groupId: string) => void
}

export default function GroupTreeFilter({ groups, selectedIds, onToggle }: Props) {
  const { t } = useLanguage()
  const childrenByParent = useMemo(() => {
    const children = new Map<string | null, FleetGroup[]>()
    groups.forEach(group => children.set(group.parentId, [...(children.get(group.parentId) ?? []), group]))
    return children
  }, [groups])
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(groups.filter(group => group.parentId === null).map(group => group.id)))

  useEffect(() => {
    setExpanded(current => new Set([...current].filter(id => groups.some(group => group.id === id))))
  }, [groups])

  if (groups.length === 0) return <div className="group-tree-empty">{t('groups_empty')}</div>

  const toggleExpanded = (id: string) => setExpanded(current => {
    const next = new Set(current)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const renderGroup = (group: FleetGroup, depth: number): React.ReactNode => {
    const children = childrenByParent.get(group.id) ?? []
    const hasChildren = children.length > 0
    const descendants = new Set<string>()
    const collect = (parentId: string) => (childrenByParent.get(parentId) ?? []).forEach(child => {
      descendants.add(child.id)
      collect(child.id)
    })
    collect(group.id)
    const partial = !selectedIds.includes(group.id) && selectedIds.some(id => descendants.has(id))
    return (
      <div className="group-tree-node" key={group.id}>
        <div className={`group-tree-row${selectedIds.includes(group.id) ? ' is-selected' : ''}`} style={{ '--group-depth': depth } as React.CSSProperties}>
          {hasChildren ? (
            <button className={`group-tree-disclosure${expanded.has(group.id) ? ' is-open' : ''}`} type="button" onClick={() => toggleExpanded(group.id)} aria-label={`${expanded.has(group.id) ? t('groups_collapse') : t('groups_expand')} ${group.name}`} aria-expanded={expanded.has(group.id)}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
            </button>
          ) : <span className="group-tree-disclosure-spacer" />}
          <input type="checkbox" checked={selectedIds.includes(group.id)} ref={element => { if (element) element.indeterminate = partial }} onChange={() => onToggle(group.id)} aria-label={group.name} />
          <span className="group-tree-name">{getFleetGroupDisplayName(group, t)}</span>
        </div>
        {hasChildren && expanded.has(group.id) && <div className="group-tree-children">{children.map(child => renderGroup(child, depth + 1))}</div>}
      </div>
    )
  }

  return <div className="group-tree-filter" role="group" aria-label={t('filter_groups')}>{(childrenByParent.get(null) ?? []).map(group => renderGroup(group, 0))}</div>
}
