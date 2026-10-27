/**
 * vehicleMarkerSVG.ts
 * 
 * High-performance 2.5D SVG generators for GPS / IoT vehicle markers.
 * Complies with:
 * 1. Shared Far Arrow (sleek needle, 2.5D bevels, NO rear triangle)
 * 2. Five Near 2.5D vehicle silhouettes with true proportional scale hierarchy:
 *    - Car (compact: sedan, SUV, pickup)
 *    - Van (medium: utility cargo, ribbed roof)
 *    - Bus (elongated: passenger transit coach, panoramic glass, dual HVAC)
 *    - Truck (heavy articulated: tractor cab + fifth-wheel chassis gap + container trailer)
 *    - Bike (two-wheeler: slim motorcycle/bicycle with rider and dual wheels)
 * 3. Dynamic color theme reactivity (adapts to project green / mint / status color)
 * 4. Dark / Light mode auto-adaptation
 * 5. External selection: selection is handled via wrapper classes & HUD frames, NOT baked inside the SVG.
 */

export type VehicleMarkerType = 'car' | 'van' | 'bus' | 'truck' | 'bike'

export interface VehicleMarkerOptions {
  type: VehicleMarkerType | 'motorcycle' // supports legacy 'motorcycle'
  isFar?: boolean
  darkMode?: boolean
  themeColor?: string
  heading?: number
  selected?: boolean
  className?: string
}

/** Normalize input vehicle type to the 5 approved categories */
export function normalizeVehicleType(type: string): VehicleMarkerType {
  const t = type.toLowerCase()
  if (t === 'truck') return 'truck'
  if (t === 'bus') return 'bus'
  if (t === 'van') return 'van'
  if (t === 'bike' || t === 'motorcycle' || t === 'bicycle') return 'bike'
  return 'car' // includes car, sedan, suv, pickup
}

