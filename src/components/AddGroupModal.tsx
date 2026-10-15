import { FormEvent, useState } from 'react'
import { FleetGroup } from '../data/fleetEntities'
import { useLanguage } from '../contexts/LanguageContext'
import { getFleetGroupDisplayName } from '../utils/fleetGroups'

interface Props {
  groups: FleetGroup[]
  onClose: () => void
  onAdd: (group: FleetGroup) => void
}

export default function AddGroupModal({ groups, onClose, onAdd }: Props) {
  const { t, isRTL } = useLanguage()
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState(() => groups.find(group => group.id === 'riyadh')?.id ?? '')

  const groupPath = (group: FleetGroup) => {
    const parts = [getFleetGroupDisplayName(group, t)]
    let parent = groups.find(item => item.id === group.parentId)
    while (parent) {
      parts.unshift(getFleetGroupDisplayName(parent, t))
      parent = groups.find(item => item.id === parent?.parentId)
    }
    return parts.join(' / ')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onAdd({ id: crypto.randomUUID(), name: trimmedName, parentId: parentId || null })
  }

  return (
    <div className="vehicle-modal-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="add-group-title" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="vehicle-modal-header">
          <div>
            <div className="vehicle-modal-eyebrow">{t('fleet_setup')}</div>
            <div className="vehicle-modal-title" id="add-group-title">{t('add_group')}</div>
            <p>{t('add_group_description')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('ctrl_close')}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="vehicle-form-grid">
            <label className="vehicle-form-field vehicle-form-wide">
              <span>{t('group_name')}</span>
              <input required autoFocus value={name} onChange={event => setName(event.target.value)} placeholder={t('group_name_placeholder')} />
            </label>
            <label className="vehicle-form-field vehicle-form-wide">
              <span>{t('parent_group')}</span>
              <select value={parentId} onChange={event => setParentId(event.target.value)}>
                <option value="">{t('root_group')}</option>
                {groups.map(group => <option key={group.id} value={group.id}>{groupPath(group)}</option>)}
              </select>
            </label>
          </div>
          <div className="vehicle-modal-actions">
            <button type="button" className="modal-secondary" onClick={onClose}>{t('ctrl_dismiss')}</button>
            <button type="submit" className="modal-primary">{t('create_group')}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
