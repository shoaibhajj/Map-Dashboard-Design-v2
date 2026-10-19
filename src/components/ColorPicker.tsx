import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import MotionColorPicker from './ui/motion-color-picker'
import './color-picker.css'

interface ColorPickerFieldProps {
  value: string
  onChange: (color: string) => void
  label: string
}

export function ColorPickerField({ value, onChange, label }: ColorPickerFieldProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)
  const [draft, setDraft] = useState(value)

  useEffect(() => setDraft(value), [value])

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(304, window.innerWidth - 24)
    const height = popoverRef.current?.getBoundingClientRect().height ?? 330
    const isRTL = document.documentElement.dir === 'rtl'
    const desiredLeft = isRTL ? rect.right - width : rect.left
    const left = Math.max(12, Math.min(desiredLeft, window.innerWidth - width - 12))
    const below = rect.bottom + height + 12 <= window.innerHeight
    const top = below ? rect.bottom + 9 : Math.max(12, rect.top - height - 9)
    setPosition({ left, top })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const updateHex = (next: string) => {
    setDraft(next)
    if (/^#[\da-f]{6}$/i.test(next)) onChange(next.toLowerCase())
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="motion-color-picker-trigger"
        style={{ '--swatch-color': value } as CSSProperties}
        aria-label={`${label}: ${value}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={`${label}: ${value}`}
        onClick={() => { setDraft(value); setOpen(current => !current) }}
      >
        <span className="motion-color-picker-trigger-swatch" />
        <span className="motion-color-picker-trigger-caret" aria-hidden="true">⌄</span>
      </button>
      {open && position && createPortal(
        <div
          ref={popoverRef}
          className="motion-color-picker-popover"
          role="dialog"
          aria-label={label}
          style={{ left: position.left, top: position.top }}
          onMouseDown={event => event.stopPropagation()}
          onClick={event => event.stopPropagation()}
        >
          <div className="motion-color-picker-heading">
            <span>{label}</span>
            <span className="motion-color-picker-current" style={{ '--swatch-color': value } as CSSProperties}>{value}</span>
          </div>
          <div className="motion-color-picker-stage">
            <MotionColorPicker value={value} onChange={onChange} />
          </div>
          <label className="motion-color-picker-hex">
            <span>HEX</span>
            <input
              type="text"
              value={draft}
              maxLength={7}
              spellCheck={false}
              aria-label={`${label} HEX`}
              onChange={event => updateHex(event.target.value)}
              onBlur={() => {
                if (!/^#[\da-f]{6}$/i.test(draft)) setDraft(value)
              }}
            />
          </label>
        </div>,
        document.body,
      )}
    </>
  )
}
