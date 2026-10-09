import type { Lang } from '../i18n/strings'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export interface FormattedTelemetryTimestamp {
  absolute: string
  relative: string
}

/** Formats a backend ISO timestamp using the app language and the browser's local timezone. */
export function formatTelemetryTimestamp(
  timestamp: string | null | undefined,
  lang: Lang,
  now: number,
  justNowLabel: string,
): FormattedTelemetryTimestamp | null {
  if (!timestamp) return null

  const date = new Date(timestamp)
  const time = date.getTime()
  if (!Number.isFinite(time)) return null

  const locale = lang === 'ar' ? 'ar-u-ca-gregory' : 'en-US-u-ca-gregory'
  const absolute = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)

  const difference = time - now
  const distance = Math.abs(difference)
  const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'long' })
  let relative: string

  if (distance < MINUTE && difference <= 0) {
    relative = justNowLabel
  } else if (distance < MINUTE) {
    relative = relativeFormatter.format(Math.ceil(difference / 1000), 'second')
  } else if (distance < HOUR) {
    relative = relativeFormatter.format(Math.sign(difference) * Math.floor(distance / MINUTE), 'minute')
  } else if (distance < DAY) {
    relative = relativeFormatter.format(Math.sign(difference) * Math.floor(distance / HOUR), 'hour')
  } else {
    relative = relativeFormatter.format(Math.sign(difference) * Math.floor(distance / DAY), 'day')
  }

  return { absolute, relative }
}
