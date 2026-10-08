import { useLanguage } from '../contexts/LanguageContext'
import type { Vehicle, VehicleStatus } from '../data/vehicles'
import {
  getMetricOptions,
  getVehicleMetric,
  getDefaultMetricRanges,
  DEFAULT_MAP_LEGEND,
  type MapColorRange,
  type MapLegendConfig,
} from '../utils/mapLegend'

interface Props {
  config: MapLegendConfig
  vehicles: Vehicle[]
  onChange: (config: MapLegendConfig) => void
  onClose: () => void
}

const STATUS_KEYS: VehicleStatus[] = ['moving', 'idle', 'offline']

export default function LegendPanel({ config, vehicles, onChange, onClose }: Props) {
  const { t, isRTL } = useLanguage()
  const options = getMetricOptions(vehicles)
  const activeMetric = options.find(option => option.key === config.metricKey) ?? options[0]
  const metricLabel = (key: string, fallback: string) => {
    const labels: Record<string, string> = {
      speed: t('lbl_speed'),
      fuelLevel: t('map_metric_fuel'),
      batteryPercent: t('map_metric_battery_percent'),
      batteryVoltage: t('map_metric_battery_voltage'),
      satellites: t('map_metric_satellites'),
      refrigerator_temperature: t('map_metric_refrigerator_temperature'),
      odometer: t('lbl_odometer'), tripDistance: t('map_metric_trip_distance'), engineHours: t('lbl_engine_hours'),
      actualWeightTons: t('map_metric_actual_weight'), weightLimitTons: t('map_metric_weight_limit'),
    }
    return labels[key] ?? fallback
  }
  const inputStyle: React.CSSProperties = {
    minWidth: 0,
    height: 32,
    border: '1px solid var(--border)',
    borderRadius: 7,
    background: 'var(--background)',
    color: 'var(--foreground)',
    padding: '0 8px',
    font: 'inherit',
    fontSize: 12,
  }
  const smallButton: React.CSSProperties = {
    height: 30,
    border: '1px solid var(--border)',
    borderRadius: 7,
    background: 'var(--card)',
    color: 'var(--foreground)',
    padding: '0 9px',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 650,
    whiteSpace: 'nowrap',
  }
  const colorStyle: React.CSSProperties = {
    width: 34,
    height: 30,
    border: '1px solid var(--border)',
    borderRadius: 7,
    background: 'var(--card)',
    padding: 3,
    cursor: 'pointer',
    flexShrink: 0,
  }

  const updateRange = (id: string, patch: Partial<MapColorRange>) => {
    onChange({ ...config, ranges: config.ranges.map(range => range.id === id ? { ...range, ...patch } : range) })
  }

  const addRange = () => {
    const max = config.ranges.reduce((value, range) => Math.max(value, range.max), -1)
    onChange({
      ...config,
      ranges: [...config.ranges, { id: `range-${Date.now()}`, min: max + 1, max: max + 10, color: '#3b82f6' }],
    })
  }

  const orderedRanges = [...config.ranges].sort((a, b) => a.min - b.min)
  const isInRange = (value: number, index: number) => {
    const range = orderedRanges[index]
    return value >= range.min && (value < range.max || (index === orderedRanges.length - 1 && value <= range.max))
  }
  const demoCounts = orderedRanges.map((range, index) => ({
    range,
    count: vehicles.filter(vehicle => {
      const value = getVehicleMetric(vehicle, config.metricKey)
      return value !== null && isInRange(value, index)
    }).length,
  }))
  const noDataCount = vehicles.filter(vehicle => {
    const value = getVehicleMetric(vehicle, config.metricKey)
    return value === null || !orderedRanges.some((range, index) => isInRange(value, index))
  }).length

  return (
    <section dir={isRTL ? 'rtl' : 'ltr'} aria-label={t('legend_title')} onClick={event => event.stopPropagation()} style={{
      width: 'min(370px, calc(100vw - 24px))',
      maxHeight: 'min(76vh, 650px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      color: 'var(--foreground)',
      background: 'color-mix(in srgb, var(--card) 97%, transparent)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border)',
      borderRadius: 13,
      boxShadow: '0 14px 40px rgba(15, 23, 42, .2)',
    }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 10%, var(--secondary))', borderRadius: 9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="6" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><path d="M11 6h10M11 12h10M11 18h10"/>
          </svg>
        </span>
        <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 2 }}>
          <strong style={{ fontSize: 14, fontWeight: 800 }}>{t('legend_title')}</strong>
          <small style={{ color: 'var(--muted-foreground)', fontSize: 10.5 }}>{t('map_legend_subtitle')}</small>
        </div>
        <button type="button" onClick={onClose} aria-label={t('ctrl_close')} title={t('ctrl_close')} style={{ ...smallButton, width: 30, padding: 0, display: 'grid', placeItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </header>

      <div style={{ padding: 13, display: 'grid', gap: 12, overflowY: 'auto' }}>
        <label style={{ display: 'grid', gap: 5, fontSize: 11, fontWeight: 700 }}>
          {t('map_color_by')}
          <select value={config.mode} onChange={event => {
            const mode = event.target.value as MapLegendConfig['mode']
            const metric = options.find(option => option.key === config.metricKey) ?? options[0]
            onChange({ ...config, mode, ranges: mode === 'metric' ? getDefaultMetricRanges(metric) : config.ranges })
          }} style={inputStyle}>
            <option value="status">{t('map_color_status')}</option>
            <option value="metric">{t('map_color_metric')}</option>
          </select>
        </label>

        {config.mode === 'status' ? (
          <div style={{ display: 'grid', gap: 7 }}>
            <div style={{ fontSize: 11, fontWeight: 750 }}>{t('map_status_colors')}</div>
            {STATUS_KEYS.map(status => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', background: 'var(--secondary)', borderRadius: 8 }}>
                <input type="color" value={config.statusColors[status]} aria-label={t(`status_${status}`)} onChange={event => onChange({ ...config, statusColors: { ...config.statusColors, [status]: event.target.value } })} style={colorStyle}/>
                <span style={{ fontSize: 12, fontWeight: 650 }}>{t(`status_${status}`)}</span>
                <span style={{ marginInlineStart: 'auto', width: 9, height: 9, borderRadius: '50%', background: config.statusColors[status], boxShadow: `0 0 7px ${config.statusColors[status]}88` }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <label style={{ display: 'grid', gap: 5, fontSize: 11, fontWeight: 700 }}>
              {t('map_sensor_or_value')}
              <select value={config.metricKey} onChange={event => {
                const next = options.find(option => option.key === event.target.value) ?? options[0]
                onChange({ ...config, metricKey: next.key, ranges: getDefaultMetricRanges(next) })
              }} style={inputStyle}>
                {(['vehicle', 'gps', 'sensor'] as const).map(source => <optgroup key={source} label={t(`map_source_${source}`)}>
                  {options.filter(option => option.source === source).map(option => <option key={option.key} value={option.key}>{metricLabel(option.key, option.label)}{option.unit ? ` (${option.unit})` : ''}</option>)}
                </optgroup>)}
              </select>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ flex: 1, fontSize: 11 }}>{t('map_threshold_ranges')}</strong>
              <button type="button" onClick={() => onChange({ ...config, ranges: getDefaultMetricRanges(activeMetric) })} style={smallButton}>{t('map_recommended_ranges')}</button>
            </div>

            {config.ranges.map((range, index) => (
              <div key={range.id} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr) minmax(0,1fr) 30px', alignItems: 'center', gap: 6, padding: '7px', background: 'var(--secondary)', borderRadius: 8 }}>
                <input type="color" value={range.color} aria-label={`${t('map_range_color')} ${index + 1}`} onChange={event => updateRange(range.id, { color: event.target.value })} style={colorStyle}/>
                <label style={{ display: 'grid', gap: 3, fontSize: 9.5, color: 'var(--muted-foreground)' }}>{`${t('map_minimum')}${activeMetric?.unit ? ` (${activeMetric.unit})` : ''}`}<input type="number" min={activeMetric?.kind === 'temperature' ? undefined : activeMetric?.min} max={activeMetric?.max} step={activeMetric?.step ?? 1} value={range.min} onChange={event => updateRange(range.id, { min: Number(event.target.value) })} style={{ ...inputStyle, width: '100%', height: 29 }}/></label>
                <label style={{ display: 'grid', gap: 3, fontSize: 9.5, color: 'var(--muted-foreground)' }}>{`${t('map_maximum')}${activeMetric?.unit ? ` (${activeMetric.unit})` : ''}`}<input type="number" min={activeMetric?.kind === 'temperature' ? undefined : activeMetric?.min} max={activeMetric?.max} step={activeMetric?.step ?? 1} value={range.max} onChange={event => updateRange(range.id, { max: Number(event.target.value) })} style={{ ...inputStyle, width: '100%', height: 29 }}/></label>
                <button type="button" onClick={() => onChange({ ...config, ranges: config.ranges.filter(item => item.id !== range.id) })} aria-label={t('map_remove_range')} title={t('map_remove_range')} style={{ ...smallButton, width: 30, padding: 0, color: '#ef4444' }}>×</button>
              </div>
            ))}

            <button type="button" onClick={addRange} style={{ ...smallButton, width: '100%', borderStyle: 'dashed', color: 'var(--primary)' }}>+ {t('map_add_range')}</button>

            <div style={{ display: 'grid', gap: 6, paddingTop: 3 }}>
              {demoCounts.map(({ range, count }) => (
                <div key={range.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: range.color, boxShadow: `0 0 6px ${range.color}77` }}/>
                  <span>{range.min} – {range.max}{activeMetric?.unit ? ` ${activeMetric.unit}` : ''}</span>
                  <span style={{ marginInlineStart: 'auto', color: 'var(--muted-foreground)' }}>{count} {t('map_demo_vehicles')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: config.noDataColor }}/>
                <span>{t('map_no_reading')}</span><span style={{ marginInlineStart: 'auto', color: 'var(--muted-foreground)' }}>{noDataCount} {t('map_demo_vehicles')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 650 }}>
              <input type="color" value={config.noDataColor} aria-label={t('map_no_reading')} onChange={event => onChange({ ...config, noDataColor: event.target.value })} style={colorStyle}/>
              {t('map_no_data_color')}
            </div>
            <p style={{ margin: 0, padding: '8px 9px', borderRadius: 7, background: 'color-mix(in srgb, var(--primary) 8%, var(--card))', color: 'var(--muted-foreground)', fontSize: 10.5, lineHeight: 1.55 }}>
              {t('map_sensor_hint')}
            </p>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 9 }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 9.5 }}>{t('map_saved_in_browser')}</span>
          <button type="button" onClick={() => onChange({ ...DEFAULT_MAP_LEGEND, statusColors: { ...DEFAULT_MAP_LEGEND.statusColors } })} style={smallButton}>{t('map_reset_settings')}</button>
        </div>
      </div>
    </section>
  )
}
