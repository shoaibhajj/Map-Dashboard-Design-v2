import type { CampaignStatus } from '../types'

type FilterTab = 'all' | CampaignStatus

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'الكل' },
  { key: 'active',    label: 'نشطة' },
  { key: 'scheduled', label: 'مجدولة' },
  { key: 'completed', label: 'مكتملة' },
  { key: 'paused',    label: 'متوقفة' },
]

interface AdsFilterBarProps {
  activeTab: FilterTab
  onTabChange: (t: FilterTab) => void
  search: string
  onSearchChange: (q: string) => void
}

export default function AdsFilterBar({ activeTab, onTabChange, search, onSearchChange }: AdsFilterBarProps) {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      {/* Status tabs */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_14px_color-mix(in_srgb,var(--primary)_25%,transparent)]'
                : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border border-[var(--border)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1"/>

      {/* Search input */}
      <div className="relative w-56">
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="ابحث عن حملة..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          dir="rtl"
          className="w-full pr-8 pl-3 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Date range button */}
      <button
        className="flex items-center gap-2 px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[13px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)] transition-colors flex-shrink-0"
        dir="rtl"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        الفترة الزمنية
      </button>
    </div>
  )
}
