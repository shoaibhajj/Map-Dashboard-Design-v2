import { useState } from 'react'
import type { Vehicle } from '../types'

/* ─── SVG vehicle silhouettes ─────────────────────────────────────── */
function PickupSVG() {
  return (
    <svg viewBox="0 0 200 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="84" rx="88" ry="5" fill="rgba(0,0,0,0.25)"/>
      {/* Bed */}
      <rect x="10" y="40" width="72" height="28" rx="3" fill="#c8d4de"/>
      <rect x="12" y="42" width="16" height="24" fill="#b8c4ce"/>
      <rect x="30" y="42" width="16" height="24" fill="#b8c4ce"/>
      <rect x="50" y="42" width="14" height="24" fill="#b8c4ce"/>
      <rect x="10" y="38" width="72" height="4" rx="1" fill="#dce8f4"/>
      {/* Cab body */}
      <path d="M82,68 L82,36 L88,28 L98,22 L132,20 L148,24 L160,34 L170,42 L174,52 L174,68 Z" fill="#dce8f4"/>
      {/* Cab roof */}
      <path d="M88,28 L98,22 L132,20 L146,24 L155,32 L82,34 Z" fill="#c4d4e8"/>
      {/* Windshield */}
      <path d="M108,22 L132,20 L145,24 L153,32 L130,38 L95,38 Z" fill="#2d4a6a" opacity="0.52"/>
      {/* Rear cab glass */}
      <path d="M82,34 L88,26 L104,23 L96,38 Z" fill="#2d4a6a" opacity="0.4"/>
      {/* Hood */}
      <path d="M158,34 L170,42 L174,52 L172,44 L164,36 Z" fill="#c0d0e0"/>
      {/* Front bumper */}
      <rect x="172" y="46" width="8" height="20" rx="2" fill="#d0dce8"/>
      <rect x="174" y="50" width="4" height="3" rx="1" fill="#708090" opacity="0.5"/>
      <rect x="174" y="55" width="4" height="3" rx="1" fill="#708090" opacity="0.5"/>
      {/* Wheel arches */}
      <circle cx="40"  cy="68" r="18" fill="#041319"/>
      <circle cx="152" cy="68" r="18" fill="#041319"/>
      {/* Rear wheel */}
      <circle cx="40" cy="68" r="14" fill="#1c2530"/>
      <circle cx="40" cy="68" r="8"  fill="#28323e"/>
      <circle cx="40" cy="68" r="3.5" fill="#5a6a78"/>
      <line x1="40" y1="60" x2="40" y2="76" stroke="#3a4858" strokeWidth="1.5"/>
      <line x1="32" y1="68" x2="48" y2="68" stroke="#3a4858" strokeWidth="1.5"/>
      {/* Front wheel */}
      <circle cx="152" cy="68" r="14" fill="#1c2530"/>
      <circle cx="152" cy="68" r="8"  fill="#28323e"/>
      <circle cx="152" cy="68" r="3.5" fill="#5a6a78"/>
      <line x1="152" y1="60" x2="152" y2="76" stroke="#3a4858" strokeWidth="1.5"/>
      <line x1="144" y1="68" x2="160" y2="68" stroke="#3a4858" strokeWidth="1.5"/>
      {/* Headlight */}
      <rect x="178" y="48" width="3" height="9" rx="1" fill="#fff9c4" opacity="0.8"/>
      {/* Taillight */}
      <rect x="10" y="44" width="2" height="9" rx="1" fill="#ff6666" opacity="0.5"/>
      {/* Hitch */}
      <rect x="6" y="65" width="7" height="3" rx="1.5" fill="#8090a0"/>
    </svg>
  )
}

