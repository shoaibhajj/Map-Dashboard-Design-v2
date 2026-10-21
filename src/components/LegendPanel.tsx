import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { ColorPickerField } from './ColorPicker'
import FuelLevelGauge from './ui/FuelLevelGauge'
import MetricRangeGauge from './ui/MetricRangeGauge'
import { RangeSlider } from './ui/be-ui-range-slider'
import type { Vehicle, VehicleStatus } from '../data/vehicles'
import {
  getMetricOptions,
  getVehicleMetric,
  getDefaultMetricRanges,
  getDefaultFuelRanges,
  applyAutomaticRangeColors,
  FUEL_RANGE_COLOR_PALETTE,
  getMetricRangePalette,
  normalizeFuelRanges,
  DEFAULT_FUEL_TANK_CAPACITY_LITERS,
  DEFAULT_MAP_LEGEND,
  type MapColorRange,
  type MapLegendConfig,
  type FuelUnit,
} from '../utils/mapLegend'

interface Props {
  config: MapLegendConfig
  vehicles: Vehicle[]
  onChange: (config: MapLegendConfig) => void
  onClose: () => void
}

const STATUS_KEYS: VehicleStatus[] = ['moving', 'idle', 'offline']

function EditableBoundary({ value, suffix, label, limits, step, onCommit }: {
  value: number
  suffix: string
  label: string
  limits: [number, number]
  step: number
  onCommit: (value: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  useEffect(() => { if (!editing) setDraft(String(value)) }, [editing, value])
  const commit = () => {
    const parsed = Number(draft)
    if (Number.isFinite(parsed)) {
      const snapped = Math.round(parsed / step) * step
      onCommit(Math.min(limits[1], Math.max(limits[0], snapped)))
    }
    setEditing(false)
  }
  if (editing) return <span className="legend-inline-boundary-wrap"><input
    autoFocus type="number" min={limits[0]} max={limits[1]} step={step} value={draft}
    aria-label={label} className="legend-inline-boundary-input"
    onChange={event => setDraft(event.target.value)} onBlur={commit}
    onFocus={event => event.currentTarget.select()}
    onKeyDown={event => {
      if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() }
      if (event.key === 'Escape') { setDraft(String(value)); setEditing(false) }
    }}
  /><small>{suffix}</small></span>
  return <button type="button" className="legend-inline-boundary" title={label} aria-label={`${label}: ${value} ${suffix}. Click to edit`} onClick={() => { setDraft(String(value)); setEditing(true) }}>{value}<small>{suffix}</small></button>
}

export default function LegendPanel({ config, vehicles, onChange, onClose }: Props) {
  const { t, isRTL } = useLanguage()
  const [rangeEditorOpen, setRangeEditorOpen] = useState(false)
  const [rangeEditorPlacement, setRangeEditorPlacement] = useState<'left' | 'right' | 'below'>('left')
  const layoutRef = useRef<HTMLDivElement>(null)
  const [capacityDraft, setCapacityDraft] = useState(String(config.fuelTankCapacityLiters))
  const [metricScaleMaxDraft, setMetricScaleMaxDraft] = useState('')
  const [metricScaleMinDraft, setMetricScaleMinDraft] = useState('')
  useEffect(() => setCapacityDraft(String(config.fuelTankCapacityLiters)), [config.fuelTankCapacityLiters])
  const options = getMetricOptions(vehicles)
  const activeMetric = options.find(option => option.key === config.metricKey) ?? options[0]
  const isFuel = config.metricKey === 'fuelLevel'
  const showRangeEditor = config.mode === 'metric' && rangeEditorOpen
  const metricLabel = (key: string, fallback: string) => {
    const labels: Record<string, string> = {
      speed: t('lbl_speed'), fuelLevel: t('map_metric_fuel'), batteryPercent: t('map_metric_battery_percent'),
      batteryVoltage: t('map_metric_battery_voltage'), satellites: t('map_metric_satellites'),
      refrigerator_temperature: t('map_metric_refrigerator_temperature'), odometer: t('lbl_odometer'),
      actualWeightTons: t('map_metric_actual_weight'), weightLimitTons: t('map_metric_weight_limit'),
    }
    return labels[key] ?? fallback
  }
  const unitText = (unit: FuelUnit) => unit === 'percent' ? '%' : t('map_liter_short')
  const activeUnit = isFuel ? unitText(config.fuelUnit) : activeMetric?.unit ?? ''
  const metricSeedRanges = config.metricRangesByKey[config.metricKey] ?? config.ranges
  const scaleMax = isFuel
    ? (config.fuelUnit === 'percent' ? 100 : config.fuelTankCapacityLiters)
    : config.metricScaleMaxByKey[config.metricKey] ?? Math.max(activeMetric?.max ?? 100, ...metricSeedRanges.map(range => range.max))
  const scaleMin = isFuel
    ? 0
    : config.metricScaleMinByKey[config.metricKey] ?? Math.min(activeMetric?.min ?? 0, ...metricSeedRanges.map(range => range.min))
  useEffect(() => {
    setMetricScaleMaxDraft(String(scaleMax))
    setMetricScaleMinDraft(String(scaleMin))
  }, [config.metricKey, scaleMax, scaleMin])
  const inputStyle: React.CSSProperties = {
    minWidth: 0, height: 34, border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--background)', color: 'var(--foreground)', padding: '0 9px', font: 'inherit', fontSize: 12,
  }
  const smallButton: React.CSSProperties = {
    height: 31, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)',
    color: 'var(--foreground)', padding: '0 10px', cursor: 'pointer', fontSize: 11, fontWeight: 650, whiteSpace: 'nowrap',
  }
  const updateRanges = (ranges: MapColorRange[]) => onChange({
    ...config,
    ranges,
    ...(isFuel ? { fuelRangesByUnit: { ...config.fuelRangesByUnit, [config.fuelUnit]: ranges } } : {}),
    ...(!isFuel ? { metricRangesByKey: { ...config.metricRangesByKey, [config.metricKey]: ranges } } : {}),
  })
  const currentRanges = isFuel
    ? normalizeFuelRanges(config.ranges, scaleMax)
    : config.metricRangesByKey[config.metricKey] ?? config.ranges
  const getFuelBoundaryPreview = (value: number) => {
    const snappedValue = Math.max(0, Math.min(scaleMax, Math.round(value)))
    if (currentRanges.length === 0) {
      return { kind: 'first' as const, min: 0, max: Math.max(1, snappedValue), color: FUEL_RANGE_COLOR_PALETTE[0] }
    }
    const existingBoundary = currentRanges.some(range => Math.abs(range.min - snappedValue) < 1 || Math.abs(range.max - snappedValue) < 1)
    if (existingBoundary) {
      const existing = currentRanges.find(range => Math.abs(range.max - snappedValue) < 1) ?? currentRanges.find(range => Math.abs(range.min - snappedValue) < 1)
      return existing ? { kind: 'existing' as const, min: existing.min, max: existing.max, color: existing.color } : null
    }

    const targetIndex = currentRanges.findIndex(range => snappedValue > range.min && snappedValue < range.max)
    const target = currentRanges[targetIndex]
    if (target) {
      if (snappedValue - target.min < 1 || target.max - snappedValue < 1) return null
      const colorIndex = (targetIndex + 1) % FUEL_RANGE_COLOR_PALETTE.length
      return { kind: 'split' as const, min: snappedValue, max: target.max, color: FUEL_RANGE_COLOR_PALETTE[colorIndex] }
    }

    const previous = [...currentRanges].reverse().find(range => range.max < snappedValue)
    const next = currentRanges.find(range => range.min > snappedValue)
    const min = previous?.max ?? 0
    if (snappedValue - min < 1 || (next && snappedValue > next.min)) return null
    const colorIndex = currentRanges.filter(range => range.min < snappedValue).length % FUEL_RANGE_COLOR_PALETTE.length
    return { kind: 'extend' as const, min, max: snappedValue, color: FUEL_RANGE_COLOR_PALETTE[colorIndex] }
  }
  const addFuelBoundary = (value: number) => {
    setRangeEditorOpen(true)
    const preview = getFuelBoundaryPreview(value)
    if (!preview || preview.kind === 'existing') return
    const id = `fuel-range-${Date.now()}`
    if (preview.kind === 'first') {
      updateRanges([{ id, min: preview.min, max: preview.max, color: preview.color, colorMode: 'auto' }])
      return
    }
    const targetIndex = currentRanges.findIndex(range => preview.kind === 'split' && preview.min > range.min && preview.min < range.max)
    const nextRanges = preview.kind === 'split' && targetIndex >= 0
      ? currentRanges.flatMap((range, index) => index === targetIndex
          ? [
              { ...range, max: preview.min, colorMode: range.colorMode ?? 'custom' },
              { ...range, id, min: preview.min, color: preview.color, colorMode: 'auto' as const },
            ]
          : [range])
      : [...currentRanges, { id, min: preview.min, max: preview.max, color: preview.color, colorMode: 'auto' as const }].sort((a, b) => a.min - b.min)
    updateRanges(applyAutomaticRangeColors(nextRanges))
  }
  const getMetricBoundaryPreview = (value: number) => {
    const step = activeMetric?.step ?? 1
    const snappedValue = Math.max(scaleMin, Math.min(scaleMax, Math.round(value / step) * step))
    const palette = getMetricRangePalette(config.metricKey)
    if (currentRanges.length === 0) {
      return { kind: 'first' as const, min: scaleMin, max: Math.min(scaleMax, Math.max(scaleMin + step, snappedValue)), color: palette[0] }
    }
    const existing = currentRanges.find(range => Math.abs(range.max - snappedValue) < step / 2)
      ?? currentRanges.find(range => Math.abs(range.min - snappedValue) < step / 2)
    if (existing) return { kind: 'existing' as const, min: existing.min, max: existing.max, color: existing.color }
    const targetIndex = currentRanges.findIndex(range => snappedValue > range.min && snappedValue < range.max)
    const target = currentRanges[targetIndex]
    if (target) {
      if (snappedValue - target.min < step || target.max - snappedValue < step) return null
      return { kind: 'split' as const, min: snappedValue, max: target.max, color: palette[(targetIndex + 1) % palette.length] }
    }
    const previous = [...currentRanges].reverse().find(range => range.max < snappedValue)
    const next = currentRanges.find(range => range.min > snappedValue)
    const min = previous?.max ?? scaleMin
    if (snappedValue - min < step || (next && snappedValue > next.min)) return null
    const colorIndex = currentRanges.filter(range => range.min < snappedValue).length % palette.length
    return { kind: 'extend' as const, min, max: snappedValue, color: palette[colorIndex] }
  }
  const addMetricBoundary = (value: number) => {
    setRangeEditorOpen(true)
    const preview = getMetricBoundaryPreview(value)
    if (!preview || preview.kind === 'existing') return
    const id = `${config.metricKey}-range-${Date.now()}`
    if (preview.kind === 'first') {
      updateRanges([{ id, min: preview.min, max: preview.max, color: preview.color, colorMode: 'auto' }])
      return
    }
    const targetIndex = currentRanges.findIndex(range => preview.kind === 'split' && preview.min > range.min && preview.min < range.max)
    const nextRanges = preview.kind === 'split' && targetIndex >= 0
      ? currentRanges.flatMap((range, index) => index === targetIndex
          ? [
              { ...range, max: preview.min },
              { ...range, id, min: preview.min, color: preview.color, colorMode: 'auto' as const },
            ]
          : [range])
      : [...currentRanges, { id, min: preview.min, max: preview.max, color: preview.color, colorMode: 'auto' as const }].sort((a, b) => a.min - b.min)
    updateRanges(applyAutomaticRangeColors(nextRanges, getMetricRangePalette(config.metricKey)))
  }
  const moveFuelBoundary = (boundaryIndex: number, value: number) => {
    const left = currentRanges[boundaryIndex]
    const right = currentRanges[boundaryIndex + 1]
    if (!left) return
    const minimum = left.min + 1
    const maximum = right ? right.max - 1 : scaleMax
    if (minimum > maximum) return
    const boundary = Math.max(minimum, Math.min(maximum, Math.round(value)))
    updateRanges(currentRanges.map((range, index) => index === boundaryIndex
      ? { ...range, max: boundary }
      : right && index === boundaryIndex + 1
        ? { ...range, min: boundary }
        : range))
  }
  const moveMetricBoundary = (boundaryIndex: number, value: number) => {
    setRangeEditorOpen(true)
    const step = activeMetric?.step ?? 1
    const left = currentRanges[boundaryIndex]
    const right = currentRanges[boundaryIndex + 1]
    if (!left) return
    const minimum = left.min + step
    const maximum = right ? right.max - step : scaleMax
    if (minimum > maximum) return
    const boundary = Math.max(minimum, Math.min(maximum, Math.round(value / step) * step))
    updateRanges(currentRanges.map((range, index) => index === boundaryIndex
      ? { ...range, max: boundary }
      : right && index === boundaryIndex + 1
        ? { ...range, min: boundary }
        : range))
  }
  const fuelRangeLimits = (index: number) => ({
    min: currentRanges[index - 1]?.max ?? scaleMin,
    max: currentRanges[index + 1]?.min ?? scaleMax,
  })
  const updateRange = (id: string, patch: Partial<MapColorRange>) => {
    const index = currentRanges.findIndex(range => range.id === id)
    if (index < 0) return
    const range = currentRanges[index]
    const limits = fuelRangeLimits(index)
    const step = isFuel ? 1 : activeMetric?.step ?? 1
    const min = patch.min === undefined
      ? range.min
      : Math.max(limits.min, Math.min(Math.min(range.max - step, limits.max - step), patch.min))
    const max = patch.max === undefined
      ? range.max
      : Math.max(min + step, Math.min(limits.max, patch.max))
    updateRanges(currentRanges.map(item => item.id === id
      ? { ...item, ...patch, min, max, ...(patch.color !== undefined ? { colorMode: 'custom' as const } : {}) }
      : item))
  }
  const addRange = () => {
    setRangeEditorOpen(true)
    const step = isFuel ? 1 : activeMetric?.step ?? 1
    if (currentRanges.length === 0) {
      const max = Math.min(scaleMax, Math.max(scaleMin + step, scaleMin + Math.round((scaleMax - scaleMin) * 0.3 / step) * step))
      const palette = isFuel ? FUEL_RANGE_COLOR_PALETTE : getMetricRangePalette(config.metricKey)
      updateRanges([{ id: `${config.metricKey}-range-${Date.now()}`, min: scaleMin, max, color: palette[0], colorMode: 'auto' }])
      return
    }
    const targetIndex = currentRanges.reduce((bestIndex, range, index, list) => range.max - range.min > list[bestIndex].max - list[bestIndex].min ? index : bestIndex, 0)
    const target = currentRanges[targetIndex]
    if (!target || target.max - target.min < step * 2) return
    const splitAt = Math.min(target.max - step, Math.max(target.min + step, Math.round((target.min + target.max) / 2 / step) * step))
    const firstHalf = { ...target, max: splitAt }
    const secondHalf = { ...target, id: `range-${Date.now()}`, min: splitAt, colorMode: 'auto' as const }
    updateRanges(applyAutomaticRangeColors(currentRanges.flatMap((range, index) => index === targetIndex ? [firstHalf, secondHalf] : [range]), isFuel ? FUEL_RANGE_COLOR_PALETTE : getMetricRangePalette(config.metricKey)))
  }
  const removeRange = (id: string) => updateRanges(applyAutomaticRangeColors(currentRanges.filter(range => range.id !== id), isFuel ? FUEL_RANGE_COLOR_PALETTE : getMetricRangePalette(config.metricKey)))
  const setFuelUnit = (fuelUnit: FuelUnit) => {
    const currentFuelRanges = isFuel ? config.ranges : config.fuelRangesByUnit[config.fuelUnit]
    onChange({
      ...config,
      fuelUnit,
      ...(isFuel ? { fuelRangesByUnit: { ...config.fuelRangesByUnit, [config.fuelUnit]: currentFuelRanges, [fuelUnit]: config.fuelRangesByUnit[fuelUnit] }, ranges: config.fuelRangesByUnit[fuelUnit] } : {}),
    })
  }
  const setCapacity = (capacity: number) => {
    const nextCapacity = Math.max(1, capacity || 1)
    const previousCapacity = config.fuelTankCapacityLiters || DEFAULT_FUEL_TANK_CAPACITY_LITERS
    const scale = nextCapacity / previousCapacity
    const literRanges = config.fuelRangesByUnit.liter.map(range => ({ ...range, min: range.min * scale, max: range.max * scale }))
    onChange({
      ...config,
      fuelTankCapacityLiters: nextCapacity,
      fuelRangesByUnit: { ...config.fuelRangesByUnit, liter: literRanges },
      ...(isFuel && config.fuelUnit === 'liter' ? { ranges: literRanges } : {}),
    })
  }
  const setMetricScaleMaximum = (maximum: number) => {
    if (!activeMetric || !Number.isFinite(maximum)) return
    const step = activeMetric.step || 1
    const nextMaximum = Math.max(scaleMin + step, Math.round(maximum / step) * step)
    let cursor = scaleMin
    const nextRanges = [...currentRanges].sort((a, b) => a.min - b.min).flatMap(range => {
      const min = Math.max(cursor, range.min)
      const max = Math.min(nextMaximum, range.max)
      if (max - min < step) return []
      cursor = max
      return [{ ...range, min, max }]
    })
    onChange({
      ...config,
      ranges: nextRanges,
      metricRangesByKey: { ...config.metricRangesByKey, [config.metricKey]: nextRanges },
      metricScaleMaxByKey: { ...config.metricScaleMaxByKey, [config.metricKey]: nextMaximum },
    })
  }
  const setMetricScaleMinimum = (minimum: number) => {
    if (!activeMetric || !Number.isFinite(minimum)) return
    const step = activeMetric.step || 1
    const nextMinimum = Math.min(scaleMax - step, Math.round(minimum / step) * step)
    let cursor = nextMinimum
    const nextRanges = [...currentRanges].sort((a, b) => a.min - b.min).flatMap(range => {
      const min = Math.max(cursor, range.min)
      const max = range.max
      if (max - min < step) return []
      cursor = max
      return [{ ...range, min, max }]
    })
    onChange({
      ...config,
      ranges: nextRanges,
      metricRangesByKey: { ...config.metricRangesByKey, [config.metricKey]: nextRanges },
      metricScaleMinByKey: { ...config.metricScaleMinByKey, [config.metricKey]: nextMinimum },
    })
  }

  const orderedRanges = useMemo(() => [...currentRanges].sort((a, b) => a.min - b.min), [currentRanges])
  const canAddRange = !isFuel || currentRanges.length === 0 || currentRanges.some(range => range.max - range.min >= 2)
  const isInRange = (value: number, index: number) => {
    const range = orderedRanges[index]
    return value >= range.min && (value < range.max || (index === orderedRanges.length - 1 && value <= range.max))
  }
  const demoCounts = orderedRanges.map((range, index) => ({
    range,
    count: vehicles.filter(vehicle => {
      const value = getVehicleMetric(vehicle, config.metricKey, config.fuelUnit, config.fuelTankCapacityLiters)
      return value !== null && isInRange(value, index)
    }).length,
  }))
  const noDataCount = vehicles.filter(vehicle => {
    const value = getVehicleMetric(vehicle, config.metricKey, config.fuelUnit, config.fuelTankCapacityLiters)
    return value === null || !orderedRanges.some((range, index) => isInRange(value, index))
  }).length
  useLayoutEffect(() => {
    if (!showRangeEditor) return
    const updatePlacement = () => {
      const bounds = layoutRef.current?.getBoundingClientRect()
      if (!bounds) return
      const cardWidth = Math.min(370, window.innerWidth - 24)
      const gap = 10
      const roomOnLeft = bounds.left
      const roomOnRight = window.innerWidth - bounds.right
      if (roomOnLeft >= cardWidth + gap) setRangeEditorPlacement('left')
      else if (roomOnRight >= cardWidth + gap) setRangeEditorPlacement('right')
      else setRangeEditorPlacement('below')
    }
    updatePlacement()
    window.addEventListener('resize', updatePlacement)
    return () => window.removeEventListener('resize', updatePlacement)
  }, [showRangeEditor])
  const rangeEditor = <>
    <div className="fuel-ranges-heading">
      <strong>{t('map_threshold_ranges')}</strong>
      <button type="button" onClick={() => updateRanges(isFuel ? applyAutomaticRangeColors(getDefaultFuelRanges(config.fuelUnit, config.fuelTankCapacityLiters)) : getDefaultMetricRanges(activeMetric))} style={smallButton}>{t('map_recommended_ranges')}</button>
      <button type="button" onClick={() => setRangeEditorOpen(false)} aria-label={t('ctrl_close')} title={t('ctrl_close')} style={{ ...smallButton, width: 31, padding: 0 }}>×</button>
    </div>
    <div className="fuel-ranges-list">
      {currentRanges.map((range, index) => {
        const limits = fuelRangeLimits(index)
        return <div key={range.id} className="legend-range-row">
        <ColorPickerField value={range.color} label={`${t('map_range_color')} ${index + 1}`} onChange={color => updateRange(range.id, { color })}/>
        <div className="legend-range-control">
          <div className="legend-range-boundaries">
            <EditableBoundary value={range.min} suffix={activeUnit} label={t('map_minimum')} limits={[limits.min, Math.min(range.max - (isFuel ? 1 : activeMetric?.step ?? 1), limits.max - (isFuel ? 1 : activeMetric?.step ?? 1))]} step={isFuel ? 1 : activeMetric?.step ?? 1} onCommit={min => updateRange(range.id, { min })}/>
            <EditableBoundary value={range.max} suffix={activeUnit} label={t('map_maximum')} limits={[range.min + (isFuel ? 1 : activeMetric?.step ?? 1), limits.max]} step={isFuel ? 1 : activeMetric?.step ?? 1} onCommit={max => updateRange(range.id, { max })}/>
          </div>
          <RangeSlider value={[range.min, range.max]} min={limits.min} max={limits.max} step={isFuel ? 1 : activeMetric?.step ?? 1} labels={[`${t('map_minimum')} ${activeUnit}`, `${t('map_maximum')} ${activeUnit}`]} onValueChange={([min, max]) => updateRange(range.id, { min, max })}/>
        </div>
        <button type="button" onClick={() => removeRange(range.id)} aria-label={t('map_remove_range')} title={t('map_remove_range')} style={{ ...smallButton, width: 30, padding: 0, color: '#ef4444' }}>×</button>
      </div>
      })}
    </div>
    <button type="button" onClick={addRange} disabled={!canAddRange} style={{ ...smallButton, width: '100%', borderStyle: 'dashed', color: canAddRange ? 'var(--primary)' : 'var(--muted-foreground)', opacity: canAddRange ? 1 : .55, cursor: canAddRange ? 'pointer' : 'not-allowed' }}>+ {t('map_add_range')}</button>
    <div className="fuel-range-summary">
      {demoCounts.map(({ range, count }) => <div key={range.id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: range.color, boxShadow: `0 0 6px ${range.color}77` }}/><span>{range.min} – {range.max}{activeUnit ? ` ${activeUnit}` : ''}</span><span style={{ marginInlineStart: 'auto', color: 'var(--muted-foreground)' }}>{count} {t('map_demo_vehicles')}</span>
      </div>)}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: config.noDataColor }}/><span>{t('map_no_reading')}</span><span style={{ marginInlineStart: 'auto', color: 'var(--muted-foreground)' }}>{noDataCount} {t('map_demo_vehicles')}</span></div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 650 }}>
      <ColorPickerField value={config.noDataColor} label={t('map_no_reading')} onChange={color => onChange({ ...config, noDataColor: color })}/>{t('map_no_data_color')}
    </div>
  </>

  return (
    <div ref={layoutRef} className="legend-popover-layout" dir={isRTL ? 'rtl' : 'ltr'} onClick={event => event.stopPropagation()}>
    <section aria-label={t('legend_title')} style={{
      width: '100%', maxHeight: 'min(100vh, 690px)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      color: 'var(--foreground)', background: 'color-mix(in srgb, var(--card) 97%, transparent)', backdropFilter: 'blur(20px)',
      border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 14px 40px rgba(15, 23, 42, .2)',
    }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', color: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 10%, var(--secondary))', borderRadius: 9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><path d="M11 6h10M11 12h10M11 18h10"/></svg>
        </span>
        <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 2 }}>
          <strong style={{ fontSize: 14, fontWeight: 800 }}>{t('legend_title')}</strong>
          <small style={{ color: 'var(--muted-foreground)', fontSize: 10.5 }}>{t('map_legend_subtitle')}</small>
        </div>
        <button type="button" onClick={onClose} aria-label={t('ctrl_close')} title={t('ctrl_close')} style={{ ...smallButton, width: 32, padding: 0, display: 'grid', placeItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </header>

      <div style={{ padding: 13, display: 'grid', gap: 12, overflowY: 'auto' }}>
        <label style={{ display: 'grid', gap: 5, fontSize: 11, fontWeight: 700 }}>
          {t('map_color_by')}
          <select value={config.mode} onChange={event => {
            const mode = event.target.value as MapLegendConfig['mode']
            const metric = options.find(option => option.key === config.metricKey) ?? options[0]
            const nextRanges = metric.key === 'fuelLevel'
              ? config.fuelRangesByUnit[config.fuelUnit]
              : config.metricRangesByKey[metric.key] ?? (metric.key === config.metricKey ? config.ranges : [])
            onChange({ ...config, mode, ranges: mode === 'metric' ? nextRanges : config.ranges, ...(!isFuel && mode === 'metric' ? { metricRangesByKey: { ...config.metricRangesByKey, [metric.key]: nextRanges } } : {}) })
          }} style={inputStyle}>
            <option value="status">{t('map_color_status')}</option><option value="metric">{t('map_color_metric')}</option>
          </select>
        </label>

        {config.mode === 'status' ? (
          <div style={{ display: 'grid', gap: 7 }}>
            <div style={{ fontSize: 11, fontWeight: 750 }}>{t('map_status_colors')}</div>
            {STATUS_KEYS.map(status => <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px', background: 'var(--secondary)', borderRadius: 8 }}>
              <ColorPickerField value={config.statusColors[status]} label={`${t(`status_${status}`)} · ${t('map_range_color')}`} onChange={color => onChange({ ...config, statusColors: { ...config.statusColors, [status]: color } })}/>
              <span style={{ fontSize: 12, fontWeight: 650 }}>{t(`status_${status}`)}</span>
              <span style={{ marginInlineStart: 'auto', width: 9, height: 9, borderRadius: '50%', background: config.statusColors[status], boxShadow: `0 0 7px ${config.statusColors[status]}88` }}/>
            </div>)}
          </div>
        ) : <>
          <label style={{ display: 'grid', gap: 5, fontSize: 11, fontWeight: 700 }}>
            {t('map_sensor_or_value')}
            <select value={config.metricKey} onChange={event => {
              const next = options.find(option => option.key === event.target.value) ?? options[0]
              const nextRanges = next.key === 'fuelLevel'
                ? config.fuelRangesByUnit[config.fuelUnit]
                : config.metricRangesByKey[next.key] ?? []
              onChange({
                ...config,
                metricKey: next.key,
                ranges: nextRanges,
                metricRangesByKey: {
                  ...config.metricRangesByKey,
                  ...(!isFuel ? { [config.metricKey]: currentRanges } : {}),
                  ...(next.key !== 'fuelLevel' ? { [next.key]: nextRanges } : {}),
                },
              })
              setRangeEditorOpen(false)
            }} style={inputStyle}>
              {(['vehicle', 'gps', 'sensor'] as const).map(source => <optgroup key={source} label={t(`map_source_${source}`)}>
                {options.filter(option => option.source === source).map(option => <option key={option.key} value={option.key}>{metricLabel(option.key, option.label)}{option.unit ? ` (${option.key === 'fuelLevel' ? unitText(config.fuelUnit) : option.unit})` : ''}</option>)}
              </optgroup>)}
            </select>
          </label>

          {isFuel && <>
            <label style={{ display: 'grid', gap: 5, fontSize: 11, fontWeight: 700 }}>
              {t('map_fuel_unit')}
              <select value={config.fuelUnit} onChange={event => setFuelUnit(event.target.value as FuelUnit)} style={inputStyle}>
                <option value="percent">{t('map_percent_unit')}</option><option value="liter">{t('map_liter_unit')}</option>
              </select>
            </label>
            {config.fuelUnit === 'liter' && <>
              <div role="note" className="fuel-liter-warning">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2.8 19a1.4 1.4 0 0 0 1.2 2.1h16a1.4 1.4 0 0 0 1.2-2.1L12 3Z"/><path d="M12 9v4m0 3h.01"/></svg>
                <span>{t('map_liter_fleet_warning')}</span>
              </div>
              <label style={{ display: 'grid', gridTemplateColumns: '1fr 110px', alignItems: 'center', gap: 9, fontSize: 11, fontWeight: 700 }}>
                {t('map_shared_tank_capacity')}
                <span style={{ position: 'relative' }}><input type="number" min="1" max="5000" step="10" value={capacityDraft} onChange={event => setCapacityDraft(event.target.value)} onBlur={() => setCapacity(Number(capacityDraft))} style={{ ...inputStyle, width: '100%', paddingInlineEnd: 26 }}/><small className="fuel-capacity-unit">L</small></span>
              </label>
            </>}
          </>}

          {!isFuel && activeMetric && <>
            {activeMetric.key === 'refrigerator_temperature' && <label style={{ display: 'grid', gridTemplateColumns: '1fr 110px', alignItems: 'center', gap: 9, fontSize: 11, fontWeight: 700 }}>
              {t('map_scale_minimum')}
              <input
                type="number"
                max={scaleMax - (activeMetric.step || 1)}
                step={activeMetric.step || 1}
                value={metricScaleMinDraft}
                onChange={event => setMetricScaleMinDraft(event.target.value)}
                onBlur={() => {
                  const value = Number(metricScaleMinDraft)
                  if (metricScaleMinDraft !== '' && Number.isFinite(value)) setMetricScaleMinimum(value)
                  else setMetricScaleMinDraft(String(scaleMin))
                }}
                onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }}
                style={inputStyle}
                aria-label={`${t('map_scale_minimum')} (${activeMetric.unit})`}
              />
            </label>}
            <label style={{ display: 'grid', gridTemplateColumns: '1fr 110px', alignItems: 'center', gap: 9, fontSize: 11, fontWeight: 700 }}>
              {t('map_scale_maximum')}
              <input
                type="number"
                min={scaleMin + (activeMetric.step || 1)}
                step={activeMetric.step || 1}
                value={metricScaleMaxDraft}
                onChange={event => setMetricScaleMaxDraft(event.target.value)}
                onBlur={() => {
                  const value = Number(metricScaleMaxDraft)
                  if (metricScaleMaxDraft !== '' && Number.isFinite(value)) setMetricScaleMaximum(value)
                  else setMetricScaleMaxDraft(String(scaleMax))
                }}
                onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }}
                style={inputStyle}
                aria-label={`${t('map_scale_maximum')} (${activeMetric.unit})`}
              />
            </label>
          </>}

          {isFuel ? <FuelLevelGauge unit={config.fuelUnit} unitLabel={unitText(config.fuelUnit)} capacity={config.fuelTankCapacityLiters} ranges={config.fuelRangesByUnit[config.fuelUnit]} noDataColor={config.noDataColor} title={t('map_metric_fuel')} editHint={t('map_click_to_edit')} expanded={rangeEditorOpen} onAddBoundary={addFuelBoundary} onMoveBoundary={moveFuelBoundary} getBoundaryPreview={getFuelBoundaryPreview} /> : activeMetric && <MetricRangeGauge
            metric={activeMetric}
            minimum={scaleMin}
            maximum={scaleMax}
            ranges={currentRanges}
            noDataColor={config.noDataColor}
            title={metricLabel(activeMetric.key, activeMetric.label)}
            editHint={t('map_click_to_edit')}
            openRangesLabel={t('map_edit_ranges')}
            expanded={rangeEditorOpen}
            onOpenEditor={() => setRangeEditorOpen(true)}
            onAddBoundary={addMetricBoundary}
            onMoveBoundary={moveMetricBoundary}
            getBoundaryPreview={getMetricBoundaryPreview}
          />}
        </>}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 9 }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 9.5 }}>{t('map_saved_in_browser')}</span>
          <button type="button" onClick={() => { setRangeEditorOpen(false); onChange({ ...DEFAULT_MAP_LEGEND, statusColors: { ...DEFAULT_MAP_LEGEND.statusColors }, fuelRangesByUnit: { percent: [], liter: [] }, metricRangesByKey: {}, metricScaleMaxByKey: {}, metricScaleMinByKey: {} }) }} style={smallButton}>{t('map_reset_settings')}</button>
        </div>
      </div>
    </section>
    {showRangeEditor && <aside className={`fuel-ranges-card is-detached is-${rangeEditorPlacement}`} aria-label={t('map_threshold_ranges')}>
      {rangeEditor}
      <p className="fuel-ranges-hint">{t('map_sensor_hint')}</p>
    </aside>}
    </div>
  )
}
