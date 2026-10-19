import { useId, useState, type InputHTMLAttributes } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> {
  label: string
  isPassword?: boolean
}

export default function AuthField({ label, isPassword, type, ...props }: AuthFieldProps) {
  const id = useId()
  const [show, setShow] = useState(false)
  const { t } = useLanguage()

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block font-mono text-[10px] text-muted uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword ? (show ? 'text' : 'password') : type}
          className="w-full bg-surface border border-edge px-4 py-3 text-text font-body text-sm placeholder:text-muted/60 focus:outline-none focus:border-neon transition-colors"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute inset-y-0 end-3 flex items-center text-muted hover:text-neon transition-colors"
            aria-label={show ? t('auth_hide_password') : t('auth_show_password')}
          >
            {show ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="1.8">
                <path
                  d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 4.24A10.9 10.9 0 0 1 12 4c5.5 0 9.5 4.5 10.5 7.5-.4 1.2-1.15 2.55-2.2 3.8M6.1 6.1C3.9 7.7 2.4 9.9 1.5 12c1 3 5 7.5 10.5 7.5 1.4 0 2.7-.3 3.9-.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="1.8">
                <path
                  d="M1.5 12C2.5 9 6.5 4.5 12 4.5S21.5 9 22.5 12c-1 3-5 7.5-10.5 7.5S2.5 15 1.5 12Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
