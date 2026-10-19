import { useState, useMemo } from 'react'
import type { Vehicle, VehicleStatus } from '../types'
import { mockVehicles } from '../data/vehicles'
import KPIBox from './KPIBox'
import FilterBar from './FilterBar'
import VehicleCard from './VehicleCard'
import VehicleDetailsPanel from './VehicleDetailsPanel'

type FilterChip = 'all' | VehicleStatus

const ITEMS_PER_PAGE = 12

export default function VehiclesPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(mockVehicles[0])
  const [activeFilter, setActiveFilter]       = useState<FilterChip>('all')
  const [viewMode, setViewMode]               = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery]         = useState('')
  const [page, setPage]                       = useState(1)

  const filtered = useMemo(() => {
    return mockVehicles.filter(v => {
      const matchStatus = activeFilter === 'all' || v.status === activeFilter
      const q = searchQuery.toLowerCase()
      const matchSearch = !q || v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q) || v.driver.name.includes(q)
      return matchStatus && matchSearch
    })
  }, [activeFilter, searchQuery])

  const pageCount  = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const totalPages = Math.max(1, pageCount)

  const kpis = useMemo(() => ({
    needs_attention: mockVehicles.filter(v => v.status === 'needs_attention').length,
    stopped:         mockVehicles.filter(v => v.status === 'stopped').length,
    moving:          mockVehicles.filter(v => v.status === 'moving').length,
    total:           mockVehicles.length,
  }), [])

  const handleSelect = (v: Vehicle) => {
    setSelectedVehicle(prev => prev?.id === v.id ? null : v)
  }

  const cols = selectedVehicle
    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div className="flex flex-1 overflow-hidden min-h-0" dir="rtl">
      {/* Details panel (RTL first = visually on RIGHT) */}
      {selectedVehicle && (
        <VehicleDetailsPanel
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div className="text-right">
              <h1 className="text-2xl font-bold text-[var(--foreground)] leading-tight">المركبات</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5 max-w-md">
                كل مركبة لها حالة واضحة وموقع مباشر ويمكن الوصول إليه فورًا
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-semibold hover:opacity-90 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_35%,transparent)] active:scale-95 transition-all duration-200 flex-shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              إضافة مركبة
            </button>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3">
            <KPIBox label="تحتاج متابعة" value={kpis.needs_attention} status="needs_attention"/>
            <KPIBox label="متوقفة"        value={kpis.stopped}         status="stopped"/>
            <KPIBox label="قيد الحركة"    value={kpis.moving}          status="moving"/>
            <KPIBox label="إجمالي المركبات" value={kpis.total}         status="total"/>
          </div>

          {/* Filter bar */}
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={f => { setActiveFilter(f); setPage(1) }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={q => { setSearchQuery(q); setPage(1) }}
          />

          {/* Vehicle grid */}
          {paginated.length > 0 ? (
            <div className={`grid gap-3 ${cols}`}>
              {paginated.map(vehicle => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedVehicle?.id === vehicle.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-12 h-12 text-[var(--muted-foreground)] mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p className="text-sm font-medium text-[var(--foreground)]">لا توجد مركبات مطابقة</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">جرّب تعديل مرشحات البحث</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--muted-foreground)]">
                عرض {paginated.length} من {filtered.length} مركبة
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 ${
                        page === p
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_12px_color-mix(in_srgb,var(--primary)_30%,transparent)]'
                          : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}

                {totalPages > 5 && (
                  <>
                    <span className="text-[var(--muted-foreground)] text-xs px-1">…</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

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
        </div>
      </div>
    </div>
  )
}
