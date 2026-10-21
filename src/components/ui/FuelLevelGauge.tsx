import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { FUEL_RANGE_COLOR_PALETTE, getEffectiveColorSegments, type FuelUnit, type MapColorRange } from '../../utils/mapLegend'

interface Props {
  unit: FuelUnit
  unitLabel: string
  capacity: number
  ranges: MapColorRange[]
  noDataColor: string
  title: string
  editHint: string
  expanded: boolean
  onAddBoundary: (value: number) => void
  onMoveBoundary: (index: number, value: number) => void
  getBoundaryPreview: (value: number) => { min: number; max: number; color: string } | null
}

const VIEWBOX = { width: 360, height: 280, centerX: 180, centerY: 140, radius: 110 }
const CELL_COUNT = 121
const EDIT_STEP = 1

function pointAt(value: number, maximum: number, radius = VIEWBOX.radius) {
  const ratio = maximum > 0 ? Math.max(0, Math.min(maximum, value)) / maximum : 0
  const angle = (135 + ratio * 270) * Math.PI / 180
  return {
    x: VIEWBOX.centerX + radius * Math.cos(angle),
    y: VIEWBOX.centerY + radius * Math.sin(angle),
    angle: 135 + ratio * 270,
  }
}

function valueAtPointer(svg: SVGSVGElement, clientX: number, clientY: number, maximum: number) {
  const rect = svg.getBoundingClientRect()
  const x = (clientX - rect.left) / rect.width * VIEWBOX.width
  const y = (clientY - rect.top) / rect.height * VIEWBOX.height
  const angle = Math.atan2(y - VIEWBOX.centerY, x - VIEWBOX.centerX) * 180 / Math.PI
  const sweep = (angle - 135 + 360) % 360
  const value = Math.max(0, Math.min(1, sweep / 270)) * maximum
  return Math.round(value / EDIT_STEP) * EDIT_STEP
}

function displayValue(value: number, unit: FuelUnit) {
  return unit === 'percent' ? `${Math.round(value)}` : `${Math.round(value * 10) / 10}`
}

function rangeAt(value: number, ranges: MapColorRange[]) {
  return ranges.find((range, index) => value >= range.min && (value < range.max || (index === ranges.length - 1 && value <= range.max)))
}