/** 1. Shared Far Arrow SVG (Clean 2.5D needle, no rear triangle) */
export function getFarArrowSVG(options: { themeColor?: string; darkMode?: boolean } = {}): string {
  const color = options.themeColor || 'var(--marker-color, #22c55e)'
  const shadowOpacity = options.darkMode ? '0.65' : '0.4'
  const coreBg = options.darkMode ? '#05181e' : '#0a2a33'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48" class="vehicle-glyph far-arrow-glyph" style="--marker-color:${color};">
  <defs>
    <filter id="fa-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="3.5" flood-color="rgba(0,0,0,${shadowOpacity})"/>
    </filter>
  </defs>
  <path d="M32 12 L50 50 L32 41 L14 50 Z" fill="rgba(0,0,0,${shadowOpacity})" filter="url(#fa-shadow)"/>
  <path d="M32 10 L14 48 L32 39 Z" fill="${color}" fill-opacity="0.82" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M32 10 L50 48 L32 39 Z" fill="${color}" stroke="#ffffff" stroke-width="0.8" stroke-linejoin="round"/>
  <line x1="32" y1="12" x2="32" y2="38" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>
  <circle cx="32" cy="27" r="3.2" fill="${coreBg}" stroke="#ffffff" stroke-width="0.8"/>
  <circle cx="32" cy="27" r="1.6" fill="${color}"/>
</svg>`
}

/** 2A. Near Car 2.5D (Compact: Sedan, SUV, Pickup) */
export function getNearCarSVG(options: { themeColor?: string; darkMode?: boolean } = {}): string {
  const color = options.themeColor || 'var(--marker-color, #22c55e)'
  const dark = !!options.darkMode
  const bodyTop = dark ? '#e0ecf0' : '#ffffff'
  const bodyMid = dark ? '#7e9ca4' : '#c1d5db'
  const bodyDark = dark ? '#476269' : '#8ba5ac'
  const chassisSide = dark ? '#344b51' : '#58747c'
  const stroke = dark ? '#bad2d7' : '#e4f6f8'
  const shadowOp = dark ? '0.65' : '0.4'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 76" width="46" height="62" class="vehicle-glyph near-car-glyph" style="--marker-color:${color};">
  <defs>
    <linearGradient id="c-body" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="${bodyTop}"/>
      <stop offset="35%" stop-color="${bodyTop}" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="${bodyMid}"/>
      <stop offset="100%" stop-color="${bodyDark}"/>
    </linearGradient>
    <linearGradient id="c-glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b252c"/><stop offset="50%" stop-color="#133f4a"/><stop offset="100%" stop-color="#071c22"/>
    </linearGradient>
  </defs>
  <ellipse cx="29" cy="43" rx="19" ry="30" fill="rgba(0,0,0,${shadowOp})"/>
  <rect x="9" y="19" width="3.5" height="10" rx="1.5" fill="#131e21"/>
  <rect x="43.5" y="19" width="3.5" height="10" rx="1.5" fill="#131e21"/>
  <rect x="9" y="48" width="3.5" height="10" rx="1.5" fill="#131e21"/>
  <rect x="43.5" y="48" width="3.5" height="10" rx="1.5" fill="#131e21"/>
  <path d="M11 26 L7 28 L8 31 L12 29 Z" fill="#648087"/>
  <path d="M45 26 L49 28 L48 31 L44 29 Z" fill="#9db9bf"/>
  <path d="M18 9 Q28 4 38 9 L44 20 L45 60 Q44 69 37 71 L19 71 Q12 69 11 60 L12 20 Z" fill="${chassisSide}"/>
  <path d="M18 7 Q28 2 38 7 L43 18 L44 58 Q43 67 36 69 L20 69 Q13 67 12 58 L13 18 Z" fill="url(#c-body)" stroke="${stroke}" stroke-width="1.2"/>
  <path d="M15 8 L21 9 L20 12 L14 10 Z" fill="${color}"/>
  <path d="M41 8 L35 9 L36 12 L42 10 Z" fill="${color}"/>
  <path d="M18 21 Q28 18 38 21 L40 31 Q28 29 16 31 Z" fill="url(#c-glass)" stroke="#4a7c87" stroke-width="0.8"/>
  <path d="M20 22 L24 21 L21 30 L18 30 Z" fill="#88cbda" opacity="0.55"/>
  <path d="M16 31 Q28 29 40 31 L39 48 Q28 47 17 48 Z" fill="${bodyMid}" stroke="#bad9de" stroke-width="0.8"/>
  <circle cx="28" cy="39" r="3.2" fill="#0c2930" stroke="${color}" stroke-width="1"/>
  <circle cx="28" cy="39" r="1.6" fill="${color}"/>
  <path d="M17 48 Q28 47 39 48 L38 57 Q28 58 18 57 Z" fill="url(#c-glass)" stroke="#4a7c87" stroke-width="0.8"/>
  <path d="M17 67 Q28 69 39 67" stroke="#ff4d6d" stroke-width="2" stroke-linecap="round"/>
</svg>`
}

