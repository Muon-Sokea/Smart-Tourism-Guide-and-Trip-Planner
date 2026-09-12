import { computed, ref, watch } from 'vue'
import type { AppNotification, NotificationKind } from '../types/notification'

const STORAGE_KEY = 'travelgo-notifications'
const MAX_NOTIFICATIONS = 60

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

/** Realistic starter data for the frontend demo. When a backend arrives, seed
    from its API instead — every consumer only reads the `notifications` ref. */
function sampleNotifications(): AppNotification[] {
  return [
    {
      id: 'ntf-booking-101',
      kind: 'booking',
      title: 'Booking confirmed — Angkor Sunrise Boutique',
      message: 'Your Deluxe Twin room, Sep 8 → Sep 10, is confirmed. Booking #TG-2451.',
      createdAt: minutesAgo(14),
      read: false,
      link: '/bookings',
    },
    {
      id: 'ntf-reminder-101',
      kind: 'reminder',
      title: 'Upcoming trip: Trip to Korean',
      message: 'Your trip to Bali, Indonesia starts on Sep 8. Finish your checklist before you go.',
      createdAt: hoursAgo(2),
      read: false,
      link: '/trips',
    },
    {
      id: 'ntf-trip-101',
      kind: 'trip',
      title: 'Itinerary updated',
      message: 'Royal Palace was added to Day 1 of your trip. Route and summary were refreshed.',
      createdAt: hoursAgo(5),
      read: false,
      link: '/trip-planner',
    },
    {
      id: 'ntf-travel-101',
      kind: 'travel-update',
      title: 'Rain expected in Siem Reap',
      message: 'Showers forecast for tomorrow afternoon — plan indoor activities after 2 PM.',
      createdAt: hoursAgo(9),
      read: true,
      link: '/explore',
    },
    {
      id: 'ntf-reminder-102',
      kind: 'reminder',
      title: 'Restaurant reservation tonight',
      message: 'Table for 2 at Marum Restaurant, 7:00 PM. The reservation is held for 15 minutes.',
      createdAt: hoursAgo(26),
      read: true,
      link: '/bookings',
    },
    {
      id: 'ntf-booking-102',
      kind: 'booking',
      title: 'Booking cancelled',
      message: 'Koh Rong Sunset Cruise, Sep 12, was cancelled. No fees were charged.',
      createdAt: daysAgo(2),
      read: true,
      link: '/bookings',
    },
    {
      id: 'ntf-system-101',
      kind: 'system',
      title: 'Welcome to TravelGo',
      message: 'Plan trips, book hotels and restaurants, and navigate routes — all in one place.',
      createdAt: daysAgo(5),
      read: true,
      link: '/explore',
    },
  ]
}

function load(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return sampleNotifications()
    const parsed = JSON.parse(raw) as AppNotification[]
    return Array.isArray(parsed) ? parsed : sampleNotifications()
  } catch {
    return sampleNotifications()
  }
}

// Module-level state: the bell badge, the dropdown and the page share one list.
const notifications = ref<AppNotification[]>(load())

watch(
  notifications,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Storage unavailable — the in-memory list still works for this session.
    }
  },
  { deep: true }
)

export function useNotifications() {
  const sorted = computed(() =>
    [...notifications.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  )
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  function markAsRead(id: string) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) notification.read = true
  }

  function markAllAsRead() {
    for (const notification of notifications.value) notification.read = true
  }

  function clearAll() {
    notifications.value = []
  }

  /** Reserved for the future backend: push notifications of any kind. */
  function push(kind: NotificationKind, title: string, message: string, link?: string) {
    notifications.value.unshift({
      id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      link,
    })
    if (notifications.value.length > MAX_NOTIFICATIONS) notifications.value.pop()
  }

  return { notifications: sorted, unreadCount, markAsRead, markAllAsRead, clearAll, push }
}
