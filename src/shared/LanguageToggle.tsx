import { useLanguage } from '../contexts/LanguageContext'

interface Props {
  variant?: 'pill' | 'corner' | 'nav'
  className?: string
}

const variantStyle: Record<NonNullable<Props['variant']>, React.CSSProperties> = {
  pill: {
    height: 38, padding: '0 11px', borderRadius: 9,
    border: '1px solid var(--border)',
    background: 'color-mix(in srgb, var(--card) 96%, transparent)',
    backdropFilter: 'blur(16px)',
    cursor: 'pointer',
    fontSize: 12.5, fontWeight: 700, letterSpacing: '0.01em',
    color: 'var(--primary)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.09)',
  },
  corner: {
    height: 38, padding: '0 12px',
    border: '1px solid var(--color-edge)',
    background: 'transparent',
    fontFamily: 'var(--font-mono)',
    fontSize: 12, color: 'var(--color-neon)',
    cursor: 'pointer',
  },
  nav: {
    height: 36, padding: '0 12px',
    border: '1px solid var(--color-edge)',
    background: 'transparent',
    fontFamily: 'var(--font-mono)',
    fontSize: 12, fontWeight: 700, color: 'var(--color-neon)',
    cursor: 'pointer',
  },
}

/** EN/AR toggle — `language_toggle` already IS the label for the
 *  language you'd switch TO ("عربي" while in English, "English"
 *  while in Arabic), so no separate label lookup is needed. */
export default function LanguageToggle({ variant = 'pill', className = '' }: Props) {
  const { lang, setLang, t } = useLanguage()

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
      title={t('language_toggle')}
      aria-label={lang === 'en' ? t('auth_switch_to_ar') : t('auth_switch_to_en')}
      className={className}
      style={variantStyle[variant]}
    >
      {t('language_toggle')}
    </button>
  )
}
