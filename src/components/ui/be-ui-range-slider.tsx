import { motion } from 'motion/react'
import './be-ui-range-slider.css'

interface RangeSliderProps {
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  min: number
  max: number
  step?: number
  labels: [string, string]
}

export function RangeSlider({ value, onValueChange, min, max, step = 1, labels }: RangeSliderProps) {
  const span = Math.max(1, max - min)
  const lowPosition = ((value[0] - min) / span) * 100
  const highPosition = ((value[1] - min) / span) * 100
  const ticks = Array.from({ length: 11 }, (_, index) => index * 10)

  return (
    <div className="be-range-slider" dir="ltr">
      <div className="be-range-slider-track">
        <div className="be-range-slider-ticks" aria-hidden="true">
          {ticks.map(tick => <i key={tick} style={{ left: `${tick}%` }} />)}
        </div>
        <motion.div className="be-range-slider-selection" animate={{ left: `${lowPosition}%`, width: `${highPosition - lowPosition}%` }} transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
        <input
          type="range" min={min} max={max} step={step} value={value[0]} aria-label={labels[0]}
          onChange={event => onValueChange([Math.min(Number(event.target.value), value[1] - step), value[1]])}
          className="be-range-slider-thumb be-range-slider-thumb-low"
        />
        <input
          type="range" min={min} max={max} step={step} value={value[1]} aria-label={labels[1]}
          onChange={event => onValueChange([value[0], Math.max(Number(event.target.value), value[0] + step)])}
          className="be-range-slider-thumb be-range-slider-thumb-high"
        />
      </div>
    </div>
  )
}