export default function FuelLevelGauge({ unit, unitLabel, capacity, ranges, noDataColor, title, editHint, expanded, onAddBoundary, onMoveBoundary, getBoundaryPreview }: Props) {
  const maximum = unit === 'percent' ? 100 : capacity
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const needle = hoverValue === null ? null : pointAt(hoverValue, maximum, 78)
  const segments = getEffectiveColorSegments(ranges, 0, maximum, noDataColor)
  const dragBoundaryIndex = useRef<number | null>(null)
  const dragMoved = useRef(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const previewRange = hoverValue === null ? undefined : rangeAt(hoverValue, ranges)
  const boundaryPreview = hoverValue === null ? null : getBoundaryPreview(hoverValue)
  const previewColor = boundaryPreview?.color ?? previewRange?.color ?? (ranges.length === 0 ? FUEL_RANGE_COLOR_PALETTE[0] : noDataColor)
  const previewStart = boundaryPreview?.min ?? previewRange?.min ?? 0
  const previewEnd = boundaryPreview?.max ?? hoverValue ?? 0
  const style = { '--gauge-color': hoverValue === null ? 'var(--muted-foreground)' : previewColor } as CSSProperties

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const nextValue = valueAtPointer(event.currentTarget, event.clientX, event.clientY, maximum)
    setHoverValue(nextValue)
    const boundaryIndex = dragBoundaryIndex.current
    if (boundaryIndex !== null) {
      dragMoved.current = true
      onMoveBoundary(boundaryIndex, nextValue)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const currentValue = hoverValue ?? 0
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0
    if (direction) {
      event.preventDefault()
      setHoverValue(Math.max(0, Math.min(maximum, currentValue + direction * EDIT_STEP)))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onAddBoundary(hoverValue ?? currentValue)
    } else if (event.key === 'Escape') {
      setHoverValue(null)
    }
  }

  const hoveredPoint = hoverValue === null ? null : pointAt(hoverValue, maximum)
  const tooltipX = hoveredPoint ? Math.max(4, Math.min(VIEWBOX.width - 134, hoveredPoint.x - 67)) : 0
  const tooltipY = hoveredPoint ? Math.max(3, hoveredPoint.y - 39) : 0

  return (
    <div className={`fuel-gauge-preview${expanded ? ' is-expanded' : ''}`} style={style}>
      <span className="fuel-gauge-heading">{title}</span>
      <svg
        ref={svgRef}
        className="fuel-gauge-svg"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="slider"
        aria-label={`${title}. ${editHint}`}
        aria-valuemin={0}
        aria-valuemax={maximum}
        aria-valuenow={hoverValue ?? 0}
        aria-valuetext={`${displayValue(hoverValue ?? 0, unit)} ${unitLabel}`}
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => { if (dragBoundaryIndex.current === null) setHoverValue(null) }}
        onPointerUp={() => { dragBoundaryIndex.current = null }}
        onPointerCancel={() => { dragBoundaryIndex.current = null; setHoverValue(null) }}
        onClick={event => {
          if (dragMoved.current) { dragMoved.current = false; return }
          onAddBoundary(valueAtPointer(event.currentTarget, event.clientX, event.clientY, maximum))
        }}
        onKeyDown={handleKeyDown}
      >
        <title>{editHint}</title>
        {Array.from({ length: CELL_COUNT }, (_, index) => {
          const cellValue = maximum * index / (CELL_COUNT - 1)
          const point = pointAt(cellValue, maximum)
          const segment = rangeAt(cellValue, ranges)
          const isCandidateCell = boundaryPreview !== null && cellValue >= boundaryPreview.min && cellValue <= boundaryPreview.max
          const isPreviewFilled = hoverValue === null ? ranges.length > 0 : cellValue <= hoverValue || isCandidateCell
          const cellColor = isCandidateCell
            ? boundaryPreview.color
            : isPreviewFilled
              ? segment?.color ?? (ranges.length === 0 && hoverValue !== null ? FUEL_RANGE_COLOR_PALETTE[0] : noDataColor)
              : 'var(--muted)'
          return <rect
            key={index}
            x={point.x - 2.7}
            y={point.y - 4.5}
            width="5.4"
            height="9"
            rx="2"
            fill={cellColor}
            opacity={isPreviewFilled ? 1 : .62}
            transform={`rotate(${point.angle + 90} ${point.x} ${point.y})`}
            className="fuel-gauge-cell"
          />
        })}

        {segments.map(segment => {
          const start = pointAt(segment.min, maximum, 79)
          const end = pointAt(segment.max, maximum, 79)
          return <path
            key={`${segment.min}-${segment.max}-${segment.color}`}
            d={`M ${start.x} ${start.y} A 79 79 0 ${segment.max - segment.min > maximum * (2 / 3) ? 1 : 0} 1 ${end.x} ${end.y}`}
            fill="none"
            stroke={segment.color}
            strokeOpacity=".22"
            strokeWidth="1.2"
          />
        })}

        {(() => {
          const point = pointAt(0, maximum, 66)
          return <text x={point.x} y={point.y + 4} textAnchor="end" className="fuel-gauge-endpoint">0</text>
        })()}

        {(() => {
          // Every saved range contributes its own visible endpoint. Keep a separate,
          // fixed scale endpoint only when no saved range already ends there.
          const rangeBoundaries = ranges.map((range, index) => ({
            id: `${range.id}-${index}`,
            value: range.max,
            color: range.color,
            rangeIndex: index,
            draggable: true,
          }))
          const hasTerminalRangeBoundary = ranges.some(range => Math.abs(range.max - maximum) < 0.001)
          const boundaries = hasTerminalRangeBoundary
            ? rangeBoundaries
            : [...rangeBoundaries, {
                id: 'fuel-terminal-boundary',
                value: maximum,
                color: ranges.find(range => range.min <= maximum && range.max >= maximum)?.color ?? noDataColor,
                rangeIndex: null,
                draggable: false,
              }]
          return boundaries.map(boundary => {
          const point = pointAt(boundary.value, maximum)
          const tickStart = pointAt(boundary.value, maximum, VIEWBOX.radius - 8)
          const tickEnd = pointAt(boundary.value, maximum, VIEWBOX.radius + 11)
          const label = pointAt(boundary.value, maximum, VIEWBOX.radius + 25)
          const anchor = label.x < VIEWBOX.centerX - 8 ? 'end' : label.x > VIEWBOX.centerX + 8 ? 'start' : 'middle'
          return <g key={boundary.id} className="fuel-gauge-boundary" onPointerDown={event => {
            event.stopPropagation()
            if (!boundary.draggable || boundary.rangeIndex === null) return
            dragBoundaryIndex.current = boundary.rangeIndex
            dragMoved.current = false
            event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId)
          }} onClick={event => {
            event.stopPropagation()
            if (!dragMoved.current && boundary.value < maximum) onAddBoundary(boundary.value)
            dragMoved.current = false
          }}>
            <circle cx={point.x} cy={point.y} r="12" fill="transparent" className="fuel-gauge-boundary-hit" />
            <line x1={tickStart.x} y1={tickStart.y} x2={tickEnd.x} y2={tickEnd.y} stroke={boundary.color} strokeWidth="3.5" strokeLinecap="round" />
            <text x={label.x} y={label.y + 4} textAnchor={anchor} className="fuel-gauge-boundary-label">{displayValue(boundary.value, unit)}</text>
          </g>
          })
        })()}

        {needle && <path d={`M ${VIEWBOX.centerX} ${VIEWBOX.centerY} L ${needle.x} ${needle.y}`} stroke={previewColor} strokeWidth="3.4" strokeLinecap="round" className="fuel-gauge-needle" />}
        <circle cx={VIEWBOX.centerX} cy={VIEWBOX.centerY} r="5.5" fill={needle ? previewColor : 'var(--muted-foreground)'} />

        {hoverValue !== null && hoveredPoint && <g className="fuel-gauge-tooltip" pointerEvents="none">
          <rect x={tooltipX} y={tooltipY} width="130" height="26" rx="7" />
          <circle cx={tooltipX + 11} cy={tooltipY + 13} r="4" fill={previewColor} />
          <text x={tooltipX + 20} y={tooltipY + 17}>{displayValue(previewStart, unit)}–{displayValue(previewEnd, unit)} {unitLabel}</text>
        </g>}
      </svg>
      <span className="fuel-gauge-reading">{hoverValue === null ? '—' : displayValue(hoverValue, unit)}<small>{hoverValue === null ? '' : unitLabel}</small></span>
      {unit === 'liter' && <span className="fuel-gauge-footnote">{capacity} {unitLabel}</span>}
      <span className="fuel-gauge-edit-hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/></svg>{editHint}</span>
    </div>
  )
}
