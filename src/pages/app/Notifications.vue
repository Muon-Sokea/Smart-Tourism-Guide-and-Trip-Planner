<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifications } from '../../composables/useNotifications'
import { notificationKindMeta, relativeTime, dayGroupFor } from '../../utils/notifications'
import type { AppNotification, NotificationKind } from '../../types/notification'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'

const router = useRouter()
const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()

const activeFilter = ref<'all' | NotificationKind>('all')
const confirmClear = ref(false)

const filters: Array<{ key: 'all' | NotificationKind; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'booking', label: 'Booking' },
  { key: 'trip', label: 'Trip Planner' },
  { key: 'reminder', label: 'Reminder' },
  { key: 'travel-update', label: 'Travel Update' },
  { key: 'system', label: 'System' },
]

const filtered = computed(() =>
  activeFilter.value === 'all'
    ? notifications.value
    : notifications.value.filter((n) => n.kind === activeFilter.value)
)

/** New→old list with Today/Yesterday/date separators. */
const grouped = computed(() => {
  const groups: Array<{ label: string; items: AppNotification[] }> = []
  for (const notification of filtered.value) {
    const label = dayGroupFor(notification.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(notification)
    else groups.push({ label, items: [notification] })
  }
  return groups
})

function openNotification(notification: AppNotification) {
  markAsRead(notification.id)
  if (notification.link) router.push(notification.link)
}

function executeClearAll() {
  clearAll()
  confirmClear.value = false
}
</script>

<template>
  <div class="notifications-page">
    <div class="container">
      <header class="page-header">
        <div>
          <p class="eyebrow">Stay in the loop</p>
          <h1>Notifications</h1>
          <p class="page-subtitle">
            Bookings, trip updates and reminders in one place — newest first.
          </p>
        </div>
        <div class="header-actions">
          <Button
            variant="outline"
            :disabled="!unreadCount"
            @click="markAllAsRead()"
          >
            <Icon name="check" :size="15" /> Mark all as read
          </Button>
        </div>
      </header>

      <section class="toolbar">
        <div class="filter-row" role="tablist" aria-label="Filter notifications by type">
          <button
            v-for="filter in filters"
            :key="filter.key"
            type="button"
            class="filter-chip"
            :class="{ active: activeFilter === filter.key }"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }}
          </button>
        </div>
        <div class="toolbar-right">
          <button
            v-if="notifications.length"
            type="button"
            class="clear-btn"
            @click="confirmClear = !confirmClear"
          >
            <Icon name="trash" :size="14" /> Clear all
          </button>
          <div v-if="confirmClear" class="confirm-clear">
            <span>Delete all notifications?</span>
            <button type="button" class="confirm-yes" @click="executeClearAll">Yes</button>
            <button type="button" class="confirm-no" @click="confirmClear = false">No</button>
          </div>
        </div>
      </section>

      <section v-if="filtered.length" class="notification-list" aria-label="Notification list">
        <div v-for="group in grouped" :key="group.label" class="day-group">
          <p class="day-label">{{ group.label }}</p>
          <article
            v-for="notification in group.items"
            :key="notification.id"
            class="notification-card"
            :class="{ unread: !notification.read }"
            role="button"
            tabindex="0"
            @click="openNotification(notification)"
            @keydown.enter="openNotification(notification)"
          >
            <span class="kind-icon" :class="notificationKindMeta[notification.kind].cssClass">
              <Icon :name="notificationKindMeta[notification.kind].icon" :size="18" />
            </span>
            <div class="notification-body">
              <div class="notification-top">
                <span class="kind-tag" :class="notificationKindMeta[notification.kind].cssClass">
                  {{ notificationKindMeta[notification.kind].label }}
                </span>
                <span v-if="!notification.read" class="unread-dot" aria-label="Unread" />
              </div>
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">
                <Icon name="clock" :size="12" /> {{ relativeTime(notification.createdAt) }}
              </span>
            </div>
            <Icon class="chevron" name="arrow-right" :size="16" />
          </article>
        </div>
      </section>

      <div v-else class="empty-state">
        <Icon name="bell" :size="40" />
        <h2>No notifications here</h2>
        <p>
          {{
            activeFilter === 'all'
              ? "You're all caught up — new activity will show up here."
              : `No ${filters.find((f) => f.key === activeFilter)?.label} notifications yet.`
          }}
        </p>
        <Button variant="accent" to="/explore">Start Exploring</Button>
        <div class="empty-clear" v-if="notifications.length">
          <button type="button" class="clear-btn" @click="clearAll">Clear all</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page { padding: 2.25rem 0 3.25rem; }
