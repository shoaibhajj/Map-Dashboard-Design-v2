import { useCallback, useMemo, useRef, useState } from 'react'
import { Vehicle } from '../data/vehicles'
import { useLanguage } from '../contexts/LanguageContext'

type View = 'status' | 'raw'
interface Props { vehicles: Vehicle[]; height: number; onHeightChange: (height: number) => void }
const PAGE_SIZE = 5
const MIN_HEIGHT = 190

function Icon({ name, size = 16 }: { name: 'up' | 'down' | 'report' | 'export'; size?: number }) {
  const paths = {
    up: <path d="m6 14 6-6 6 6" />,
    down: <path d="m6 10 6 6 6-6" />,
    report: <><path d="M3 3v18h18"/><path d="m8 14 4-4 3 3 6-7"/><path d="M17 6h4v4"/></>,
    export: <><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 13v7h14v-7"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export default function BottomSheet({ vehicles, height, onHeightChange }: Props) {
  const { t, isRTL } = useLanguage()
  const [view, setView] = useState<View>('status')
  const [page, setPage] = useState(1)
  const [reportOpen, setReportOpen] = useState(false)
  const dragStart = useRef<{ y: number; height: number } | null>(null)
  const moved = useRef(false)
  const startedOnDock = useRef(false)
  const quality = (v: Vehicle) => v.telemetry.gpsState === 'offline' || v.telemetry.gpsState === 'not_installed' ? '—' : v.telemetry.satellites >= 8 ? t('fleet_quality_good') : t('fleet_quality_fair')
  const signal = (v: Vehicle) => v.telemetry.gpsState === 'online' ? t('gps_online') : v.telemetry.gpsState === 'weak' ? t('gps_weak') : v.telemetry.gpsState === 'offline' ? t('status_offline') : t('telemetry_not_installed')
  const rawRows = useMemo(() => vehicles.flatMap(v => [
    { time: v.lastUpdate, vehicle: v.plate, point: t('fleet_latitude'), value: v.lat.toFixed(5), unit: '°' },
    { time: v.lastUpdate, vehicle: v.plate, point: t('fleet_longitude'), value: v.lng.toFixed(5), unit: '°' },
    { time: v.lastUpdate, vehicle: v.plate, point: t('lbl_speed'), value: String(v.speed), unit: 'km/h' },
    { time: v.lastUpdate, vehicle: v.plate, point: t('fleet_satellites'), value: String(v.telemetry.satellites), unit: '' },
    { time: v.lastUpdate, vehicle: v.plate, point: t('lbl_odometer'), value: v.odometer.toLocaleString(), unit: 'km' },
    { time: v.lastUpdate, vehicle: v.plate, point: t('fleet_battery'), value: v.telemetry.batteryVoltage?.toFixed(1) ?? '—', unit: 'V' },
  ]), [vehicles, t])
  const rows = view === 'status' ? vehicles : rawRows
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const moving = vehicles.filter(v => v.status === 'moving').length
  const idle = vehicles.filter(v => v.status === 'idle').length
  const offline = vehicles.filter(v => v.status === 'offline').length

  const startDrag = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const captureTarget = e.currentTarget.closest('[data-fleet-data-root]') as HTMLElement | null
    ;(captureTarget ?? e.currentTarget).setPointerCapture(e.pointerId)
    startedOnDock.current = (e.target as Element).closest('[data-fleet-open]') !== null
    dragStart.current = { y: e.clientY, height }
    moved.current = false
  }, [height])
  const moveDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return
    const delta = dragStart.current.y - e.clientY
    if (Math.abs(delta) > 4) moved.current = true
    if (dragStart.current.height === 0) {
      const max = Math.floor(window.innerHeight * 0.86)
      onHeightChange(Math.max(0, Math.min(max, delta)))
      return
    }
    const max = Math.floor(window.innerHeight * 0.86)
    onHeightChange(Math.max(MIN_HEIGHT, Math.min(max, dragStart.current.height + delta)))
  }, [onHeightChange])
  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current) {
      const delta = dragStart.current.y - e.clientY
      const requested = dragStart.current.height + delta
      if (dragStart.current.height === 0 && Math.abs(delta) > 4) {
        onHeightChange(delta > 4 ? Math.max(MIN_HEIGHT, Math.min(Math.floor(window.innerHeight * 0.86), delta)) : 0)
      } else if (requested < MIN_HEIGHT) onHeightChange(0)
    }
    dragStart.current = null
  }, [onHeightChange])
  const cancelDrag = useCallback(() => { dragStart.current = null }, [])
  const toggle = () => {
    if (moved.current) { moved.current = false; return }
    onHeightChange(height === 0 ? Math.round(window.innerHeight * 0.48) : 0)
  }
  const exportCsv = () => {
    const header = view === 'status'
      ? [t('lbl_status'), t('lbl_plate'), 'Q', t('fleet_device_type'), t('device_model'), t('lbl_last_update'), t('fleet_site'), t('fleet_satellites'), 'IG', t('fleet_device_signal')]
      : [t('fleet_time'), t('lbl_plate'), t('fleet_data_point'), t('fleet_value'), t('fleet_unit')]
    const data = view === 'status'
      ? vehicles.map(v => [t(`status_${v.status}` as 'status_moving'), v.plate, quality(v), t(`type_${v.vehicleType}` as 'type_truck'), 'Queclink GV300', v.lastUpdate, v.location, v.telemetry.satellites, v.status === 'offline' ? '—' : 'ON', signal(v)])
      : rawRows.map(r => [r.time, r.vehicle, r.point, r.value, r.unit])
    const csv = [header, ...data].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = view === 'status' ? 'fleet-status.csv' : 'gps-raw-data.csv'; link.click(); URL.revokeObjectURL(url)
  }

  const th: React.CSSProperties = { padding: '11px 14px', textAlign: isRTL ? 'right' : 'left', color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.045em', borderBottom: '1px solid var(--border)' }
  const td: React.CSSProperties = { padding: '12px 14px', color: 'var(--foreground)', fontSize: 12.5, whiteSpace: 'nowrap', borderBottom: '1px solid color-mix(in srgb, var(--border) 68%, transparent)' }
  const card: React.CSSProperties = { border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', borderRadius: 9 }

  return (
    <div data-fleet-data-root="" onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={cancelDrag} onClick={() => {
      if (!startedOnDock.current) return
      startedOnDock.current = false
      if (moved.current) { moved.current = false; return }
      onHeightChange(height === 0 ? Math.round(window.innerHeight * 0.48) : 0)
    }} style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none' }}>
      {height === 0 ? <button data-fleet-open="" onPointerDown={startDrag} aria-label={t('fleet_open_data')} title={t('fleet_open_data')} style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 50, width: 64, height: 34, border: '1px solid var(--border)', borderBottom: 0, borderRadius: '64px 64px 0 0', background: 'color-mix(in srgb, var(--card) 96%, transparent)', backdropFilter: 'blur(18px)', boxShadow: '0 -4px 20px rgba(20,35,60,.14)', color: 'var(--primary)', cursor: 'ns-resize', display: 'flex', justifyContent: 'center', alignItems: 'center', touchAction: 'none', pointerEvents: 'auto' }}><Icon name="up" size={18} /></button> : (
        <section style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height, minHeight: dragStart.current ? 0 : MIN_HEIGHT, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'color-mix(in srgb, var(--card) 97%, transparent)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderBottom: 0, borderRadius: '15px 15px 0 0', boxShadow: '0 -8px 30px rgba(20,35,60,.16)', overflow: 'hidden', transition: dragStart.current ? 'none' : 'height .18s ease', pointerEvents: 'auto' }}>
          <div onPointerDown={startDrag} style={{ height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'ns-resize', touchAction: 'none' }}><div style={{ width: 42, height: 4, borderRadius: 9, background: 'var(--muted-foreground)', opacity: .45 }} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', minHeight: 46, flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
            {(['status', 'raw'] as View[]).map(id => <button key={id} onClick={() => { setView(id); setPage(1); setReportOpen(false) }} style={{ height: 46, padding: '0 14px', border: 0, borderBottom: view === id ? '2px solid var(--primary)' : '2px solid transparent', background: 'transparent', color: view === id ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: 13, fontWeight: view === id ? 700 : 600, cursor: 'pointer' }}>{id === 'status' ? t('fleet_status_tab') : t('fleet_raw_tab')}</button>)}
            <div style={{ flex: 1 }} />
            <button onClick={() => setReportOpen(value => !value)} style={{ ...card, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 650 }}><Icon name="report" />{t('view_report')}</button>
            <button onClick={exportCsv} style={{ ...card, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 650 }}><Icon name="export" />{t('fleet_export')}</button>
            <button onClick={() => onHeightChange(0)} aria-label={t('ctrl_collapse')} style={{ ...card, width: 34, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer', marginLeft: 4 }}><Icon name="down" /></button>
          </div>
          {reportOpen && <div style={{ position: 'absolute', top: 56, insetInlineEnd: 170, zIndex: 2, ...card, boxShadow: '0 8px 24px rgba(20,35,60,.14)', padding: 14, minWidth: 210, fontSize: 12 }}><strong style={{ display: 'block', marginBottom: 8 }}>{t('fleet_report_summary')}</strong><div>{t('status_moving')}: {moving}</div><div>{t('status_idle')}: {idle}</div><div>{t('status_offline')}: {offline}</div><div>{t('fleet_total_vehicles')}: {vehicles.length}</div></div>}
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', minWidth: view === 'status' ? 1120 : 740, borderCollapse: 'collapse' }}>
              <thead><tr>{view === 'status' ? [t('lbl_status'), t('lbl_plate'), 'Q', t('fleet_device_type'), t('device_model'), t('lbl_last_update'), t('fleet_site'), t('fleet_satellites'), 'IG', t('fleet_device_signal')].map((label, i) => <th key={i} style={th}>{label}</th>) : [t('fleet_time'), t('lbl_plate'), t('fleet_data_point'), t('fleet_value'), t('fleet_unit')].map((label, i) => <th key={i} style={th}>{label}</th>)}</tr></thead>
              <tbody>{pageRows.map((row, i) => view === 'status' ? <tr key={(row as Vehicle).id} style={{ background: i % 2 ? 'color-mix(in srgb, var(--secondary) 42%, transparent)' : 'transparent' }}>
                {(() => { const v = row as Vehicle; const dot = v.status === 'moving' ? '#16a765' : v.status === 'idle' ? '#d58a18' : '#e04f55'; return <><td style={td}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><i style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />{t(`status_${v.status}` as 'status_moving')}</span></td><td style={{ ...td, fontWeight: 700 }}>{v.plate}</td><td style={td}>{quality(v)}</td><td style={td}>{t(`type_${v.vehicleType}` as 'type_truck')}</td><td style={td}>Queclink GV300</td><td style={td}>{v.lastUpdate}</td><td style={{ ...td, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.location}</td><td style={td}>{v.telemetry.satellites}</td><td style={td}>{v.status === 'offline' ? '—' : 'ON'}</td><td style={td}>{signal(v)}</td></> })()}
              </tr> : (() => { const r = row as typeof rawRows[number]; return <tr key={`${r.vehicle}-${r.point}`} style={{ background: i % 2 ? 'color-mix(in srgb, var(--secondary) 42%, transparent)' : 'transparent' }}><td style={td}>{r.time}</td><td style={{ ...td, fontWeight: 700 }}>{r.vehicle}</td><td style={td}>{r.point}</td><td style={td}>{r.value}</td><td style={td}>{r.unit}</td></tr> })())}</tbody>
            </table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', minHeight: 48, flexShrink: 0, borderTop: '1px solid var(--border)', fontSize: 11.5, color: 'var(--muted-foreground)' }}><span>{t('fleet_page')} {page} {t('fleet_of')} {pageCount} · {rows.length} {t('fleet_records')}</span><div style={{ display: 'flex', gap: 6 }}><button disabled={page <= 1} onClick={() => setPage(v => Math.max(1, v - 1))} style={{ ...card, padding: '6px 10px', cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? .45 : 1 }}>{t('fleet_previous')}</button><button disabled={page >= pageCount} onClick={() => setPage(v => Math.min(pageCount, v + 1))} style={{ ...card, padding: '6px 10px', cursor: page >= pageCount ? 'default' : 'pointer', opacity: page >= pageCount ? .45 : 1 }}>{t('fleet_next')}</button></div></div>
        </section>
      )}
    </div>
  )
}
