import type { SVGProps } from 'react'

export interface CursorDefinition {
  id: string
  nameAr: string
  nameEn: string
  triggerAr: string
  hotspot: string
}

export const GPS_CURSOR_DEFINITIONS: CursorDefinition[] = [
  {
    id: 'default',
    nameAr: 'مؤشر التنقل (سهم الملاحة)',
    nameEn: 'Navigation Arrow',
    triggerAr: 'فوق القوائم، البطاقات (Cards)، والتابات (Tabs)',
    hotspot: '3, 2',
  },
  {
    id: 'grab',
    nameAr: 'يد مفتوحة',
    nameEn: 'Open Hand',
    triggerAr: 'فوق الخريطة في الوضع الافتراضي',
    hotspot: '14, 14',
  },
  {
    id: 'grabbing',
    nameAr: 'يد مقبوضة',
    nameEn: 'Grabbing Hand',
    triggerAr: 'عند الضغط والسحب على الخريطة',
    hotspot: '14, 14',
  },
  {
    id: 'pointer',
    nameAr: 'يد مع رفع السبابة',
    nameEn: 'Pointing Hand',
    triggerAr: 'عند الـ Hover على المركبات والأزرار والروابط',
    hotspot: '8, 2',
  },
  {
    id: 'ns-resize',
    nameAr: 'خط بمثلثين',
    nameEn: 'Vertical Resize',
    triggerAr: 'عند سحب مقبض الـ Bottom Sheet',
    hotspot: '14, 14',
  },
]

// ── 1. Default GPS Navigation Arrow Icon ─────────────────────────────────────
export function GPSNavArrowIcon({ size = 26, accent = 'var(--primary)', ...props }: SVGProps<SVGSVGElement> & { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="icon_s_arrow" x="-25%" y="-25%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
        </filter>
      </defs>
      <g filter="url(#icon_s_arrow)">
        <path d="M 3 2 L 22 11 L 13 14 L 9 24 Z" fill="currentColor" stroke={accent} strokeWidth="2" strokeLinejoin="round" />
        <line x1="3" y1="2" x2="13" y2="14" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ── 2. Telemetry Open Hand Icon (No Radar, Pure Clean Fingers) ───────────────
export function GPSOpenHandIcon({ size = 26, accent = 'var(--primary)', ...props }: SVGProps<SVGSVGElement> & { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="icon_s_open" x="-25%" y="-25%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
        </filter>
      </defs>
      <g filter="url(#icon_s_open)">
        <path
          d="M 8 25 C 7 22, 5 18, 4 15 C 3 13, 5 11.5, 6.8 13.2 L 8.5 15 L 8.5 6 C 8.5 4.5, 11 4.5, 11 6 L 11 12.5 L 12 12.5 L 12 3 C 12 1.5, 14.5 1.5, 14.5 3 L 14.5 12.5 L 15.5 12.5 L 15.5 5 C 15.5 3.5, 18 3.5, 18 5 L 18 13 L 19 13 L 19 8 C 19 6.5, 21.5 6.5, 21.5 8 L 21.5 17 C 21.5 21.5, 18 25.5, 13.5 25.5 Z"
          fill="currentColor"
          stroke={accent}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line x1="11" y1="7" x2="11" y2="14" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="14.5" y1="5" x2="14.5" y2="14" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="18" y1="7" x2="18" y2="15" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="8.5" y1="15" x2="11.5" y2="18" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ── 3. Telemetry Grabbing Hand Icon (No Radar, Clear Knuckles) ───────────────
export function GPSGrabbingHandIcon({ size = 26, accent = 'var(--primary)', ...props }: SVGProps<SVGSVGElement> & { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="icon_s_fist" x="-25%" y="-25%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
        </filter>
      </defs>
      <g filter="url(#icon_s_fist)">
        <path
          d="M 7 24 C 5.5 20.5, 4.5 17, 4.5 14 C 4.5 11.5, 7 10.5, 9 12 L 9.5 12.5 C 9.5 10.5, 11 8.5, 13 8.5 C 14 8.5, 14.8 9, 15.2 9.8 C 15.8 9, 16.8 8.5, 17.8 8.8 C 18.6 9, 19.2 9.8, 19.5 10.8 C 20.2 10.5, 21.5 11, 22 12.2 C 22.5 13.5, 22.5 16, 21.8 18.5 C 20.8 21.8, 17.5 24.5, 13 24.5 Z"
          fill="currentColor"
          stroke={accent}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path d="M 13 8.5 L 13 15" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 16.5 9 L 16.5 15" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 19.5 11 L 19.5 16" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 5 14 C 7.5 12, 10.5 15, 13 17" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ── 4. Telemetry Pointing Hand Icon (Clean Raised Index Finger) ──────────────
export function GPSPointingHandIcon({ size = 26, accent = 'var(--primary)', ...props }: SVGProps<SVGSVGElement> & { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="icon_s_point" x="-25%" y="-25%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
        </filter>
      </defs>
      <g filter="url(#icon_s_point)">
        <path
          d="M 7.5 2 C 6 2, 6 3.8, 6 5.5 L 6 13.5 C 4.5 12.5, 2.8 13.5, 2.8 15.5 C 2.8 17.5, 4.8 19, 7 18 L 7.5 18 L 7.5 23.5 C 7.5 25.5, 10.5 26, 13 26 C 17.5 26, 20 22.5, 20 18.5 L 20 13 C 20 11.5, 18 11.5, 18 13 L 18 13.5 C 17.5 12, 15.5 12, 15.5 13.5 L 15.5 14 C 15 12.5, 13 12.5, 13 14 L 13 14.5 L 10.5 14.5 L 10.5 5.5 C 10.5 3.8, 10.5 2, 9 2 Z"
          fill="currentColor"
          stroke={accent}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line x1="13" y1="14" x2="13" y2="18" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="15.5" y1="14" x2="15.5" y2="18" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="18" y1="13.5" x2="18" y2="17.5" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 4 16 C 6 15.5, 7.5 17.5, 9.5 18.5" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ── 5. BottomSheet Resize Handle Icon ─────────────────────────────────────────
export function GPSVerticalResizeIcon({ size = 26, accent = 'var(--primary)', ...props }: SVGProps<SVGSVGElement> & { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="icon_s_res" x="-25%" y="-25%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.85" />
        </filter>
      </defs>
      <g filter="url(#icon_s_res)">
        <polygon points="14,2 20,8.5 8,8.5" fill="currentColor" stroke={accent} strokeWidth="2" strokeLinejoin="round" />
        <polygon points="14,26 8,19.5 20,19.5" fill="currentColor" stroke={accent} strokeWidth="2" strokeLinejoin="round" />
        <line x1="14" y1="8.5" x2="14" y2="19.5" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="14" cy="14" r="2.5" fill="currentColor" stroke={accent} strokeWidth="1.8" />
      </g>
    </svg>
  )
}
