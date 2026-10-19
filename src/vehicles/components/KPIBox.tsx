import type { VehicleStatus } from '../types'

interface KPIBoxProps {
  label: string
  value: number
  status: VehicleStatus | 'total'
}

const dotColors = {
  moving:          'bg-[var(--primary)]',
  stopped:         'bg-[var(--muted-foreground)]',
  needs_attention: 'bg-[var(--color-amber)]',
  total:           'bg-[var(--muted-foreground)]',
}

const icons = {
  moving: (
    <svg className="w-7 h-7 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
  ),
  stopped: (
    <svg className="w-7 h-7 text-[var(--muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="6" width="12" height="12" rx="2" strokeLinecap="round"/>
    </svg>
  ),
  needs_attention: (
    <svg className="w-7 h-7 text-[var(--color-amber)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
    </svg>
  ),
  total: (
    <svg className="w-7 h-7 text-[var(--muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="15" height="13" rx="2" strokeLinecap="round"/>
      <path d="M16 8h4l3 3v4h-7V8z" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
}

const valueColors = {
  moving:          'text-[var(--primary)]',
  stopped:         'text-[var(--foreground)]',
  needs_attention: 'text-[var(--color-amber)]',
  total:           'text-[var(--foreground)]',
}

export default function KPIBox({ label, value, status }: KPIBoxProps) {
  return (
    <div className="
      bg-[var(--card)] border border-[var(--border)] rounded-xl p-4
      flex items-center justify-between
      hover:border-[var(--primary)] hover:shadow-[0_0_16px_color-mix(in_srgb,var(--primary)_12%,transparent)]
      transition-all duration-300 cursor-default group
    ">
      {/* Left side: number + label */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-bold leading-none ${valueColors[status]}`}>
            {value}
          </span>
          {status !== 'total' && (
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[status]} ${status === 'moving' ? 'animate-pulse-dot' : ''}`} />
          )}
        </div>
        <span className="text-xs text-[var(--muted-foreground)] font-medium leading-tight text-right" dir="rtl">
          {label}
        </span>
      </div>

      {/* Right side: icon */}
      <div className="opacity-50 group-hover:opacity-80 transition-opacity">
        {icons[status]}
      </div>
    </div>
  )
}
