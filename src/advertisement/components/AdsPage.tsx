import { useState, useMemo } from 'react'
import type { Campaign, CampaignStatus } from '../types'
import { mockCampaigns, adsKPIs } from '../data/campaigns'
import AdsKPIBox from './AdsKPIBox'
import AdsFilterBar from './AdsFilterBar'
import AdsTable from './AdsTable'
import PromoCard from './PromoCard'
import CampaignDetailsPanel from './CampaignDetailsPanel'

type FilterTab = 'all' | CampaignStatus

const ITEMS_PER_PAGE = 5

export default function AdsPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(mockCampaigns[0])
  const [activeTab, setActiveTab]               = useState<FilterTab>('all')
  const [search, setSearch]                     = useState('')
  const [page, setPage]                         = useState(1)

  const filtered = useMemo(() => {
    return mockCampaigns.filter(c => {
      const matchTab = activeTab === 'all' || c.status === activeTab
      const q = search.toLowerCase()
      const matchSearch = !q || c.name.includes(q) || c.subtitle.includes(q)
      return matchTab && matchSearch
    })
  }, [activeTab, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSelect = (c: Campaign) => {
    setSelectedCampaign(prev => prev?.id === c.id ? null : c)
  }

  const handleCreate = () => {
    alert('سيتم فتح نموذج إنشاء الحملة قريباً')
  }

  return (
    /* RTL for content: first flex child → right, last → left */
    <div className="flex flex-1 overflow-hidden min-h-0" dir="rtl">

      {/* Details panel — RTL first = appears on RIGHT */}
      {selectedCampaign && (
        <CampaignDetailsPanel
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {/* Main scrollable column */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6 space-y-5">

          {/* Header row: title+KPIs on right, promo card on left */}
          <div className="flex gap-5 items-start">

            {/* Left section: title + KPIs (RTL second = visually LEFT) */}
            <div className="flex-1 space-y-5 min-w-0">
              {/* Page title */}
              <div className="flex items-start justify-between">
                <div className="text-right">
                  <div className="flex items-center gap-2.5 justify-end">
                    <h1 className="text-2xl font-bold text-[var(--foreground)] leading-tight">الإعلانات</h1>
                    <div className="w-9 h-9 rounded-xl bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] flex items-center justify-center text-[var(--primary)]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M22 4s-1 3-4 3-5-3-8-3-4 3-4 3v13s1-3 4-3 5 3 8 3 4-3 4-3V4z"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    إدارة الحملات الإعلانية والترويج لخدماتك وتتبع أدائها
                  </p>
                </div>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-semibold hover:opacity-90 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_35%,transparent)] active:scale-95 transition-all duration-200 flex-shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  إنشاء حملة جديدة
                </button>
              </div>

              {/* KPI strip */}
              <div className="grid grid-cols-4 gap-3">
                {adsKPIs.map(kpi => (
                  <AdsKPIBox key={kpi.id} kpi={kpi}/>
                ))}
              </div>
            </div>

            {/* PromoCard — RTL first = visually RIGHT */}
            <PromoCard onCreateCampaign={handleCreate}/>
          </div>

          {/* Filter bar */}
          <AdsFilterBar
            activeTab={activeTab}
            onTabChange={t => { setActiveTab(t); setPage(1) }}
            search={search}
            onSearchChange={q => { setSearch(q); setPage(1) }}
          />

          {/* Campaign table */}
          <AdsTable
            campaigns={paginated}
            selectedId={selectedCampaign?.id ?? null}
            onSelect={handleSelect}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[var(--muted-foreground)]">
                عرض {paginated.length} من {filtered.length} حملة
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      page === p
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_12px_color-mix(in_srgb,var(--primary)_30%,transparent)]'
                        : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Page count indicator */}
          {filtered.length > 0 && (
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              عرض {Math.min(ITEMS_PER_PAGE, paginated.length)} من {mockCampaigns.length} حملة
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