function SedanSVG() {
  return (
    <svg viewBox="0 0 200 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="84" rx="88" ry="5" fill="rgba(0,0,0,0.25)"/>
      {/* Body */}
      <path d="M14,72 L14,56 L18,50 L28,44 L58,38 L72,30 L82,24 L122,22 L142,26 L158,36 L168,48 L174,58 L174,72 Z" fill="#dde8f2"/>
      {/* Roof */}
      <path d="M72,30 L82,24 L122,22 L140,26 L152,34 L68,36 Z" fill="#c8d8ea"/>
      {/* Windshield */}
      <path d="M108,23 L122,22 L140,26 L150,34 L130,40 L95,40 Z" fill="#2d4a6a" opacity="0.52"/>
      {/* Rear window */}
      <path d="M68,36 L72,30 L94,24 L72,40 Z" fill="#2d4a6a" opacity="0.4"/>
      {/* Hood */}
      <path d="M155,36 L168,48 L174,58 L172,50 L162,38 Z" fill="#c4d4e8"/>
      {/* Front bumper */}
      <path d="M172,58 L176,58 L178,62 L178,72 L172,72 Z" fill="#d0dce8"/>
      {/* Door line */}
      <line x1="112" y1="38" x2="110" y2="72" stroke="#b8c8d8" strokeWidth="0.8" opacity="0.6"/>
      <line x1="78"  y1="38" x2="76"  y2="72" stroke="#b8c8d8" strokeWidth="0.8" opacity="0.6"/>
      {/* Side mirror */}
      <rect x="153" y="36" width="7" height="4" rx="1" fill="#c0ccd8"/>
      {/* Wheel arches */}
      <circle cx="44"  cy="72" r="17" fill="#041319"/>
      <circle cx="152" cy="72" r="17" fill="#041319"/>
      {/* Rear wheel */}
      <circle cx="44"  cy="72" r="13" fill="#1c2530"/>
      <circle cx="44"  cy="72" r="7.5" fill="#28323e"/>
      <circle cx="44"  cy="72" r="3"   fill="#5a6a78"/>
      {/* Front wheel */}
      <circle cx="152" cy="72" r="13" fill="#1c2530"/>
      <circle cx="152" cy="72" r="7.5" fill="#28323e"/>
      <circle cx="152" cy="72" r="3"   fill="#5a6a78"/>
      {/* Headlight */}
      <rect x="176" y="52" width="3" height="9" rx="1" fill="#fff9c4" opacity="0.8"/>
      {/* Taillight */}
      <rect x="14" y="54" width="2" height="9" rx="1" fill="#ff6666" opacity="0.5"/>
    </svg>
  )
}

function VanSVG() {
  return (
    <svg viewBox="0 0 200 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="84" rx="88" ry="5" fill="rgba(0,0,0,0.25)"/>
      {/* Main body */}
      <path d="M12,72 L12,22 L16,16 L22,12 L148,12 L155,16 L164,24 L172,36 L176,50 L178,62 L178,72 Z" fill="#d8e4f0"/>
      {/* Roof */}
      <rect x="16" y="10" width="140" height="5" rx="2" fill="#c4d4e4"/>
      {/* Windshield (angled) */}
      <path d="M152,14 L162,22 L170,34 L178,50 L178,18 L155,12 Z" fill="#2d4a6a" opacity="0.5"/>
      {/* Side windows */}
      <rect x="24" y="18" width="56" height="22" rx="2" fill="#2d4a6a" opacity="0.38"/>
      <rect x="86" y="18" width="52" height="22" rx="2" fill="#2d4a6a" opacity="0.38"/>
      {/* Rear door */}
      <rect x="14" y="18" width="8" height="52" fill="none" stroke="#b8c8d8" strokeWidth="0.8"/>
      {/* Sliding door line */}
      <line x1="84" y1="14" x2="82" y2="72" stroke="#b8c8d8" strokeWidth="0.8" opacity="0.6"/>
      {/* Hood detail */}
      <path d="M162,24 L176,50 L178,62 L176,44 L168,28 Z" fill="#c0d0e0"/>
      {/* Front grille */}
      <rect x="176" y="50" width="4" height="20" rx="1" fill="#c8d8e8"/>
      <rect x="177" y="54" width="2" height="4" rx="0.5" fill="#7090a8" opacity="0.5"/>
      <rect x="177" y="60" width="2" height="4" rx="0.5" fill="#7090a8" opacity="0.5"/>
      {/* Wheel arches */}
      <circle cx="38"  cy="72" r="16" fill="#041319"/>
      <circle cx="155" cy="72" r="16" fill="#041319"/>
      {/* Rear wheel */}
      <circle cx="38"  cy="72" r="12" fill="#1c2530"/>
      <circle cx="38"  cy="72" r="7"  fill="#28323e"/>
      <circle cx="38"  cy="72" r="3"  fill="#5a6a78"/>
      {/* Front wheel */}
      <circle cx="155" cy="72" r="12" fill="#1c2530"/>
      <circle cx="155" cy="72" r="7"  fill="#28323e"/>
      <circle cx="155" cy="72" r="3"  fill="#5a6a78"/>
      {/* Headlight */}
      <rect x="178" y="52" width="3" height="10" rx="1" fill="#fff9c4" opacity="0.8"/>
      {/* Taillight */}
      <rect x="12" y="50" width="2" height="12" rx="1" fill="#ff6666" opacity="0.5"/>
    </svg>
  )
}

