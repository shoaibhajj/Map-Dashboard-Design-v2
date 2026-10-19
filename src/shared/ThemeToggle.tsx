import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import PaletteSwitcher from './PaletteSwitcher'

/**
 * One dark/light toggle button, reused everywhere it's needed
 * (marketing Nav, auth pages, dashboard TopBar) instead of each
 * page inventing its own. Three preset looks — pick whichever
 * fits the surrounding UI, or pass your own className to fully
 * override. See docs/GUIDE.md → "Shared UI" before writing a
 * new one-off toggle.
 */
interface Props {
  variant?: 'pill' | 'corner' | 'nav'
  className?: string
}

const sunIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const moonIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const variantStyle: Record<NonNullable<Props['variant']>, React.CSSProperties> = {
  pill: {
    width: 38, height: 38, borderRadius: 9,
    border: '1px solid var(--border)',
    background: 'color-mix(in srgb, var(--card) 96%, transparent)',
    backdropFilter: 'blur(16px)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--muted-foreground)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.09)',
    transition: 'color 0.15s, background 0.15s',
  },
  corner: {
    width: 38, height: 38,
    border: '1px solid var(--color-edge)',
    background: 'transparent',
    color: 'var(--color-neon)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color 0.15s',
  },
  nav: {
    width: 36, height: 36,
    border: '1px solid var(--color-edge)',
    background: 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color 0.15s, color 0.15s',
  },
}

export default function ThemeToggle({ variant = 'pill', className = '' }: Props) {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const label = isDark ? t("light_mode") : t("dark_mode");

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
      <PaletteSwitcher variant={variant} />
      <button
        type="button"
        onClick={toggleTheme}
        title={label}
        aria-label={label}
        className={className}
        style={variantStyle[variant]}
      >
        {isDark ? sunIcon : moonIcon}
      </button>
    </span>
  )
}
