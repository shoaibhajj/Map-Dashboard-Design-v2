import { useLanguage } from '../contexts/LanguageContext'

interface Props { onClose: () => void }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="legend-section-label">{children}</div>
}

export default function LegendPanel({ onClose }: Props) {
  const { t, isRTL } = useLanguage()

  const markerStatuses = [
    { color: '#16a34a', label: t('status_moving'), desc: t('legend_moving_desc'), pulse: true },
    { color: '#9ca3af', label: t('legend_idle_label'), desc: t('legend_idle_desc'), pulse: false },
    { color: '#ef4444', label: t('legend_offline_label'), desc: t('legend_offline_desc'), pulse: false },
  ]

  const sensorRows = [
    { label: 'Engine Temp', range: `80–100 °C ${t('legend_normal')}` },
    { label: 'Oil Pressure', range: `30–55 psi ${t('legend_normal')}` },
    { label: 'Battery', range: `12.6–14.4 V ${t('legend_healthy')}` },
    { label: 'RPM', range: `600–3000 rpm ${t('legend_typical')}` },
  ]

  const speedBands = [
    { color: '#16a34a', label: '0–60 km/h', note: t('legend_city') },
    { color: '#f59e0b', label: '60–100 km/h', note: t('legend_highway') },
    { color: '#ef4444', label: '100+ km/h', note: t('legend_highspeed') },
  ]

  return (
    <section className="fleet-panel legend-panel" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="fleet-panel-header legend-panel-header">
        <span className="legend-panel-icon" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><path d="M9 3v15M15 6v15"/>
          </svg>
        </span>
        <div className="legend-panel-heading"><strong>{t('legend_title')}</strong><small>{t('legend_subtitle')}</small></div>
        <button className="fleet-icon-button" type="button" onClick={onClose} aria-label={t('ctrl_close')} title={t('ctrl_close')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </header>

      <div className="legend-panel-content">
        <section className="legend-section">
          <SectionLabel>{t('legend_markers')}</SectionLabel>
          <div className="legend-marker-grid">
            {markerStatuses.map(status => (
              <div className="legend-marker-item" key={status.label}>
                <span className="legend-marker-visual" style={{ color: status.color }}>
                  <svg width="22" height="26" viewBox="0 0 32 38" fill="none" aria-hidden="true">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 14 22 16 22s16-11.5 16-22C32 7.163 24.837 0 16 0z" fill="currentColor"/>
                    <circle cx="16" cy="16" r="5" fill="white" opacity=".88"/>
                  </svg>
                  {status.pulse && <i/>}
                </span>
                <span className="legend-marker-copy"><strong style={{ color: status.color }}>{status.label}</strong><small>{status.desc}</small></span>
              </div>
            ))}
          </div>
        </section>

        <section className="legend-section">
          <SectionLabel>{t('legend_sensors')}</SectionLabel>
          <div className="legend-sensor-grid">
            {sensorRows.map(sensor => <div className="legend-sensor-item" key={sensor.label}><strong>{sensor.label}</strong><span>{sensor.range}</span></div>)}
          </div>
        </section>

        <section className="legend-section">
          <SectionLabel>{t('legend_speed_guide')}</SectionLabel>
          <div className="legend-speed-grid">
            {speedBands.map(band => <div className="legend-speed-item" key={band.label}><i style={{ background: band.color }}/><strong>{band.label}</strong><small>{band.note}</small></div>)}
          </div>
        </section>
      </div>
    </section>
  )
}
