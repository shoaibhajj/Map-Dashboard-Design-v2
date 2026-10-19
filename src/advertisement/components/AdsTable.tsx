import type { Campaign, CampaignStatus } from '../types'
import CampaignThumbnail from './CampaignThumbnail'

/* ── Status badge ──────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: CampaignStatus }) {
  const cfg: Record<CampaignStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
    active:    { label: 'نشطة',    dot: 'bg-[var(--primary)] animate-pulse-dot',     text: 'text-[var(--primary)]',    bg: 'bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]',  border: 'border-[color-mix(in_srgb,var(--primary)_22%,transparent)]' },
    scheduled: { label: 'مجدولة',  dot: 'bg-[var(--info)]',                          text: 'text-[var(--info)]',       bg: 'bg-[color-mix(in_srgb,var(--info)_10%,transparent)]',     border: 'border-[color-mix(in_srgb,var(--info)_22%,transparent)]' },
    paused:    { label: 'متوقفة',  dot: 'bg-[var(--danger)]',                        text: 'text-[var(--danger)]',     bg: 'bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]',   border: 'border-[color-mix(in_srgb,var(--danger)_22%,transparent)]' },
    completed: { label: 'مكتملة',  dot: 'bg-[var(--muted-foreground)]',              text: 'text-[var(--muted-foreground)]', bg: 'bg-[var(--secondary)]', border: 'border-[var(--border)]' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${c.bg} ${c.border} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`}/>
      {c.label}
    </span>
  )
}

/* ── Formatted number ──────────────────────────────────────────────── */
function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

/* ── Table row ─────────────────────────────────────────────────────── */
interface RowProps {
  campaign: Campaign
  isSelected: boolean
  onSelect: (c: Campaign) => void
}

function AdsTableRow({ campaign: c, isSelected, onSelect }: RowProps) {
  return (
    <tr
      onClick={() => onSelect(c)}
      className={`
        border-b border-[var(--border)] cursor-pointer
        transition-colors duration-150
        ${isSelected
          ? 'bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]'
          : 'hover:bg-[var(--secondary)]'
        }
      `}
    >
      {/* Campaign (name + image) — rightmost in RTL */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3" dir="ltr">
          <CampaignThumbnail type={c.imageType} className="w-16 h-10 flex-shrink-0"/>
          <div className="text-right min-w-0">
            <p className={`text-[13px] font-semibold leading-tight truncate ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
              {c.name}
            </p>
            <p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">{c.subtitle}</p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={c.status}/>
      </td>

      {/* Views */}
      <td className="px-4 py-3 text-[13px] font-medium text-[var(--foreground)] text-center">
        {fmt(c.views)}
      </td>

      {/* Clicks */}
      <td className="px-4 py-3 text-[13px] font-medium text-[var(--foreground)] text-center">
        {c.clicks}
      </td>

      {/* CTR */}
      <td className="px-4 py-3 text-center">
        <span className={`text-[13px] font-semibold ${c.status === 'paused' ? 'text-[var(--danger)]' : 'text-[var(--primary)]'}`}>
          {c.ctr}%
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-[12px] text-[var(--muted-foreground)] text-center">
        {c.date}
      </td>

      {/* Actions — leftmost in RTL */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={e => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            title="تقرير الأداء"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>
          <button
            onClick={e => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            title="خيارات"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ── Table ─────────────────────────────────────────────────────────── */
interface AdsTableProps {
  campaigns: Campaign[]
  selectedId: string | null
  onSelect: (c: Campaign) => void
}

export default function AdsTable({ campaigns, selectedId, onSelect }: AdsTableProps) {
  const headers = [
    { label: 'الحملة',    align: 'right'  },
    { label: 'الحالة',    align: 'right'  },
    { label: 'المشاهدات', align: 'center' },
    { label: 'النقرات',   align: 'center' },
    { label: 'معدل النقر', align: 'center' },
    { label: 'التاريخ',   align: 'center' },
    { label: 'إجراءات',   align: 'center' },
  ]

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <table className="w-full" dir="rtl">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
            {headers.map(h => (
              <th
                key={h.label}
                className={`px-4 py-3 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide text-${h.align}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {campaigns.length > 0 ? (
            campaigns.map(c => (
              <AdsTableRow
                key={c.id}
                campaign={c}
                isSelected={selectedId === c.id}
                onSelect={onSelect}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 text-[var(--muted-foreground)] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <p className="text-sm font-medium text-[var(--foreground)]">لا توجد حملات مطابقة</p>
                  <p className="text-xs text-[var(--muted-foreground)]">جرّب تعديل الفلتر أو مصطلح البحث</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