function SUVSVG() {
  return (
    <svg viewBox="0 0 200 88" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="84" rx="88" ry="5" fill="rgba(0,0,0,0.25)"/>
      {/* Body */}
      <path d="M10,72 L10,48 L14,36 L22,26 L32,20 L148,18 L162,22 L172,30 L180,44 L184,58 L184,72 Z" fill="#dae6f2"/>
      {/* Roof */}
      <path d="M26,22 L32,20 L148,18 L160,20 L168,26 L22,26 Z" fill="#c6d6ea"/>
      {/* Roof rack */}
      <rect x="34" y="17" width="112" height="2" rx="1" fill="#a0b0c0" opacity="0.6"/>
      {/* Windshield */}
      <path d="M120,18 L148,18 L160,20 L168,26 L155,34 L116,34 Z" fill="#2d4a6a" opacity="0.52"/>
      {/* Rear glass */}
      <path d="M22,26 L32,20 L113,18 L112,34 L20,34 Z" fill="#2d4a6a" opacity="0.42"/>
      {/* Hood */}
      <path d="M166,26 L180,44 L184,58 L182,48 L174,32 Z" fill="#c0d0e2"/>
      {/* Front grille */}
      <rect x="182" y="50" width="4" height="20" rx="1" fill="#c8d8e8"/>
      <rect x="183" y="54" width="2" height="4" rx="0.5" fill="#7090a8" opacity="0.5"/>
      <rect x="183" y="60" width="2" height="4" rx="0.5" fill="#7090a8" opacity="0.5"/>
      {/* Body line */}
      <path d="M12,50 L182,52" stroke="#c0d0e2" strokeWidth="0.8" opacity="0.5"/>
      {/* Door lines */}
      <line x1="108" y1="26" x2="106" y2="72" stroke="#b4c4d4" strokeWidth="0.8" opacity="0.55"/>
      <line x1="68"  y1="26" x2="66"  y2="72" stroke="#b4c4d4" strokeWidth="0.8" opacity="0.55"/>
      {/* Side mirror */}
      <rect x="162" y="28" width="8" height="5" rx="1" fill="#b8c8d8"/>
      {/* Wheel arches */}
      <circle cx="42"  cy="72" r="19" fill="#041319"/>
      <circle cx="158" cy="72" r="19" fill="#041319"/>
      {/* Rear wheel */}
      <circle cx="42"  cy="72" r="15" fill="#1c2530"/>
      <circle cx="42"  cy="72" r="9"  fill="#28323e"/>
      <circle cx="42"  cy="72" r="4"  fill="#5a6a78"/>
      <line x1="42"  y1="63" x2="42"  y2="81" stroke="#3a4858" strokeWidth="1.5"/>
      <line x1="33"  y1="72" x2="51"  y2="72" stroke="#3a4858" strokeWidth="1.5"/>
      {/* Front wheel */}
      <circle cx="158" cy="72" r="15" fill="#1c2530"/>
      <circle cx="158" cy="72" r="9"  fill="#28323e"/>
      <circle cx="158" cy="72" r="4"  fill="#5a6a78"/>
      <line x1="158" y1="63" x2="158" y2="81" stroke="#3a4858" strokeWidth="1.5"/>
      <line x1="149" y1="72" x2="167" y2="72" stroke="#3a4858" strokeWidth="1.5"/>
      {/* Headlight */}
      <rect x="182" y="46" width="3" height="10" rx="1" fill="#fff9c4" opacity="0.8"/>
      {/* Taillight */}
      <rect x="10" y="46" width="2" height="10" rx="1" fill="#ff6666" opacity="0.5"/>
    </svg>
  )
}