/** 2B. Near Van 2.5D (Medium: Utility delivery, ribbed cargo roof) */
export function getNearVanSVG(options: { themeColor?: string; darkMode?: boolean } = {}): string {
  const color = options.themeColor || 'var(--marker-color, #22c55e)'
  const dark = !!options.darkMode
  const bodyTop = dark ? '#dde9ec' : '#fdfefe'
  const bodyMid = dark ? '#78969e' : '#b6ccd2'
  const bodyDark = dark ? '#445f66' : '#809da4'
  const chassisSide = dark ? '#30454b' : '#526e76'
  const stroke = dark ? '#b4cbd0' : '#e4f6f8'
  const shadowOp = dark ? '0.65' : '0.4'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 88" width="50" height="74" class="vehicle-glyph near-van-glyph" style="--marker-color:${color};">
  <defs>
    <linearGradient id="v-body" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="${bodyTop}"/><stop offset="70%" stop-color="${bodyMid}"/><stop offset="100%" stop-color="${bodyDark}"/>
    </linearGradient>
  </defs>
  <ellipse cx="31" cy="49" rx="21" ry="38" fill="rgba(0,0,0,${shadowOp})"/>
  <rect x="8.5" y="21" width="3.5" height="11" rx="1.5" fill="#131e21"/>
  <rect x="48" y="21" width="3.5" height="11" rx="1.5" fill="#131e21"/>
  <rect x="8.5" y="63" width="3.5" height="11" rx="1.5" fill="#131e21"/>
  <rect x="48" y="63" width="3.5" height="11" rx="1.5" fill="#131e21"/>
  <path d="M19 8 Q30 4 41 8 L46 18 V78 Q45 84 39 85 H21 Q15 84 14 78 V18 Z" fill="${chassisSide}"/>
  <path d="M19 6 Q30 2 41 6 L45 16 V76 Q44 82 38 83 H22 Q16 82 15 76 V16 Z" fill="url(#v-body)" stroke="${stroke}" stroke-width="1.2"/>
  <rect x="16" y="7" width="7" height="3" rx="1" fill="${color}"/>
  <rect x="37" y="7" width="7" height="3" rx="1" fill="${color}"/>
  <path d="M18 18 Q30 16 42 18 L43 28 H17 Z" fill="#0d2830" stroke="#4a7c87" stroke-width="0.8"/>
  <rect x="17" y="29" width="26" height="47" rx="1" fill="${bodyMid}"/>
  <line x1="19" y1="38" x2="41" y2="38" stroke="#4a666e" stroke-width="1.4"/>
  <line x1="19" y1="48" x2="41" y2="48" stroke="#4a666e" stroke-width="1.4"/>
  <line x1="19" y1="58" x2="41" y2="58" stroke="#4a666e" stroke-width="1.4"/>
  <line x1="19" y1="68" x2="41" y2="68" stroke="#4a666e" stroke-width="1.4"/>
  <rect x="26" y="31" width="8" height="4" rx="1.5" fill="#0d2830" stroke="${color}" stroke-width="1"/>
  <circle cx="30" cy="33" r="1.3" fill="${color}"/>
  <line x1="30" y1="76" x2="30" y2="83" stroke="#253a40" stroke-width="1.5"/>
  <rect x="19" y="81" width="22" height="2" fill="#1b2f34"/>
  <rect x="15.5" y="77" width="2" height="5" fill="#ff4d6d"/>
  <rect x="42.5" y="77" width="2" height="5" fill="#ff4d6d"/>
</svg>`
}

/** 2C. Near Bus 2.5D (Elongated: Passenger transit, panoramic glass, dual HVAC) */
export function getNearBusSVG(options: { themeColor?: string; darkMode?: boolean } = {}): string {
  const color = options.themeColor || 'var(--marker-color, #22c55e)'
  const dark = !!options.darkMode
  const bodyTop = dark ? '#dde9ec' : '#ffffff'
  const bodyMid = dark ? '#6b8991' : '#a8c1c8'
  const bodyDark = dark ? '#3e565c' : '#739199'
  const chassisSide = dark ? '#2a3e44' : '#4d6970'
  const stroke = dark ? '#abc5cb' : '#eaf8fa'
  const shadowOp = dark ? '0.65' : '0.4'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128" width="46" height="92" class="vehicle-glyph near-bus-glyph" style="--marker-color:${color};">
  <defs>
    <linearGradient id="b-body" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="${bodyTop}"/><stop offset="70%" stop-color="${bodyMid}"/><stop offset="100%" stop-color="${bodyDark}"/>
    </linearGradient>
  </defs>
  <ellipse cx="35" cy="69" rx="23" ry="57" fill="rgba(0,0,0,${shadowOp})"/>
  <rect x="9.5" y="27" width="4" height="13" rx="2" fill="#131e21"/>
  <rect x="50.5" y="27" width="4" height="13" rx="2" fill="#131e21"/>
  <rect x="9.5" y="88" width="4" height="12" rx="1.5" fill="#131e21"/>
  <rect x="50.5" y="88" width="4" height="12" rx="1.5" fill="#131e21"/>
  <rect x="9.5" y="102" width="4" height="12" rx="1.5" fill="#131e21"/>
  <rect x="50.5" y="102" width="4" height="12" rx="1.5" fill="#131e21"/>
  <path d="M20 6 Q32 2 44 6 L50 15 V118 Q49 125 41 126 H23 Q15 125 14 118 V15 Z" fill="${chassisSide}"/>
  <path d="M20 4 Q32 0 44 4 L49 13 V116 Q48 123 40 124 H24 Q16 123 15 116 V13 Z" fill="url(#b-body)" stroke="${stroke}" stroke-width="1.3"/>
  <rect x="18" y="4" width="7" height="3" rx="1" fill="${color}"/>
  <rect x="39" y="4" width="7" height="3" rx="1" fill="${color}"/>
  <rect x="25" y="5" width="14" height="2" fill="#0d2830"/>
  <path d="M18 14 Q32 10 46 14 L47 27 H17 Z" fill="#0b252c" stroke="#4a7c87" stroke-width="1"/>
  <line x1="32" y1="12" x2="32" y2="27" stroke="#1d3d44" stroke-width="1.2"/>
  <rect x="16" y="28" width="2.5" height="84" fill="#10323a"/>
  <rect x="45.5" y="28" width="2.5" height="84" fill="#10323a"/>
  <rect x="22" y="33" width="20" height="23" rx="2.5" fill="#75939b" stroke="#cde3e7" stroke-width="0.8"/>
  <line x1="25" y1="39" x2="39" y2="39" stroke="#3b5258" stroke-width="1.2"/>
  <line x1="25" y1="44" x2="39" y2="44" stroke="#3b5258" stroke-width="1.2"/>
  <line x1="25" y1="49" x2="39" y2="49" stroke="#3b5258" stroke-width="1.2"/>
  <rect x="25" y="61" width="14" height="11" rx="1.5" fill="#9db9bf" stroke="#cde3e7" stroke-width="0.8"/>
  <circle cx="32" cy="77" r="3.2" fill="#0b282f" stroke="${color}" stroke-width="1"/>
  <circle cx="32" cy="77" r="1.6" fill="${color}"/>
  <rect x="22" y="85" width="20" height="22" rx="2.5" fill="#75939b" stroke="#cde3e7" stroke-width="0.8"/>
  <line x1="25" y1="91" x2="39" y2="91" stroke="#3b5258" stroke-width="1.2"/>
  <line x1="25" y1="96" x2="39" y2="96" stroke="#3b5258" stroke-width="1.2"/>
  <rect x="16" y="117" width="3" height="6" fill="#ff4d6d"/>
  <rect x="45" y="117" width="3" height="6" fill="#ff4d6d"/>
</svg>`
}

