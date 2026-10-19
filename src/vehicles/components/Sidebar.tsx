import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import PaletteSwitcher from '../../shared/PaletteSwitcher'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  {
    id: 'home', label: 'الرئيسية',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    id: 'map', label: 'الخريطة',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>,
  },
  {
    id: 'vehicles', label: 'المركبات', active: true,
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    id: 'groups', label: 'المجموعات',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    id: 'drivers', label: 'السائقين',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    id: 'trips', label: 'الرحلات',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    id: 'live', label: 'العمليات المباشرة',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49M7.76 7.76a6 6 0 000 8.49"/><path d="M20.07 4.93a10 10 0 010 14.14M3.93 4.93a10 10 0 000 14.14"/></svg>,
  },
  {
    id: 'reports', label: 'التقارير',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    id: 'ads', label: 'الإعلانات',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 11v2a2 2 0 0 0 2 2h2l4 5V4l-4 5H5a2 2 0 0 0-2 2Z"/><path d="M16 9a4 4 0 0 1 0 6M18 5a9 9 0 0 1 0 14"/></svg>,
  },
  {
    id: 'complaints', label: 'الشكاوى',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    id: 'settings', label: 'الإعدادات',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const routeActive = location.pathname === '/app' ? 'map' : location.pathname === '/app/dashboard' ? 'home' : location.pathname.includes('advertisements') ? 'ads' : 'vehicles'
  const [active, setActive] = useState(routeActive)
  const { isDark, toggleTheme } = useTheme()
  const { t } = useLanguage()

  return (
    <div className="w-[220px] flex-shrink-0 bg-[var(--card)] border-l border-[var(--border)] flex flex-col h-full" dir="rtl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[var(--border)] flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[var(--primary-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-sm font-bold text-[var(--foreground)] tracking-wide">TRIPMONITOR</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActive(item.id)
              const paths: Record<string, string> = { home: '/app/dashboard', vehicles: '/app/vehicles', map: '/app', ads: '/app/advertisements' }
              if (paths[item.id]) navigate(paths[item.id])
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 text-right relative
              transition-all duration-200 group
              ${active === item.id
                ? 'text-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
              }
            `}
          >
            {/* Active indicator - left border in RTL = right visual edge of sidebar content */}
            {active === item.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--primary)] rounded-full"/>
            )}
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="text-[13px] font-medium leading-none">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5 text-[var(--muted-foreground)]">
          <PaletteSwitcher variant="pill" />
          <span className="text-[12px] font-medium">{t('palette_label')}</span>
        </div>
        {/* Help center */}
        <button className="w-full flex items-center gap-3 px-4 py-3 text-right text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
          </svg>
          <span className="text-[13px] font-medium">مركز المساعدة</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 text-right text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
        >
          {isDark ? (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
          <span className="text-[13px] font-medium">{isDark ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
        </button>

        {/* Version */}
        <div className="px-4 py-2.5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse-dot"/>
          <span className="text-[11px] text-[var(--muted-foreground)]">TRIPMONITOR v2.0.0</span>
        </div>
      </div>
    </div>
  )
}
