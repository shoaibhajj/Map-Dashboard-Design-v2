import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { FUEL_RANGE_COLOR_PALETTE, getEffectiveColorSegments, type MapColorRange, type MetricOption } from '../../utils/mapLegend'

interface Props {
  metric: MetricOption
  minimum: number
  maximum: number
  ranges: MapColorRange[]
  noDataColor: string
  title: string
  editHint: string
  openRangesLabel: string
  expanded: boolean
  onOpenEditor: () => void
  onAddBoundary: (value: number) => void
  onMoveBoundary: (index: number, value: number) => void
  getBoundaryPreview: (value: number) => { min: number; max: number; color: string; kind?: 'first' | 'split' | 'extend' | 'existing' } | null
}

const VIEW = { width: 360, height: 260, centerX: 180, centerY: 132, radius: 91 }
const CELL_COUNT = 101
const TEMPERATURE_TUBE_PATH = 'M173 64a7 7 0 0 1 14 0v144a12 12 0 1 1-14 0Z'

function clampRatio(value: number, minimum: number, maximum: number) {
  return maximum > minimum ? Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum))) : 0
}

function pointAt(value: number, metric: MetricOption, minimum: number, maximum: number) {
  if (metric.kind === 'speed' || metric.displayStyle === 'gauge') {
    const angle = 135 + clampRatio(value, minimum, maximum) * 270
    const radians = angle * Math.PI / 180
    return { x: VIEW.centerX + VIEW.radius * Math.cos(radians), y: VIEW.centerY + VIEW.radius * Math.sin(radians), angle }
  }
  if (metric.key === 'refrigerator_temperature') {
    const y = 54 + (1 - clampRatio(value, minimum, maximum)) * 158
    return { x: 180, y, angle: 0 }
  }
  const left = metric.kind === 'voltage' ? 76 : metric.key === 'weightLimitTons' ? 80 : 66
  const right = metric.kind === 'voltage' ? 284 : metric.key === 'weightLimitTons' ? 280 : 294
  const y = metric.kind === 'voltage' ? 137 : metric.key === 'weightLimitTons' ? 98 : 165
  const x = left + clampRatio(value, minimum, maximum) * (right - left)
  return { x, y, angle: 0 }
}

function valueAtPointer(svg: SVGSVGElement, clientX: number, clientY: number, metric: MetricOption, minimum: number, maximum: number) {
  const rect = svg.getBoundingClientRect()
  const x = (clientX - rect.left) / rect.width * VIEW.width
  const y = (clientY - rect.top) / rect.height * VIEW.height
  let ratio: number
  if (metric.kind === 'speed' || metric.displayStyle === 'gauge') {
    const angle = Math.atan2(y - VIEW.centerY, x - VIEW.centerX) * 180 / Math.PI
    ratio = Math.max(0, Math.min(1, ((angle - 135 + 360) % 360) / 270))
  } else if (metric.key === 'refrigerator_temperature') {
    ratio = Math.max(0, Math.min(1, (212 - y) / 158))
  } else {
    const left = metric.kind === 'voltage' ? 76 : metric.key === 'weightLimitTons' ? 80 : 66
    const right = metric.kind === 'voltage' ? 284 : metric.key === 'weightLimitTons' ? 280 : 294
    ratio = Math.max(0, Math.min(1, (x - left) / (right - left)))
  }
  const step = metric.step || 1
  const value = minimum + ratio * (maximum - minimum)
  return Math.max(minimum, Math.min(maximum, Math.round(value / step) * step))
}

function formatted(value: number, step: number) {
  const decimals = step < 1 ? Math.min(3, Math.max(1, `${step}`.split('.')[1]?.length ?? 1)) : 0
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 })
}

function isOverTemperatureGauge(svg: SVGSVGElement, clientX: number, clientY: number) {
  const rect = svg.getBoundingClientRect()
  const x = (clientX - rect.left) / rect.width * VIEW.width
  const y = (clientY - rect.top) / rect.height * VIEW.height
  return x >= 150 && x <= 210 && y >= 38 && y <= 250
}

function rangeAt(value: number, ranges: MapColorRange[]) {
  return ranges.find((range, index) => value >= range.min && (value < range.max || (index === ranges.length - 1 && value <= range.max)))
}

