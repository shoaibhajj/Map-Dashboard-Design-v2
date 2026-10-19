import type { AdsKPI } from '../types'
import Sparkline from './Sparkline'

const icons = {
  campaigns: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M22 4s-1 3-4 3-5-3-8-3-4 3-4 3v13s1-3 4-3 5 3 8 3 4-3 4-3V4z"/>
      <line x1="4" y1="14" x2="4" y2="14"/>
    </svg>
  ),
  views: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  clicks: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 3l14 9-14 9V3z" strokeLinejoin="round"/>
    </svg>
  ),
  ctr: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
}

interface AdsKPIBoxProps {
  kpi: AdsKPI
}

export default function AdsKPIBox({ kpi }: AdsKPIBoxProps) {
  return (
    <div
      className="
        bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3
        hover:border-[var(--primary)]
        hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_10%,transparent)]
        transition-all duration-300 cursor-default group
      "
      dir="rtl"
    >
      {/* Top row: icon + label */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--muted-foreground)] font-medium">{kpi.label}</p>
        <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] flex items-center justify-center text-[var(--primary)] group-hover:bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] transition-colors">
          {icons[kpi.icon]}
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-[var(--foreground)] leading-none">{kpi.value}</p>

      {/* Sparkline */}
      <div className="h-9 w-full">
        <Sparkline
          data={kpi.sparkline}
          color="var(--primary)"
          gradientId={`kpi-spark-${kpi.id}`}
          height={36}
          strokeWidth={1.5}
          showDot
        />
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1">
        <svg
          className={`w-3 h-3 flex-shrink-0 ${kpi.trendUp ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {kpi.trendUp
            ? <path d="M12 4l8 8H4z"/>
            : <path d="M12 20l-8-8h16z"/>
          }
        </svg>
        <span className={`text-[11px] font-medium ${kpi.trendUp ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>
          {kpi.change}
        </span>
      </div>
    </div>
  )
}
