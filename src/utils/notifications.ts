import type { AppNotification, NotificationKind } from '../types/notification'
import { t, dateLocale } from '../composables/useLanguage'

/** Per-kind icon + tint. The icon names exist in the shared Icon component. */
export const notificationKindMeta: Record<
  NotificationKind,
  { icon: string; label: string; cssClass: string }
> = {
  trip: { icon: 'route', label: 'Trip Planner', cssClass: 'kind-trip' },
  booking: { icon: 'bookmark', label: 'Booking', cssClass: 'kind-booking' },
  reminder: { icon: 'clock', label: 'Reminder', cssClass: 'kind-reminder' },
  'travel-update': { icon: 'alert', label: 'Travel Update', cssClass: 'kind-travel-update' },
  system: { icon: 'globe', label: 'System', cssClass: 'kind-system' },
}

/** Compact age label: "just now", "5m ago", "3h ago", "2d ago", else a date. */
export function relativeTime(iso: string, now = new Date()): string {
  const seconds = Math.floor((now.getTime() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return t('just now')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t('{minutes}m ago', { minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('{hours}h ago', { hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('{days}d ago', { days })
  return new Intl.DateTimeFormat(dateLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso)
  )
}

/** Group key for day separators: Today / Yesterday / the date. */
export function dayGroupFor(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const daysApart = Math.round((startOf(now) - startOf(date)) / 86400000)
  if (daysApart === 0) return t('Today')
  if (daysApart === 1) return t('Yesterday')
  return new Intl.DateTimeFormat(dateLocale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export type { AppNotification, NotificationKind }
