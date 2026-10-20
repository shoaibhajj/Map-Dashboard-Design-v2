import type { CSSProperties } from 'react'
import { getEffectiveColorSegments, type FuelUnit, type MapColorRange } from '../../utils/mapLegend'

interface Props {
  value: number | null
  unit: FuelUnit
  unitLabel: string
  capacity: number
  ranges: MapColorRange[]
  noDataColor: string
  title: string
  fleetAverageLabel: string
  editHint: string
  openLabel: string
  closeLabel: string
  expanded: boolean
  onToggle: () => void
}

function pointAt(value: number, maximum: number, radius = 50) {
  const angle = (135 + (Math.max(0, Math.min(maximum, value)) / maximum) * 270) * Math.PI / 180
  return { x: 82 + radius * Math.cos(angle), y: 59 + radius * Math.sin(angle) }
}

function arcPath(from: number, to: number, maximum: number) {
  const start = pointAt(from, maximum)
  const end = pointAt(to, maximum)
  // The gauge sweep is 270 degrees, so its 180-degree SVG arc threshold is 2/3 of the value domain.
  const large = to - from > maximum * (2 / 3) ? 1 : 0
  return `M ${start.x} ${start.y} A 50 50 0 ${large} 1 ${end.x} ${end.y}`
}

export default function FuelLevelGauge({ value, unit, unitLabel, capacity, ranges, noDataColor, title, fleetAverageLabel, editHint, openLabel, closeLabel, expanded, onToggle }: Props) {
  const maximum = unit === 'percent' ? 100 : capacity
  const shownValue = value === null ? '—' : unit === 'percent' ? Math.round(value) : Math.round(value * 10) / 10
  const needle = pointAt(value ?? 0, maximum)
  const segments = getEffectiveColorSegments(ranges, 0, maximum, noDataColor)
  const activeSegment = value === null ? undefined : segments.find((segment, index, all) => value >= segment.min && (value < segment.max || (index === all.length - 1 && value <= segment.max)))
  const style = { '--gauge-color': activeSegment?.color ?? noDataColor } as CSSProperties
  const ticks = [...new Set([0, ...segments.flatMap(segment => [segment.min, segment.max]), maximum])].sort((a, b) => a - b)

  return (
    <button type="button" className={`fuel-gauge-preview${expanded ? ' is-expanded' : ''}`} onClick={onToggle} aria-expanded={expanded} aria-label={`${title}: ${shownValue} ${unitLabel}. ${expanded ? closeLabel : openLabel}`} style={style}>
      <span className="fuel-gauge-heading">{title}</span>
      <svg className="fuel-gauge-svg" viewBox="0 0 164 112" role="img" aria-hidden="true">
        {segments.map(segment => <path key={`${segment.min}-${segment.max}-${segment.color}`} d={arcPath(segment.min, segment.max, maximum)} fill="none" stroke={segment.color} strokeWidth="7" strokeLinecap={segment.min === 0 || segment.max === maximum ? 'round' : 'butt'} />)}
        {ticks.map(tick => {
          const inner = pointAt(tick, maximum, 43)
          const outer = pointAt(tick, maximum, 57)
          const label = pointAt(tick, maximum, 35)
          const anchor = label.x < 68 ? 'start' : label.x > 96 ? 'end' : 'middle'
          return <g key={tick}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="var(--foreground)" strokeOpacity=".6" strokeWidth="1" />
            <text x={label.x} y={label.y + 3} textAnchor={anchor} className="fuel-gauge-endpoint">{Number.isInteger(tick) ? tick : Number(tick.toFixed(1))}</text>
          </g>
        })}
        <path d={`M 82 59 L ${needle.x} ${needle.y}`} stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="82" cy="59" r="5" fill="var(--foreground)" />
      </svg>
      <span className="fuel-gauge-reading">{shownValue}<small>{value === null ? '' : unitLabel}</small></span>
      <span className="fuel-gauge-footnote">{fleetAverageLabel}{unit === 'liter' ? ` · ${capacity} ${unitLabel}` : ''}</span>
      <span className="fuel-gauge-edit-hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z"/></svg>{expanded ? closeLabel : editHint}</span>
    </button>
  )
}