const vehicleSVGs = { pickup: PickupSVG, sedan: SedanSVG, van: VanSVG, suv: SUVSVG }

/* ─── Status badge ─────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Vehicle['status'] }) {
  const cfg = {
    moving:          { label: 'قيد الحركة', dot: 'bg-[var(--primary)] animate-pulse-dot', text: 'text-[var(--primary)]',  bg: 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]', border: 'border-[color-mix(in_srgb,var(--primary)_25%,transparent)]' },
    stopped:         { label: 'متوقفة',     dot: 'bg-[var(--muted-foreground)]',           text: 'text-[var(--muted-foreground)]', bg: 'bg-[var(--secondary)]', border: 'border-[var(--border)]' },
    needs_attention: { label: 'تحتاج متابعة', dot: 'bg-[var(--color-amber)]',             text: 'text-[var(--color-amber)]', bg: 'bg-[color-mix(in_srgb,var(--color-amber)_10%,transparent)]', border: 'border-[color-mix(in_srgb,var(--color-amber)_25%,transparent)]' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${c.bg} ${c.border} ${c.text}`} dir="rtl">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`}/>
      {c.label}
    </span>
  )
}

/* ─── Fuel bar ─────────────────────────────────────────────────────── */
function FuelBar({ level }: { level: number }) {
  const color = level <= 15 ? 'bg-[var(--color-red)]' : level <= 40 ? 'bg-[var(--color-amber)]' : 'bg-[var(--primary)]'
  return (
    <div className="flex items-center gap-1" title={`الوقود ${level}%`}>
      <svg className="w-3 h-3 text-[var(--muted-foreground)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 22V8l7-6 7 6v14H3z" strokeLinejoin="round"/>
        <path d="M14 22v-7a2 2 0 00-2-2H8a2 2 0 00-2 2v7" strokeLinejoin="round"/>
        <path d="M18 5l2 2v3a1 1 0 001 1h0a1 1 0 001-1V6l-2-3" strokeLinecap="round"/>
        <path d="M21 8h-3" strokeLinecap="round"/>
      </svg>
      <div className="w-10 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${level}%` }}/>
      </div>
    </div>
  )
}

/* ─── Signal bars ───────────────────────────────────────────────────── */
function SignalBars({ level }: { level: Vehicle['signal'] }) {
  const strength = level === 'قوية' ? 3 : level === 'متوسطة' ? 2 : 1
  return (
    <div className="flex items-end gap-[2px]" title={`الإشارة: ${level}`}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={`rounded-[1px] w-[3px] transition-colors ${i <= strength ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
          style={{ height: `${4 + i * 3}px` }}
        />
      ))}
    </div>
  )
}

/* ─── Mini metric progress bar ─────────────────────────────────────── */
function MiniMetric({ label, value, unit, max = 100 }: { label: string; value: number; unit: string; max?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const isLow = pct < 20
  const color = isLow ? 'bg-[var(--color-red)]' : 'bg-[var(--primary)]'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-[var(--muted-foreground)]" dir="rtl">{label}</span>
        <span className="text-xs font-semibold text-[var(--foreground)]" dir="rtl">{value}<span className="text-[10px] text-[var(--muted-foreground)] mr-0.5">{unit}</span></span>
      </div>
      <div className="h-1 bg-[var(--muted)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }}/>
      </div>
    </div>
  )
}

/* ─── Driver avatar ─────────────────────────────────────────────────── */
function DriverAvatar({ driver, size = 'sm' }: { driver: Vehicle['driver']; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-8 h-8 text-xs' : 'w-6 h-6 text-[10px]'
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 border-2 border-[var(--background)]`}
      style={{ backgroundColor: driver.color }}
    >
      {driver.initials}
    </div>
  )
}