.page-header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.page-subtitle { margin-top: 0.4rem; color: var(--color-muted); max-width: 520px; }
.eyebrow { margin: 0 0 0.3rem; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1 { color: var(--color-primary); margin: 0; }
.header-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; }
.filter-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.filter-chip { padding: 0.42rem 0.85rem; border: 1px solid rgba(var(--color-primary-rgb), 0.2); border-radius: 999px; background: var(--color-white); color: var(--color-primary); font-size: var(--fs-small); font-weight: 600; cursor: pointer; transition: background 0.2s, color 0.2s; }
.filter-chip:hover { border-color: var(--color-primary); }
.filter-chip.active { background: var(--color-primary); border-color: var(--color-primary); color: var(--color-white); }
.toolbar-right { display: flex; align-items: center; gap: 0.6rem; }
.clear-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.42rem 0.85rem; border: 1px solid rgba(180, 60, 50, 0.25); border-radius: 999px; background: transparent; color: #a33a2b; font-size: var(--fs-small); font-weight: 600; cursor: pointer; }
.clear-btn:hover { background: rgba(180, 60, 50, 0.08); }
.confirm-clear { display: flex; align-items: center; gap: 0.4rem; font-size: var(--fs-small); color: var(--color-muted); }
.confirm-yes, .confirm-no { padding: 0.25rem 0.6rem; border: 0; border-radius: 6px; font-size: var(--fs-small); font-weight: 600; cursor: pointer; }
.confirm-yes { background: #a33a2b; color: #fff; }
.confirm-no { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); }

/* List */
.notification-list { display: grid; gap: 1.5rem; }
.day-group { display: grid; gap: 0.6rem; }
.day-label { margin: 0; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.notification-card { display: flex; align-items: flex-start; gap: 0.85rem; padding: 0.95rem 1rem; border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); border: 1px solid rgba(var(--color-primary-rgb), 0.08); cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; }
.notification-card:hover { box-shadow: 0 6px 20px rgba(27, 67, 50, 0.16); transform: translateY(-1px); }
.notification-card.unread { background: rgba(var(--color-accent-rgb), 0.07); border-color: rgba(var(--color-accent-rgb), 0.45); }
.notification-body { flex: 1; min-width: 0; display: grid; gap: 0.25rem; }
.notification-top { display: flex; align-items: center; gap: 0.5rem; }
.kind-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.kind-tag.kind-trip { color: var(--color-primary-light); }
.kind-tag.kind-booking { color: var(--color-accent); }
.kind-tag.kind-reminder { color: var(--color-primary-light); }
.kind-tag.kind-travel-update { color: #a33a2b; }
.kind-tag.kind-system { color: var(--color-muted); }
.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); }
.notification-title { margin: 0.15rem 0 0; color: var(--color-primary); font-size: var(--fs-card-desc); }
.notification-card.unread .notification-title { font-weight: 700; }
.notification-message { margin: 0; color: var(--color-muted); font-size: var(--fs-small); line-height: 1.5; }
.notification-time { display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.2rem; color: var(--color-muted); font-size: 12px; }
.chevron { color: rgba(var(--color-primary-rgb), 0.35); flex-shrink: 0; margin-top: 0.3rem; }

/* Kind icon bubble */
.kind-icon { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; }
.kind-icon.kind-trip { background: rgba(45, 106, 79, 0.12); color: var(--color-primary-light); }
.kind-icon.kind-booking { background: rgba(var(--color-accent-rgb), 0.18); color: var(--color-accent); }
.kind-icon.kind-reminder { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); }
.kind-icon.kind-travel-update { background: rgba(180, 60, 50, 0.12); color: #a33a2b; }
.kind-icon.kind-system { background: rgba(var(--color-primary-rgb), 0.08); color: var(--color-muted); }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 4rem 1.5rem; text-align: center; color: var(--color-primary); border: 1px dashed rgba(var(--color-primary-rgb), 0.28); border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); }
.empty-state h2 { margin-top: 0.5rem; }
.empty-state p { margin: 0 0 0.75rem; color: var(--color-muted); }
.empty-clear { margin-top: 0.75rem; }

@media (max-width: 760px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-actions, .header-actions :deep(.btn) { width: 100%; }
}
</style>
