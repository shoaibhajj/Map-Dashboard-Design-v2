import { FormEvent, useState } from 'react'
import { FleetDriver } from '../data/fleetEntities'
import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  onClose: () => void
  onAdd: (driver: FleetDriver) => void
}

export default function AddDriverModal({ onClose, onAdd }: Props) {
  const { t, isRTL } = useLanguage()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    const trimmedPhone = phone.trim()
    onAdd({ id: crypto.randomUUID(), name: trimmedName, ...(trimmedPhone ? { phone: trimmedPhone } : {}) })
  }

  return (
    <div className="vehicle-modal-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="add-driver-title" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="vehicle-modal-header">
          <div>
            <div className="vehicle-modal-eyebrow">{t('fleet_setup')}</div>
            <div className="vehicle-modal-title" id="add-driver-title">{t('add_driver')}</div>
            <p>{t('add_driver_description')}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('ctrl_close')}>×</button>
        </div>
        <form onSubmit={submit}>
          <div className="vehicle-form-grid">
            <label className="vehicle-form-field vehicle-form-wide">
              <span>{t('driver_name')}</span>
              <input required autoFocus value={name} onChange={event => setName(event.target.value)} placeholder={t('driver_name_placeholder')} />
            </label>
            <label className="vehicle-form-field vehicle-form-wide">
              <span>{t('driver_phone')}</span>
              <input type="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder={t('driver_phone_placeholder')} />
            </label>
          </div>
          <div className="vehicle-modal-actions">
            <button type="button" className="modal-secondary" onClick={onClose}>{t('ctrl_dismiss')}</button>
            <button type="submit" className="modal-primary">{t('create_driver')}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
