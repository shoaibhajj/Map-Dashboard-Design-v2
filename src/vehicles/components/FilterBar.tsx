import { useState } from 'react'
import type { VehicleStatus } from '../types'

type FilterChip = 'all' | VehicleStatus

interface FilterBarProps {
  activeFilter: FilterChip
  onFilterChange: (f: FilterChip) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (v: 'grid' | 'list') => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

const chips: { key: FilterChip; label: string }[] = [
  { key: 'all',              label: 'الكل' },
  { key: 'stopped',         label: 'متوقفة' },
  { key: 'needs_attention', label: 'تحتاج متابعة' },
]

export default function FilterBar({
  activeFilter, onFilterChange,
  viewMode, onViewModeChange,
  searchQuery, onSearchChange,
}: FilterBarProps) {
  const [driversOpen, setDriversOpen]   = useState(false)
  const [groupsOpen,  setGroupsOpen]    = useState(false)

  return (
    <div className="flex items-center gap-2 px-1" dir="ltr">
      {/* View toggle + refresh */}
      <div className="flex items-center gap-1 bg-[var(--secondary)] rounded-lg p-1 flex-shrink-0">
        <button
          onClick={() => {}}
          className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          title="تحديث"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
          title="عرض شبكي"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'}`}
          title="عرض قائمة"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round"/>
            <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round"/>
            <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round"/>
            <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round"/>
            <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round"/>
            <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Dropdowns */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => { setDriversOpen(o => !o); setGroupsOpen(false) }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)] transition-colors"
          dir="rtl"
        >
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          <span>كل السائقين</span>
        </button>
      </div>

      <div className="relative flex-shrink-0">
        <button
          onClick={() => { setGroupsOpen(o => !o); setDriversOpen(false) }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)] transition-colors"
          dir="rtl"
        >
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          <span>كل المجموعات</span>
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5" dir="rtl">
        {chips.map(chip => (
          <button
            key={chip.key}
            onClick={() => onFilterChange(chip.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              activeFilter === chip.key
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_12px_color-mix(in_srgb,var(--primary)_30%,transparent)]'
                : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="flex-1 max-w-xs mr-auto">
        <div className="relative">
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="ابحث عن مركبة أو لوحة..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            dir="rtl"
            className="w-full pr-8 pl-3 py-1.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
