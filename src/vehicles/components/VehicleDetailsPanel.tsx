import { useState } from 'react'
import type { Vehicle } from '../types'

/* ─── Map preview SVG ──────────────────────────────────────────────── */
function MapPreview() {
  return (
    <div className="relative w-full h-[160px] rounded-xl overflow-hidden bg-[#0a1628]">
      <svg viewBox="0 0 300 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Base map layer */}
        <rect width="300" height="160" fill="#0a1628"/>
        {/* City grid - subtle blocks */}
        <rect x="20" y="20" width="55" height="40" rx="2" fill="#0d1e38" opacity="0.8"/>
        <rect x="90" y="10" width="60" height="35" rx="2" fill="#0d1e38" opacity="0.8"/>
        <rect x="165" y="20" width="50" height="45" rx="2" fill="#0d1e38" opacity="0.8"/>
        <rect x="225" y="15" width="55" height="30" rx="2" fill="#0d1e38" opacity="0.8"/>
        <rect x="10" y="90" width="70" height="45" rx="2" fill="#0d1e38" opacity="0.8"/>
        <rect x="100" y="85" width="55" height="50" rx="2" fill="#0d1e38" opacity="0.8"/>
        <rect x="175" y="90" width="60" height="45" rx="2" fill="#0d1e38" opacity="0.8"/>
        <rect x="248" y="80" width="45" height="55" rx="2" fill="#0d1e38" opacity="0.8"/>
        {/* Major roads */}
        <line x1="0" y1="70" x2="300" y2="68" stroke="#162848" strokeWidth="5"/>
        <line x1="155" y1="0" x2="150" y2="160" stroke="#162848" strokeWidth="5"/>
        {/* Secondary roads */}
        <line x1="0" y1="20" x2="300" y2="18" stroke="#122040" strokeWidth="2.5"/>
        <line x1="0" y1="105" x2="300" y2="103" stroke="#122040" strokeWidth="2.5"/>
        <line x1="80" y1="0" x2="78" y2="160" stroke="#122040" strokeWidth="2.5"/>
        <line x1="220" y1="0" x2="218" y2="160" stroke="#122040" strokeWidth="2.5"/>
        {/* Diagonal road */}
        <line x1="0" y1="140" x2="200" y2="10" stroke="#122040" strokeWidth="2"/>
        {/* Intersection highlights */}
        <circle cx="150" cy="68" r="4" fill="#162848"/>
        <circle cx="80" cy="68" r="3" fill="#162848"/>
        <circle cx="218" cy="68" r="3" fill="#162848"/>
        {/* GPS trail - past path, dashed */}
        <path d="M40,148 L60,128 L78,110 L95,98 L112,88 L135,78 L150,72"
              stroke="#00e8b4" strokeWidth="2" fill="none" strokeDasharray="5,3" opacity="0.5"/>
        {/* GPS trail - recent path, solid */}
        <path d="M150,72 L165,66 L182,60 L198,55"
              stroke="#00e8b4" strokeWidth="2.5" fill="none"/>
        {/* Glow effect on trail */}
        <path d="M150,72 L165,66 L182,60 L198,55"
              stroke="#00e8b4" strokeWidth="8" fill="none" opacity="0.1"/>
        {/* Past waypoints */}
        <circle cx="78" cy="110" r="3" fill="#1d6b62"/>
        <circle cx="112" cy="88" r="3" fill="#1d6b62"/>
        <circle cx="150" cy="72" r="3" fill="#1d6b62"/>
        {/* Vehicle position - pulsing */}
        <circle cx="198" cy="55" r="12" fill="#00e8b4" opacity="0.15"/>
        <circle cx="198" cy="55" r="7"  fill="#00e8b4" opacity="0.3"/>
        <circle cx="198" cy="55" r="5"  fill="#00e8b4"/>
        <circle cx="198" cy="55" r="2.5" fill="#041319"/>
        {/* مباشر badge */}
        <rect x="220" y="8" width="68" height="20" rx="10" fill="#00e8b4"/>
        <text x="254" y="22" textAnchor="middle" fill="#041319" fontSize="9" fontWeight="700" fontFamily="system-ui">مباشر</text>
        {/* Origin marker */}
        <rect x="36" y="140" width="8" height="8" rx="1" fill="#86a3ad"/>
        <rect x="38" y="132" width="4" height="10" fill="#86a3ad"/>
        <circle cx="40" cy="130" r="5" fill="#86a3ad"/>
        <circle cx="40" cy="130" r="2.5" fill="#041319"/>
      </svg>

      {/* Overlay controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1" dir="rtl">
        {['+', '−', '⊙'].map(icon => (
          <button key={icon} className="w-6 h-6 flex items-center justify-center bg-[var(--card)] border border-[var(--border)] rounded text-[var(--foreground)] text-xs hover:bg-[var(--secondary)] transition-colors">
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Tab config ────────────────────────────────────────────────────── */
const tabs = [
  { id: 'overview',  label: 'نظرة عامة' },
  { id: 'location',  label: 'الموقع' },
  { id: 'trips',     label: 'الرحلات' },
  { id: 'alerts',    label: 'التنبيهات' },
]

/* ─── Stat block ────────────────────────────────────────────────────── */
function StatBlock({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[var(--secondary)] rounded-xl p-3 flex flex-col items-center gap-1.5 text-center border border-[var(--border)]">
      <div className={`${accent ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>{icon}</div>
      <p className={`text-base font-bold leading-none ${accent ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>{value}</p>
      <p className="text-[10px] text-[var(--muted-foreground)]">{label}</p>
    </div>
  )
}

/* ─── Main panel ────────────────────────────────────────────────────── */
interface VehicleDetailsPanelProps {
  vehicle: Vehicle
  onClose: () => void
}

export default function VehicleDetailsPanel({ vehicle, onClose }: VehicleDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="w-[300px] flex-shrink-0 bg-[var(--card)] border-r border-[var(--border)] flex flex-col overflow-hidden animate-slide-in" dir="rtl">
      {/* Panel header */}
      <div className="p-4 border-b border-[var(--border)] flex-shrink-0">
        {/* Status + close */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse-dot"/>
            <span className="text-[11px] font-medium text-[var(--primary)]">
              {vehicle.status === 'moving' ? 'قيد الحركة' : vehicle.status === 'stopped' ? 'متوقفة' : 'تحتاج متابعة'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Vehicle identity */}
        <div className="flex items-start gap-3">
          {/* Compact vehicle image */}
          <div className="w-20 h-12 flex-shrink-0 bg-[var(--secondary)] rounded-lg overflow-hidden p-1">
            <img
              src="/assets/vehicle-placeholder.png"
              alt={vehicle.name}
              className="w-full h-full object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="w-full h-full flex items-center justify-center -mt-8 opacity-70">
              <svg viewBox="0 0 200 88" className="w-full h-full" fill="none">
                <path d="M10,72 L10,48 L14,36 L22,26 L32,20 L148,18 L162,22 L172,30 L180,44 L184,58 L184,72 Z" fill="#dae6f2"/>
                <circle cx="42" cy="72" r="15" fill="#1c2530"/><circle cx="158" cy="72" r="15" fill="#1c2530"/>
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <h2 className="text-base font-bold text-[var(--foreground)] leading-tight">{vehicle.name}</h2>
            <p className="text-xs text-[var(--muted-foreground)] font-mono mb-2">{vehicle.plate}</p>
            {/* Driver + call */}
            <div className="flex items-center justify-between">
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] border border-[color-mix(in_srgb,var(--primary)_25%,transparent)] text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_20%,transparent)] transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.6 10.8z"/>
                </svg>
              </button>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-[var(--background)]"
                  style={{ backgroundColor: vehicle.driver.color }}
                >{vehicle.driver.initials}</div>
                <span className="text-xs text-[var(--foreground)] truncate max-w-[100px]">{vehicle.driver.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] flex-shrink-0 px-2 pt-1" dir="rtl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[10px] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Stat blocks */}
            <div className="grid grid-cols-3 gap-2">
              <StatBlock
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                label="السرعة"
                value={`${vehicle.speed} كم/س`}
                accent={vehicle.speed > 0}
              />
              <StatBlock
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="11" rx="2"/><path d="M22 11h2v4h-2"/></svg>}
                label="البطارية"
                value={`${vehicle.battery}%`}
              />
              <StatBlock
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                label="GPS"
                value={vehicle.signal}
              />
            </div>

            {/* Map preview */}
            <div>
              <MapPreview/>
              <button className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] border border-[color-mix(in_srgb,var(--primary)_20%,transparent)] rounded-xl text-xs text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] transition-colors font-medium">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                عرض المسار الكامل
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            {/* Footer stats */}
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="flex">
                <div className="flex-1 p-3 text-center border-l border-[var(--border)]">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <svg className="w-3.5 h-3.5 text-[var(--primary)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    <span className="text-[10px] text-[var(--muted-foreground)]">الرياض</span>
                  </div>
                  <p className="text-[10px] text-[var(--muted-foreground)] truncate">{vehicle.lastTrip}</p>
                </div>
                <div className="flex-1 p-3 text-center border-l border-[var(--border)]">
                  <p className="text-xs font-bold text-[var(--foreground)] mb-0.5">{vehicle.distance} كم</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">المسافة اليوم</p>
                </div>
                <div className="flex-1 p-3 text-center">
                  <p className="text-xs font-bold text-[var(--foreground)] mb-0.5">{vehicle.lastSeen}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">آخر تحديث</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="animate-fade-in-up space-y-3">
            <MapPreview/>
            <div className="bg-[var(--secondary)] rounded-xl p-3 border border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--foreground)] mb-1">{vehicle.lastTrip}</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">{vehicle.location} · {vehicle.lastSeen}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse-dot"/>
                <span className="text-[11px] text-[var(--primary)]">تتبع مباشر نشط</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="animate-fade-in-up space-y-2">
            {[
              { from: 'مستودع الرياض', to: 'العليا', dist: `${vehicle.distance} كم`, time: vehicle.lastSeen, active: true },
              { from: 'العليا', to: 'المدينة الصناعية', dist: '34 كم', time: 'اليوم 09:15', active: false },
              { from: 'المدينة الصناعية', to: 'مستودع الرياض', dist: '36 كم', time: 'اليوم 07:00', active: false },
            ].map((trip, i) => (
              <div key={i} className={`p-3 rounded-xl border ${trip.active ? 'bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] border-[color-mix(in_srgb,var(--primary)_20%,transparent)]' : 'bg-[var(--secondary)] border-[var(--border)]'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[var(--muted-foreground)]">{trip.time}</span>
                  {trip.active && <span className="text-[10px] text-[var(--primary)] font-medium">● نشطة</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"/>
                    <div className="w-px h-5 bg-[var(--border)]"/>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)]"/>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-medium text-[var(--foreground)]">{trip.from}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{trip.to}</p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] flex-shrink-0">{trip.dist}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="animate-fade-in-up space-y-2">
            {vehicle.status === 'needs_attention' ? (
              <>
                <div className="p-3 rounded-xl bg-[color-mix(in_srgb,var(--color-amber)_8%,transparent)] border border-[color-mix(in_srgb,var(--color-amber)_25%,transparent)]">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-[var(--color-amber)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" /></svg>
                    <span className="text-xs font-semibold text-[var(--color-amber)]">مستوى الوقود منخفض</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">مستوى الوقود {vehicle.fuel}% · يحتاج إلى تزويد بالوقود</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{vehicle.lastSeen}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--secondary)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-[var(--muted-foreground)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <span className="text-xs font-medium text-[var(--foreground)]">إشارة GPS ضعيفة</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">جودة الإشارة منخفضة في المنطقة الحالية</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg className="w-8 h-8 text-[var(--muted-foreground)] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p className="text-sm font-medium text-[var(--foreground)]">لا توجد تنبيهات</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">هذه المركبة تعمل بشكل طبيعي</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer expand */}
      <div className="border-t border-[var(--border)] p-3 flex-shrink-0">
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          مزيد من التفاصيل
        </button>
      </div>
    </div>
  )
}
