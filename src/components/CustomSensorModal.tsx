import { useState, type FormEvent } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import type { CustomSensorBinding, CustomSensorDefinition } from '../utils/mapLegend'

interface Props {
  bindings: CustomSensorBinding[]
  onClose: () => void
  onAdd: (sensor: CustomSensorDefinition) => void
}

export default function CustomSensorModal({ bindings, onClose, onAdd }: Props) {
  const { t, isRTL } = useLanguage()
  const [name, setName] = useState('')
  const [sourceKey, setSourceKey] = useState(bindings[0]?.key ?? '')
  const selectedBinding = bindings.find(binding => binding.key === sourceKey) ?? bindings[0]
  const [unit, setUnit] = useState(selectedBinding?.unit ?? '')
  const [minimum, setMinimum] = useState(selectedBinding?.min === undefined ? '' : String(selectedBinding.min))
  const [maximum, setMaximum] = useState(selectedBinding?.max === undefined ? '' : String(selectedBinding.max))
  const [displayStyle, setDisplayStyle] = useState<CustomSensorDefinition['displayStyle']>('gauge')
  const [error, setError] = useState('')

  const selectBinding = (key: string) => {
    const binding = bindings.find(item => item.key === key)
    setSourceKey(key)
    setUnit(binding?.unit ?? '')
    setMinimum(binding?.min === undefined ? '' : String(binding.min))
    setMaximum(binding?.max === undefined ? '' : String(binding.max))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || !selectedBinding) return
    const min = minimum.trim() === '' ? undefined : Number(minimum)
    const max = maximum.trim() === '' ? undefined : Number(maximum)
    if ((min !== undefined && !Number.isFinite(min)) || (max !== undefined && !Number.isFinite(max)) || (min !== undefined && max !== undefined && min >= max)) {
      setError(t('map_custom_sensor_invalid_bounds'))
      return
    }
    onAdd({
      id: crypto.randomUUID(),
      name: trimmedName,
      sourceKey: selectedBinding.key,
      unit: unit.trim(),
      ...(min === undefined ? {} : { min }),
      ...(max === undefined ? {} : { max }),
      displayStyle,
    })
  }

  return <div className="vehicle-modal-backdrop" role="presentation" onMouseDown={event => {
    if (event.target === event.currentTarget) onClose()
  }}>
    <section className="vehicle-modal custom-sensor-modal" role="dialog" aria-modal="true" aria-labelledby="custom-sensor-title" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="vehicle-modal-header">
        <div>
          <div className="vehicle-modal-eyebrow">{t('map_sensor_or_value')}</div>
          <div className="vehicle-modal-title" id="custom-sensor-title">{t('map_custom_sensor_title')}</div>
          <p>{t('map_custom_sensor_description')}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={t('ctrl_close')}>×</button>
      </div>
      <form onSubmit={submit}>
        <div className="vehicle-form-grid">
          <label className="vehicle-form-field vehicle-form-wide">
            <span>{t('map_custom_sensor_name')}</span>
            <input required autoFocus value={name} onChange={event => setName(event.target.value)} placeholder={t('map_custom_sensor_name_placeholder')} />
          </label>
          <label className="vehicle-form-field vehicle-form-wide">
            <span>{t('map_custom_sensor_source')}</span>
            <select required value={selectedBinding?.key ?? ''} onChange={event => selectBinding(event.target.value)}>
              {(['vehicle', 'gps', 'sensor'] as const).map(source => <optgroup key={source} label={t(`map_source_${source}`)}>
                {bindings.filter(binding => binding.source === source).map(binding => <option key={binding.key} value={binding.key}>{binding.label}{binding.unit ? ` (${binding.unit})` : ''}</option>)}
              </optgroup>)}
            </select>
          </label>
          <label className="vehicle-form-field">
            <span>{t('map_custom_sensor_unit')}</span>
            <input value={unit} onChange={event => setUnit(event.target.value)} placeholder={t('map_custom_sensor_unit_placeholder')} />
          </label>
          <label className="vehicle-form-field">
            <span>{t('map_custom_sensor_display')}</span>
            <select value={displayStyle} onChange={event => setDisplayStyle(event.target.value as CustomSensorDefinition['displayStyle'])}>
              <option value="gauge">{t('map_custom_sensor_gauge')}</option>
              <option value="bar">{t('map_custom_sensor_bar')}</option>
            </select>
          </label>
          <label className="vehicle-form-field">
            <span>{t('map_custom_sensor_min')}</span>
            <input type="number" step="any" value={minimum} onChange={event => { setMinimum(event.target.value); setError('') }} placeholder={t('map_custom_sensor_optional')} />
          </label>
          <label className="vehicle-form-field">
            <span>{t('map_custom_sensor_max')}</span>
            <input type="number" step="any" value={maximum} onChange={event => { setMaximum(event.target.value); setError('') }} placeholder={t('map_custom_sensor_optional')} />
          </label>
        </div>
        {error && <p className="custom-sensor-error" role="alert">{error}</p>}
        <div className="vehicle-modal-actions">
          <button type="button" className="modal-secondary" onClick={onClose}>{t('ctrl_dismiss')}</button>
          <button type="submit" className="modal-primary" disabled={!selectedBinding}>{t('map_custom_sensor_create')}</button>
        </div>
      </form>
    </section>
  </div>
}