/* ─── VehicleCard ───────────────────────────────────────────────────── */
interface VehicleCardProps {
  vehicle: Vehicle
  isSelected: boolean
  onSelect: (v: Vehicle) => void
}

export default function VehicleCard({ vehicle, isSelected, onSelect }: VehicleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const VehicleSVG = vehicleSVGs[vehicle.type]

  const handleCardClick = () => onSelect(vehicle)
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(x => !x)
  }

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative bg-[var(--card)] border rounded-xl cursor-pointer
        transition-all duration-250
        hover:shadow-[0_4px_24px_color-mix(in_srgb,var(--primary)_10%,transparent)]
        hover:-translate-y-0.5
        ${isSelected
          ? 'border-[var(--primary)] shadow-[0_0_0_1px_var(--primary),0_4px_24px_color-mix(in_srgb,var(--primary)_18%,transparent)]'
          : 'border-[var(--border)] hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)]'
        }
      `}
    >
      {/* Live pulse for moving vehicles */}
      {vehicle.status === 'moving' && isSelected && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-signal"/>
      )}

      <div className="p-3">
        {/* Header: status badge + menu */}
        <div className="flex items-center justify-between mb-2.5">
          <StatusBadge status={vehicle.status}/>
          <button
            onClick={handleExpandClick}
            className={`w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors ${expanded ? 'bg-[var(--secondary)] text-[var(--foreground)]' : ''}`}
            title={expanded ? 'تصغير' : 'توسيع'}
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        {/* Vehicle image + name/plate */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-16 h-10 flex-shrink-0">
            <VehicleSVG/>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-semibold text-[var(--foreground)] leading-tight truncate">{vehicle.name}</p>
            <p className="text-xs text-[var(--muted-foreground)] font-mono">{vehicle.plate}</p>
          </div>
        </div>

        {/* Driver row */}
        <div className="flex items-center gap-2 mb-2.5">
          <DriverAvatar driver={vehicle.driver}/>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-xs font-medium text-[var(--foreground)] leading-tight truncate">{vehicle.driver.name}</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">{vehicle.lastSeen}</p>
          </div>
        </div>

        {/* Footer: location + fuel + signal */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-[var(--primary)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-[10px] text-[var(--muted-foreground)]">{vehicle.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <FuelBar level={vehicle.fuel}/>
            <SignalBars level={vehicle.signal}/>
          </div>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-[var(--border)] px-3 pb-3 pt-2.5 animate-expand-card" dir="rtl">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[var(--secondary)] rounded-lg p-2 text-center">
              <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">السرعة</p>
              <p className="text-sm font-bold text-[var(--primary)]">{vehicle.speed}</p>
              <p className="text-[9px] text-[var(--muted-foreground)]">كم/س</p>
            </div>
            <div className="bg-[var(--secondary)] rounded-lg p-2 text-center">
              <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">البطارية</p>
              <p className="text-sm font-bold text-[var(--foreground)]">{vehicle.battery}%</p>
              <div className="mt-0.5 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${vehicle.battery}%` }}/>
              </div>
            </div>
            <div className="bg-[var(--secondary)] rounded-lg p-2 text-center">
              <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">GPS</p>
              <p className="text-sm font-bold text-[var(--foreground)]">{vehicle.signal}</p>
              <div className="flex justify-center mt-0.5">
                <SignalBars level={vehicle.signal}/>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] border border-[color-mix(in_srgb,var(--primary)_25%,transparent)] rounded-lg text-[10px] text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              عرض على الخريطة
            </button>
            <button
              onClick={e => { e.stopPropagation(); onSelect(vehicle) }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
              تفاصيل
            </button>
            <button
              onClick={e => e.stopPropagation()}
              className="w-8 flex items-center justify-center bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
