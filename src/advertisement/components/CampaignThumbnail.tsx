import type { CampaignImageType } from '../types'

/* ── Thumbnail SVG illustrations per campaign type ─────────────────── */

function FleetThumb() {
  return (
    <svg viewBox="0 0 96 56" fill="none" className="w-full h-full">
      <rect width="96" height="56" fill="#0a1e28"/>
      {/* 3 trucks in a row */}
      {[8, 34, 60].map((x, i) => (
        <g key={i} transform={`translate(${x},16)`}>
          <rect x="0" y="10" width="22" height="20" rx="2" fill="#e8f0f4" opacity={1 - i * 0.15}/>
          <rect x="3" y="4" width="12" height="10" rx="1" fill="#c8d8e4" opacity={1 - i * 0.15}/>
          <rect x="4" y="5" width="10" height="6" rx="0.5" fill="#2a5a7a" opacity="0.5"/>
          <circle cx="5"  cy="32" r="4" fill="#1a2a36"/>
          <circle cx="17" cy="32" r="4" fill="#1a2a36"/>
        </g>
      ))}
      {/* Road lines */}
      <line x1="0" y1="48" x2="96" y2="48" stroke="#1a3040" strokeWidth="1.5"/>
      <line x1="12" y1="51" x2="26" y2="51" stroke="#2a4a5a" strokeWidth="0.8" strokeDasharray="4,3"/>
      <line x1="40" y1="51" x2="56" y2="51" stroke="#2a4a5a" strokeWidth="0.8" strokeDasharray="4,3"/>
      <line x1="70" y1="51" x2="84" y2="51" stroke="#2a4a5a" strokeWidth="0.8" strokeDasharray="4,3"/>
      {/* Mint accent glow */}
      <rect x="0" y="0" width="96" height="56" fill="url(#ft-g)"/>
      <defs>
        <radialGradient id="ft-g" cx="0.5" cy="0.3">
          <stop offset="0%" stopColor="#00e8b4" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#00e8b4" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

function TrackingThumb() {
  return (
    <svg viewBox="0 0 96 56" fill="none" className="w-full h-full">
      <rect width="96" height="56" fill="#061828"/>
      {/* Phone outline */}
      <rect x="32" y="4" width="32" height="48" rx="4" fill="#0d2438" stroke="#1a3a50" strokeWidth="0.8"/>
      {/* Map inside phone */}
      <rect x="34" y="10" width="28" height="32" rx="2" fill="#0a1e30"/>
      {/* Map grid */}
      <line x1="34" y1="22" x2="62" y2="22" stroke="#122838" strokeWidth="0.6"/>
      <line x1="34" y1="32" x2="62" y2="32" stroke="#122838" strokeWidth="0.6"/>
      <line x1="48" y1="10" x2="48" y2="42" stroke="#122838" strokeWidth="0.6"/>
      {/* Road */}
      <path d="M34 28 Q42 24 48 26 Q54 28 62 24" stroke="#1a3a50" strokeWidth="2"/>
      {/* GPS pin */}
      <circle cx="50" cy="26" r="5" fill="#00e8b4" opacity="0.2"/>
      <circle cx="50" cy="26" r="3" fill="#00e8b4"/>
      <circle cx="50" cy="26" r="1.5" fill="#061828"/>
      {/* Signal waves */}
      <path d="M44 18 Q48 14 52 18" stroke="#00e8b4" strokeWidth="1" fill="none" opacity="0.6"/>
      <path d="M42 15 Q48 9 54 15"  stroke="#00e8b4" strokeWidth="0.8" fill="none" opacity="0.3"/>
      {/* Home button */}
      <rect x="44" y="46" width="8" height="3" rx="1.5" fill="#1a3a50"/>
    </svg>
  )
}

function FuelThumb() {
  return (
    <svg viewBox="0 0 96 56" fill="none" className="w-full h-full">
      <rect width="96" height="56" fill="#0a1620"/>
      {/* Fuel pump */}
      <rect x="28" y="12" width="22" height="32" rx="2" fill="#0d2230"/>
      <rect x="30" y="14" width="18" height="12" rx="1" fill="#1a3848" stroke="#2a4a58" strokeWidth="0.5"/>
      <rect x="32" y="16" width="14" height="8" rx="0.5" fill="#0a1e2c"/>
      <text x="39" y="23" fill="#00e8b4" fontSize="5" textAnchor="middle" fontFamily="monospace">SAR</text>
      <rect x="50" y="18" width="5" height="18" rx="1" fill="#1a3848"/>
      <path d="M55 20 Q62 20 62 26 L62 32 Q62 36 58 36" stroke="#2a4a58" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="56" y="32" width="4" height="6" rx="1" fill="#1a3848"/>
      {/* Down arrow (cost reduction) */}
      <path d="M62 8 L68 8 L65 14 Z" fill="#00e8b4"/>
      {/* Bar chart trending down then up */}
      <rect x="70" y="22" width="5" height="18" rx="1" fill="#00e8b4" opacity="0.3"/>
      <rect x="77" y="18" width="5" height="22" rx="1" fill="#00e8b4" opacity="0.5"/>
      <rect x="84" y="14" width="5" height="26" rx="1" fill="#00e8b4" opacity="0.8"/>
      <polyline points="72,34 79,28 86,22" stroke="#00e8b4" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function SecurityThumb() {
  return (
    <svg viewBox="0 0 96 56" fill="none" className="w-full h-full">
      <rect width="96" height="56" fill="#081620"/>
      {/* Shield */}
      <path d="M48 8 L62 14 L62 30 Q62 42 48 50 Q34 42 34 30 L34 14 Z" fill="#0d2230" stroke="#1a3848" strokeWidth="0.8"/>
      {/* Shield fill accent */}
      <path d="M48 12 L58 17 L58 30 Q58 39 48 46 Q38 39 38 30 L38 17 Z" fill="color-mix(in srgb,#00e8b4 8%,transparent)"/>
      {/* Check mark */}
      <polyline points="42,28 46,33 55,22" stroke="#00e8b4" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Lock icon small */}
      <rect x="44" y="38" width="8" height="6" rx="1" fill="#00e8b4" opacity="0.6"/>
      <path d="M45 38 L45 36 Q48 33 51 36 L51 38" stroke="#00e8b4" strokeWidth="1.2" fill="none"/>
      {/* Pulse rings */}
      <circle cx="48" cy="30" r="20" stroke="#00e8b4" strokeWidth="0.5" opacity="0.2"/>
      <circle cx="48" cy="30" r="26" stroke="#00e8b4" strokeWidth="0.4" opacity="0.1"/>
      {/* 24h indicator */}
      <text x="18" y="36" fill="#00e8b4" fontSize="6" fontWeight="700" fontFamily="system-ui" opacity="0.6">24h</text>
      <text x="70" y="36" fill="#00e8b4" fontSize="6" fontWeight="700" fontFamily="system-ui" opacity="0.6">GPS</text>
    </svg>
  )
}

function FreeTrialThumb() {
  return (
    <svg viewBox="0 0 96 56" fill="none" className="w-full h-full">
      <rect width="96" height="56" fill="#061a24"/>
      {/* Dashboard mockup */}
      <rect x="12" y="8" width="72" height="40" rx="3" fill="#0d2030" stroke="#1a3848" strokeWidth="0.6"/>
      {/* Top bar */}
      <rect x="12" y="8" width="72" height="8" rx="3" fill="#0a1828"/>
      <circle cx="18" cy="12" r="2" fill="#1a3848"/>
      <rect x="24" y="10" width="20" height="4" rx="1" fill="#1a3848"/>
      {/* Map area */}
      <rect x="14" y="18" width="44" height="28" rx="2" fill="#081420"/>
      <line x1="14" y1="28" x2="58" y2="28" stroke="#122030" strokeWidth="0.8"/>
      <line x1="14" y1="36" x2="58" y2="36" stroke="#122030" strokeWidth="0.8"/>
      <line x1="36" y1="18" x2="36" y2="46" stroke="#122030" strokeWidth="0.8"/>
      <circle cx="40" cy="30" r="5" fill="#00e8b4" opacity="0.2"/>
      <circle cx="40" cy="30" r="2.5" fill="#00e8b4"/>
      {/* Side panel */}
      <rect x="60" y="18" width="22" height="28" rx="2" fill="#0a1e2c"/>
      <rect x="62" y="20" width="18" height="4" rx="1" fill="#1a3848"/>
      <rect x="62" y="26" width="14" height="3" rx="0.5" fill="#00e8b4" opacity="0.7"/>
      <rect x="62" y="31" width="10" height="3" rx="0.5" fill="#1a3848"/>
      <rect x="62" y="36" width="12" height="3" rx="0.5" fill="#1a3848"/>
      {/* Free badge */}
      <rect x="60" y="42" width="20" height="4" rx="2" fill="#00e8b4"/>
      <text x="70" y="45.5" fill="#021216" fontSize="4.5" textAnchor="middle" fontWeight="700" fontFamily="system-ui">مجاني</text>
    </svg>
  )
}

const thumbs: Record<CampaignImageType, React.FC> = {
  fleet: FleetThumb,
  tracking: TrackingThumb,
  fuel: FuelThumb,
  security: SecurityThumb,
  'free-trial': FreeTrialThumb,
}

interface CampaignThumbnailProps {
  type: CampaignImageType
  className?: string
}

export default function CampaignThumbnail({ type, className = '' }: CampaignThumbnailProps) {
  const Thumb = thumbs[type]
  return (
    <div className={`overflow-hidden rounded-lg ${className}`}>
      <Thumb/>
    </div>
  )
}