export default function MetricRangeGauge({ metric, minimum, maximum, ranges, noDataColor, title, editHint, openRangesLabel, expanded, onOpenEditor, onAddBoundary, onMoveBoundary, getBoundaryPreview }: Props) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const dragBoundaryIndex = useRef<number | null>(null)
  const dragMoved = useRef(false)
  const previewRange = hoverValue === null ? undefined : rangeAt(hoverValue, ranges)
  const boundaryPreview = hoverValue === null ? null : getBoundaryPreview(hoverValue)
  const previewColor = boundaryPreview?.color ?? previewRange?.color ?? noDataColor
  const shownStart = boundaryPreview?.min ?? previewRange?.min ?? minimum
  const shownEnd = boundaryPreview?.max ?? previewRange?.max ?? hoverValue ?? minimum
  const segments = ranges.length ? getEffectiveColorSegments(ranges, minimum, maximum, noDataColor) : []
  const isSpeed = metric.kind === 'speed'
  const isCustomGauge = metric.key.startsWith('custom:') && metric.displayStyle === 'gauge'
  const isCustomBar = metric.key.startsWith('custom:') && metric.displayStyle === 'bar'
  const isRadialGauge = isSpeed || isCustomGauge
  const isTemperature = metric.key === 'refrigerator_temperature'
  const isBattery = metric.kind === 'voltage'
  const isWeight = metric.key === 'weightLimitTons'
  const points = Array.from({ length: CELL_COUNT }, (_, index) => minimum + (maximum - minimum) * index / (CELL_COUNT - 1))

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (isTemperature && dragBoundaryIndex.current === null && !isOverTemperatureGauge(event.currentTarget, event.clientX, event.clientY)) {
      setHoverValue(null)
      return
    }
    const value = valueAtPointer(event.currentTarget, event.clientX, event.clientY, metric, minimum, maximum)
    setHoverValue(value)
    if (dragBoundaryIndex.current !== null) {
      dragMoved.current = true
      onMoveBoundary(dragBoundaryIndex.current, value)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const value = hoverValue ?? minimum
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0
    if (direction) {
      event.preventDefault()
      const step = metric.step || 1
      setHoverValue(Math.max(minimum, Math.min(maximum, value + direction * step)))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onAddBoundary(value)
    } else if (event.key === 'Escape') setHoverValue(null)
  }

  const renderLinearTicks = () => segments.map(segment => {
    const start = pointAt(segment.min, metric, minimum, maximum)
    const end = pointAt(segment.max, metric, minimum, maximum)
    const railY = isBattery ? 137 : isWeight ? 98 : 165
    return <line key={`${segment.min}-${segment.max}-${segment.color}`} x1={start.x} y1={railY} x2={end.x} y2={railY} stroke={segment.color} strokeWidth={isCustomBar ? 15 : isBattery ? 31 : 15} strokeLinecap="butt" opacity={isCustomBar ? 1 : isBattery ? .19 : .24} />
  })

  const renderRangeCells = () => points.map((value, index) => {
    const point = pointAt(value, metric, minimum, maximum)
    const segment = rangeAt(value, ranges)
    const isCandidate = boundaryPreview !== null && value >= boundaryPreview.min && value <= boundaryPreview.max
    const filled = hoverValue === null ? ranges.length > 0 : value <= hoverValue || isCandidate
    const color = isCandidate ? boundaryPreview.color : filled ? segment?.color ?? (ranges.length === 0 ? FUEL_RANGE_COLOR_PALETTE[0] : noDataColor) : 'var(--muted)'
    if (isRadialGauge) return <rect key={index} x={point.x - 2.5} y={point.y - 4} width="5" height="8" rx="2" fill={color} opacity={filled ? 1 : .58} transform={`rotate(${point.angle + 90} ${point.x} ${point.y})`} />
    if (isTemperature) return null
    if (isCustomBar) return null
    const width = isBattery ? 12 : 3.1
    const gap = isBattery ? 3.8 : 0.4
    return <rect key={index} x={point.x - width / 2} y={point.y - (isBattery ? 12 : 3.5)} width={width - gap} height={isBattery ? 24 : 7} rx={isBattery ? 2 : 1.5} fill={color} opacity={filled ? 1 : .58} />
  })

  const renderTemperatureFill = () => {
    if (!ranges.length) {
      if (hoverValue === null) return null
      const hoverY = pointAt(hoverValue, metric, minimum, maximum).y
      return <rect x="158" y={hoverY} width="44" height={Math.max(0, 244 - hoverY)} fill={previewColor} clipPath="url(#metric-temperature-tube-clip)" />
    }
    const rangeFills = segments.map((segment, index) => {
      const top = pointAt(segment.max, metric, minimum, maximum).y
      const bottom = segment.min <= minimum ? 244 : pointAt(segment.min, metric, minimum, maximum).y
      return <rect key={`${segment.min}-${segment.max}-${segment.color}-${index}`} x="158" y={top} width="44" height={Math.max(1, bottom - top)} fill={segment.color} clipPath="url(#metric-temperature-tube-clip)" />
    })
    const isNewBoundaryPreview = boundaryPreview && boundaryPreview.kind !== 'existing'
    if (!isNewBoundaryPreview) return rangeFills

    const top = pointAt(boundaryPreview.max, metric, minimum, maximum).y
    const bottom = boundaryPreview.min <= minimum ? 244 : pointAt(boundaryPreview.min, metric, minimum, maximum).y
    return <>
      {rangeFills}
      <rect x="158" y={top} width="44" height={Math.max(1, bottom - top)} fill={boundaryPreview.color} clipPath="url(#metric-temperature-tube-clip)" />
    </>
  }

  const boundaries = ranges.length === 0 ? [] : [
    ...ranges.map((range, index) => ({ id: `${range.id}-${index}`, value: range.max, color: range.color, index, draggable: true })),
    ...(ranges.some(range => Math.abs(range.max - maximum) < metric.step / 2)
      ? []
      : [{ id: 'metric-terminal-boundary', value: maximum, color: ranges.find(range => range.min <= maximum && range.max >= maximum)?.color ?? noDataColor, index: -1, draggable: false }]),
  ]

  const renderBoundary = (boundary: typeof boundaries[number]) => {
    const point = pointAt(boundary.value, metric, minimum, maximum)
    if (isTemperature) {
      return <g key={boundary.id} className="metric-gauge-boundary" onPointerDown={event => {
        event.stopPropagation()
        if (!boundary.draggable) return
        dragBoundaryIndex.current = boundary.index
        dragMoved.current = false
        onOpenEditor()
        event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId)
      }} onClick={event => { event.stopPropagation(); if (!dragMoved.current) onOpenEditor(); dragMoved.current = false }}>
        <line x1="211" y1={point.y} x2="230" y2={point.y} stroke={boundary.color} strokeWidth="3" strokeLinecap="round" />
        <text x="238" y={point.y + 4} className="metric-gauge-boundary-label">{formatted(boundary.value, metric.step)}</text>
        <circle cx="220" cy={point.y} r="12" fill="transparent" />
      </g>
    }
    if (isRadialGauge) {
      const inner = { x: VIEW.centerX + (point.x - VIEW.centerX) * .91, y: VIEW.centerY + (point.y - VIEW.centerY) * .91 }
      const outer = { x: VIEW.centerX + (point.x - VIEW.centerX) * 1.14, y: VIEW.centerY + (point.y - VIEW.centerY) * 1.14 }
      const label = { x: VIEW.centerX + (point.x - VIEW.centerX) * 1.32, y: VIEW.centerY + (point.y - VIEW.centerY) * 1.32 }
      const anchor = label.x < VIEW.centerX - 7 ? 'end' : label.x > VIEW.centerX + 7 ? 'start' : 'middle'
      return <g key={boundary.id} className="metric-gauge-boundary" onPointerDown={event => {
        event.stopPropagation(); if (!boundary.draggable) return
        dragBoundaryIndex.current = boundary.index; dragMoved.current = false; onOpenEditor()
        event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId)
      }} onClick={event => { event.stopPropagation(); if (!dragMoved.current) onOpenEditor(); dragMoved.current = false }}>
        <circle cx={point.x} cy={point.y} r="13" fill="transparent" />
        <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={boundary.color} strokeWidth="3.5" strokeLinecap="round" />
        <text x={label.x} y={label.y + 4} textAnchor={anchor} className="metric-gauge-boundary-label">{formatted(boundary.value, metric.step)}</text>
      </g>
    }
    const railY = isBattery ? 137 : isWeight ? 98 : 165
    const anchor = point.x > 277 ? 'end' : point.x < 83 ? 'start' : 'middle'
    return <g key={boundary.id} className="metric-gauge-boundary" onPointerDown={event => {
      event.stopPropagation(); if (!boundary.draggable) return
      dragBoundaryIndex.current = boundary.index; dragMoved.current = false; onOpenEditor()
      event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId)
    }} onClick={event => { event.stopPropagation(); if (!dragMoved.current) onOpenEditor(); dragMoved.current = false }}>
      <circle cx={point.x} cy={railY} r="13" fill="transparent" />
      <line x1={point.x} y1={railY - (isBattery ? 23 : 15)} x2={point.x} y2={railY + (isBattery ? 23 : 15)} stroke={boundary.color} strokeWidth="3.5" strokeLinecap="round" />
      <text x={point.x} y={railY - 27} textAnchor={anchor} className="metric-gauge-boundary-label">{formatted(boundary.value, metric.step)}</text>
    </g>
  }

  const minimumPoint = pointAt(minimum, metric, minimum, maximum)
  const maximumPoint = pointAt(maximum, metric, minimum, maximum)
  const speedSegments = (ranges.length === 0 ? [] : segments).map(segment => {
    const start = pointAt(segment.min, metric, minimum, maximum)
    const end = pointAt(segment.max, metric, minimum, maximum)
    const ratio = clampRatio(segment.max - segment.min, 0, maximum - minimum)
    return <path key={`${segment.min}-${segment.max}-${segment.color}`} d={`M ${start.x} ${start.y} A ${VIEW.radius} ${VIEW.radius} 0 ${ratio > 2 / 3 ? 1 : 0} 1 ${end.x} ${end.y}`} fill="none" stroke={segment.color} strokeOpacity=".24" strokeWidth="1.5" />
  })
  const readingPoint = hoverValue === null ? null : pointAt(hoverValue, metric, minimum, maximum)

  return <section className={`metric-range-gauge is-${metric.key}${expanded ? ' is-expanded' : ''}`}>
    <div className="metric-range-gauge-heading"><strong>{title}</strong><span>{metric.unit}</span></div>
    <svg className="metric-range-gauge-svg" viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="slider" aria-label={`${title}. ${editHint}`} aria-valuemin={minimum} aria-valuemax={maximum} aria-valuenow={hoverValue ?? minimum} aria-valuetext={`${formatted(hoverValue ?? minimum, metric.step)} ${metric.unit}`} tabIndex={0}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { if (dragBoundaryIndex.current === null) setHoverValue(null) }}
      onPointerUp={() => { dragBoundaryIndex.current = null }}
      onPointerCancel={() => { dragBoundaryIndex.current = null; setHoverValue(null) }}
      onClick={event => {
        if (dragMoved.current) { dragMoved.current = false; return }
        if (isTemperature && !isOverTemperatureGauge(event.currentTarget, event.clientX, event.clientY)) return
        onAddBoundary(valueAtPointer(event.currentTarget, event.clientX, event.clientY, metric, minimum, maximum))
      }}
      onKeyDown={handleKeyDown}
    >
      <title>{editHint}</title>

      {isRadialGauge && <>
        <path d={`M ${pointAt(minimum, metric, minimum, maximum).x} ${pointAt(minimum, metric, minimum, maximum).y} A ${VIEW.radius} ${VIEW.radius} 0 1 1 ${pointAt(maximum, metric, minimum, maximum).x} ${pointAt(maximum, metric, minimum, maximum).y}`} fill="none" stroke="var(--muted)" strokeWidth="11" strokeLinecap="round" />
        {speedSegments}
      </>}

      {isCustomBar && <>
        <line x1="66" y1="165" x2="294" y2="165" stroke="var(--muted)" strokeWidth="15" strokeLinecap="round" />
        {renderLinearTicks()}
        {hoverValue !== null && boundaryPreview && boundaryPreview.kind !== 'existing' && <line
          x1={pointAt(boundaryPreview.min, metric, minimum, maximum).x}
          y1="165"
          x2={pointAt(boundaryPreview.max, metric, minimum, maximum).x}
          y2="165"
          stroke={boundaryPreview.color}
          strokeWidth="15"
          strokeLinecap="butt"
        />}
      </>}

      {metric.key === 'odometer' && <g className="metric-odometer-window">
        <rect x="52" y="70" width="256" height="76" rx="10" />
        <path d="M64 82h232" />
        <text x="180" y="120" textAnchor="middle" className="metric-odometer-digits">{hoverValue === null ? '— — — — —' : formatted(hoverValue, metric.step)}</text>
        <text x="180" y="137" textAnchor="middle" className="metric-odometer-unit">{metric.unit}</text>
        <circle cx="82" cy="108" r="3" /><circle cx="278" cy="108" r="3" />
      </g>}

      {isWeight && <g className="metric-weight-scale" transform="translate(60 28) scale(10)">
        <path vectorEffect="non-scaling-stroke" d="M12 3v17M6 21h12M4 7h16M5 7l-3 8m3-8 3 8m11-8-3 8m3-8 3 8" />
        <path vectorEffect="non-scaling-stroke" d="M2 15a3.5 3.5 0 0 0 7 0Zm13 0a3.5 3.5 0 0 0 7 0Z" />
      </g>}

      {isBattery && <g className="metric-battery-shell">
        <rect x="53" y="119" width="254" height="36" rx="7" />
        <path d="M307 130h9v14h-9" />
      </g>}

      {isTemperature && <g className="metric-temperature-shell">
        <rect x="160" y="42" width="40" height="184" rx="20" />
        <circle cx="180" cy="222" r="24" />
      </g>}

      {isTemperature && <>
        <defs>
          <clipPath id="metric-temperature-tube-clip"><path d={TEMPERATURE_TUBE_PATH} /></clipPath>
        </defs>
        <path d={TEMPERATURE_TUBE_PATH} fill="var(--muted)" opacity=".42" />
        {renderTemperatureFill()}
        <path d={TEMPERATURE_TUBE_PATH} className="metric-temperature-tube-outline" />
      </>}

      {!isTemperature && !isSpeed && !isCustomGauge && !isCustomBar && renderLinearTicks()}
      {!isTemperature && !isCustomBar && renderRangeCells()}

      {isBattery && <path d="M67 137h8" stroke="var(--muted-foreground)" strokeWidth="1.5" />}

      {!isRadialGauge && !isTemperature && <>
        <text x={minimumPoint.x} y={isBattery ? 190 : isWeight ? 178 : 202} textAnchor="middle" className="metric-gauge-endpoint">{formatted(minimum, metric.step)}</text>
        <text x={maximumPoint.x} y={isBattery ? 190 : isWeight ? 178 : 202} textAnchor="middle" className="metric-gauge-endpoint">{formatted(maximum, metric.step)}</text>
      </>}
      {isTemperature && <>
        <text x="146" y="59" textAnchor="end" className="metric-gauge-endpoint">{formatted(maximum, metric.step)}</text>
        <text x="146" y="216" textAnchor="end" className="metric-gauge-endpoint">{formatted(minimum, metric.step)}</text>
      </>}
      {isRadialGauge && <>
        <text x={minimumPoint.x - 3} y={minimumPoint.y + 22} textAnchor="end" className="metric-gauge-endpoint">{formatted(minimum, metric.step)}</text>
        <text x={maximumPoint.x + 3} y={maximumPoint.y + 22} textAnchor="start" className="metric-gauge-endpoint">{formatted(maximum, metric.step)}</text>
      </>}

      {boundaries.map(renderBoundary)}

      {readingPoint && isRadialGauge && <path d={`M ${VIEW.centerX} ${VIEW.centerY} L ${readingPoint.x} ${readingPoint.y}`} stroke={previewColor} strokeWidth="3.5" strokeLinecap="round" />}
      {readingPoint && isRadialGauge && <circle cx={VIEW.centerX} cy={VIEW.centerY} r="6" fill={previewColor} />}
      {readingPoint && metric.key === 'odometer' && <line x1={readingPoint.x} y1="155" x2={readingPoint.x} y2="177" stroke={previewColor} strokeWidth="3" strokeLinecap="round" />}
    </svg>

    <div className="metric-gauge-reading" aria-live="polite">
      <strong style={{ color: hoverValue === null ? 'var(--muted-foreground)' : previewColor }}>{hoverValue === null ? '—' : formatted(hoverValue, metric.step)}</strong>
      <span>{hoverValue === null ? metric.unit : `${metric.unit} · ${formatted(shownStart, metric.step)}–${formatted(shownEnd, metric.step)}`}</span>
    </div>
    <button type="button" className="metric-gauge-edit-button" onClick={onOpenEditor} aria-expanded={expanded}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></svg>
      {expanded ? openRangesLabel : editHint}
    </button>
  </section>
}