/** 2D. Near Truck 2.5D (Heavy Articulated: Tractor Cab + Fifth-Wheel Hitch + Cargo Container Trailer) */
export function getNearTruckSVG(options: { themeColor?: string; darkMode?: boolean } = {}): string {
  const color = options.themeColor || 'var(--marker-color, #22c55e)'
  const dark = !!options.darkMode
  const bodyTop = dark ? '#dde9ec' : '#ffffff'
  const bodyMid = dark ? '#658189' : '#9eb6bd'
  const bodyDark = dark ? '#3b4e54' : '#6f8a92'
  const trailerTop = dark ? '#b8cfd4' : '#e6f2f4'
  const trailerMid = dark ? '#5d777e' : '#8eaab0'
  const chassisSide = dark ? '#28383e' : '#506b72'
  const stroke = dark ? '#a2bdc3' : '#eaf8fa'
  const shadowOp = dark ? '0.65' : '0.4'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 136" width="46" height="98" class="vehicle-glyph near-truck-glyph" style="--marker-color:${color};">
  <defs>
    <linearGradient id="t-cab" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="${bodyTop}"/><stop offset="70%" stop-color="${bodyMid}"/><stop offset="100%" stop-color="${bodyDark}"/>
    </linearGradient>
    <linearGradient id="t-tr" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="${trailerTop}"/><stop offset="70%" stop-color="${trailerMid}"/><stop offset="100%" stop-color="#556e75"/>
    </linearGradient>
  </defs>
  <ellipse cx="34" cy="25" rx="22" ry="19" fill="rgba(0,0,0,${shadowOp})"/>
  <rect x="9" y="53" width="48" height="78" rx="6" fill="rgba(0,0,0,${shadowOp})"/>
  <!-- Tractor Cab -->
  <rect x="9.5" y="15" width="4" height="13" rx="2" fill="#131e21"/>
  <rect x="50.5" y="15" width="4" height="13" rx="2" fill="#131e21"/>
  <path d="M19 5 H45 Q49 5 49 13 V39 H15 V13 Q15 5 19 5 Z" fill="${chassisSide}"/>
  <path d="M19 3 H45 Q48 3 48 11 V37 H16 V11 Q16 3 19 3 Z" fill="url(#t-cab)" stroke="${stroke}" stroke-width="1.2"/>
  <rect x="14" y="3" width="36" height="3.5" rx="1" fill="#20343a"/>
  <rect x="16" y="4" width="6" height="2.5" fill="${color}"/>
  <rect x="42" y="4" width="6" height="2.5" fill="${color}"/>
  <path d="M18 10 H46 L45 20 H19 Z" fill="#0b252c" stroke="#4a7c87" stroke-width="0.8"/>
  <path d="M18 21 H46 L44 35 H20 Z" fill="${bodyMid}" stroke="#b0d1d8" stroke-width="0.8"/>
  <rect x="8.5" y="13" width="5.5" height="9" rx="1.5" fill="#2c4248"/>
  <rect x="50" y="13" width="5.5" height="9" rx="1.5" fill="#2c4248"/>
  <!-- Articulation Gap & Hitch -->
  <rect x="23" y="37" width="18" height="17" fill="#101c20"/>
  <rect x="12" y="39" width="9" height="14" rx="2" fill="#58747a" stroke="#9bb7be" stroke-width="0.8"/>
  <rect x="43" y="39" width="9" height="14" rx="2" fill="#58747a" stroke="#9bb7be" stroke-width="0.8"/>
  <circle cx="32" cy="46" r="5.5" fill="#2b434a" stroke="${color}" stroke-width="1.2"/>
  <circle cx="32" cy="46" r="2.2" fill="#0b1e22"/>
  <!-- Trailer Container -->
  <rect x="11" y="53" width="42" height="74" rx="2" fill="${chassisSide}"/>
  <rect x="10" y="51" width="44" height="74" rx="2" fill="url(#t-tr)" stroke="${stroke}" stroke-width="1.3"/>
  <line x1="12" y1="59" x2="52" y2="59" stroke="#4a6369" stroke-width="1.5"/>
  <line x1="12" y1="68" x2="52" y2="68" stroke="#4a6369" stroke-width="1.5"/>
  <line x1="12" y1="77" x2="52" y2="77" stroke="#4a6369" stroke-width="1.5"/>
  <line x1="12" y1="86" x2="52" y2="86" stroke="#4a6369" stroke-width="1.5"/>
  <line x1="12" y1="95" x2="52" y2="95" stroke="#4a6369" stroke-width="1.5"/>
  <line x1="12" y1="104" x2="52" y2="104" stroke="#4a6369" stroke-width="1.5"/>
  <line x1="12" y1="113" x2="52" y2="113" stroke="#4a6369" stroke-width="1.5"/>
  <circle cx="32" cy="55" r="2.8" fill="#0d2830" stroke="${color}" stroke-width="1"/>
  <circle cx="32" cy="55" r="1.4" fill="${color}"/>
  <rect x="6.5" y="94" width="4" height="13" rx="1.5" fill="#131e21"/>
  <rect x="6.5" y="109" width="4" height="13" rx="1.5" fill="#131e21"/>
  <rect x="53.5" y="94" width="4" height="13" rx="1.5" fill="#131e21"/>
  <rect x="53.5" y="109" width="4" height="13" rx="1.5" fill="#131e21"/>
  <rect x="11" y="124" width="42" height="3" fill="#1e3036"/>
  <rect x="13" y="123" width="8" height="2" fill="#ff4d6d"/>
  <rect x="43" y="123" width="8" height="2" fill="#ff4d6d"/>
</svg>`
}

/** 2E. Near Bike 2.5D (Slim Two-Wheeler: Motorcycle & Bicycle with rider) */
export function getNearBikeSVG(options: { themeColor?: string; darkMode?: boolean } = {}): string {
  const color = options.themeColor || 'var(--marker-color, #22c55e)'
  const dark = !!options.darkMode
  const bodyTop = dark ? '#dde9ec' : '#ffffff'
  const bodyMid = dark ? '#6f8d95' : '#adc4cb'
  const shadowOp = dark ? '0.65' : '0.4'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="38" height="52" class="vehicle-glyph near-bike-glyph" style="--marker-color:${color};">
  <defs>
    <linearGradient id="bk-body" x1="0" y1="0" x2="1" y2="0.8">
      <stop offset="0%" stop-color="${bodyTop}"/><stop offset="100%" stop-color="${bodyMid}"/>
    </linearGradient>
  </defs>
  <ellipse cx="25" cy="37" rx="8" ry="26" fill="rgba(0,0,0,${shadowOp})"/>
  <rect x="22" y="8" width="4" height="14" rx="2" fill="#131e21" stroke="#7e9ea5" stroke-width="0.8"/>
  <path d="M21 16 L23 22 M27 16 L25 22" stroke="${color}" stroke-width="1.5"/>
  <path d="M21 8 L27 8 L25 13 L23 13 Z" fill="${color}"/>
  <path d="M13 21 L20 23 L28 23 L35 21" stroke="#e0f4f7" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="13" cy="21" r="1.5" fill="${color}"/>
  <circle cx="35" cy="21" r="1.5" fill="${color}"/>
  <rect x="22" y="21" width="4" height="3" rx="0.5" fill="#0c262e" stroke="${color}" stroke-width="0.8"/>
  <path d="M20 25 Q24 23 28 25 L29 34 Q24 35 19 34 Z" fill="url(#bk-body)" stroke="#dff3f6" stroke-width="1"/>
  <ellipse cx="24" cy="37" rx="4.5" ry="5.5" fill="${bodyTop}" stroke="#719ba3" stroke-width="1"/>
  <path d="M22 34 Q24 33 26 34" stroke="#0e2a33" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M16 38 Q24 40 32 38" stroke="#29464e" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M21 44 H27 L26 50 H22 Z" fill="#1b2e35"/>
  <rect x="22" y="48" width="4" height="14" rx="2" fill="#131e21" stroke="#7e9ea5" stroke-width="0.8"/>
  <rect x="22.5" y="47" width="3" height="2" fill="#ff4d6d"/>
  <circle cx="24" cy="45" r="1.4" fill="${color}"/>
</svg>`
}

