import { useState } from 'react'
import ThemeToggle from '../../shared/ThemeToggle'
import { useLanguage } from '../../contexts/LanguageContext'

export default function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false)
  const { lang, setLang } = useLanguage()

  return (
    <div className="h-14 flex-shrink-0 bg-[var(--card)] border-b border-[var(--border)] flex items-center px-5 gap-4" dir="ltr">
      {/* User profile (left edge in ltr = right visual start for page) */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-xs font-bold">
          ش
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[var(--foreground)] leading-none" dir="rtl">شعيب</p>
          <p className="text-[10px] text-[var(--muted-foreground)] leading-none mt-0.5" dir="rtl">مدير النظام</p>
        </div>
      </div>

      {/* Notification + message icons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center bg-[var(--color-red)] text-white text-[8px] font-bold rounded-full">3</span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </button>
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex-shrink-0"
      >
        <svg className="w-3 h-3 text-[var(--muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
        {lang === 'ar' ? 'عربي' : 'English'}
        <svg className="w-3 h-3 text-[var(--muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      <ThemeToggle variant="pill" />

      {/* Search bar */}
      <div className="flex-1 max-w-lg mx-auto relative">
        <div className={`flex items-center gap-2 bg-[var(--secondary)] border rounded-xl px-3 py-2 transition-all duration-200 ${searchFocused ? 'border-[var(--primary)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_15%,transparent)]' : 'border-[var(--border)]'}`}>
          <svg className="w-3.5 h-3.5 text-[var(--muted-foreground)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="ابحث عن مركبة، سائق، لوحة..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="flex-1 bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none text-right"
            dir="rtl"
          />
          <kbd className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[var(--border)] text-[10px] text-[var(--muted-foreground)]">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>
      </div>
    </div>
  )
}