/**
 * Main Factory: Builds complete Marker HTML with heading rotation,
 * dynamic theme color, dark/light mode, and EXTERNAL selection overlay.
 */
export function buildVehicleMarkerHTML(options: VehicleMarkerOptions): string {
  const normType = normalizeVehicleType(options.type)
  const isFar = !!options.isFar
  const selected = !!options.selected
  const heading = options.heading ?? 0
  const color = options.themeColor || 'var(--marker-color, #22c55e)'
  const darkClass = options.darkMode ? 'dark' : ''
  const selectedClass = selected ? 'is-selected' : ''
  const customClass = options.className || ''

  // 1. Choose glyph
  let glyphSVG = ''
  if (isFar) {
    glyphSVG = getFarArrowSVG({ themeColor: color, darkMode: options.darkMode })
  } else {
    switch (normType) {
      case 'car': glyphSVG = getNearCarSVG({ themeColor: color, darkMode: options.darkMode }); break
      case 'van': glyphSVG = getNearVanSVG({ themeColor: color, darkMode: options.darkMode }); break
      case 'bus': glyphSVG = getNearBusSVG({ themeColor: color, darkMode: options.darkMode }); break
      case 'truck': glyphSVG = getNearTruckSVG({ themeColor: color, darkMode: options.darkMode }); break
      case 'bike': glyphSVG = getNearBikeSVG({ themeColor: color, darkMode: options.darkMode }); break
    }
  }

  // 2. Wrap in external container with rotation and HUD selection overlay
  // Heading rotates the inner glyph directly to real vehicle course.
  return `<div class="vehicle-marker-wrapper ${selectedClass} ${darkClass} ${customClass}" 
    data-vehicle-type="${normType}" 
    data-view="${isFar ? 'far' : 'near'}" 
    style="--marker-color:${color};"
    tabindex="0"
    role="button"
    aria-label="${normType} vehicle marker">
    <div class="vehicle-marker-rotator" style="transform:rotate(${heading}deg);display:inline-flex;align-items:center;justify-content:center;">
      ${glyphSVG}
    </div>
    <!-- External HUD Selection Brackets Frame (No brackets baked inside SVG) -->
    <div class="vehicle-marker-hud-frame" aria-hidden="true"></div>
  </div>`
}
