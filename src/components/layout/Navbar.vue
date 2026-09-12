<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MobileMenu from './MobileMenu.vue'
import Icon from '../common/Icon.vue'
import { useAuth } from '../../composables/useAuth'
import { useTheme } from '../../composables/useTheme'
import { useNotifications } from '../../composables/useNotifications'
import { useLanguage, t } from '../../composables/useLanguage'
import { notificationKindMeta, relativeTime } from '../../utils/notifications'
import { navLinks as links } from '../../data/navLinks'

const route = useRoute()
const isMenuOpen = ref(false)
const isNotificationsOpen = ref(false)
const notificationsRef = ref<HTMLElement | null>(null)
const { user, isLoggedIn } = useAuth()
const { theme, toggleTheme } = useTheme()
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
const { languageLabel, toggleLanguage } = useLanguage()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const isAuthPage = computed(() => route.path === '/login' || route.path === '/signup')

const initials = computed(() => {
  if (!user.value?.name) return ''
  return user.value.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  if (path === '/services') return route.path === '/services'
  return route.path === path || route.path.startsWith(`${path}/`)
}

function handleOutsideClick(event: MouseEvent) {
  if (notificationsRef.value && !notificationsRef.value.contains(event.target as Node)) {
    isNotificationsOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-inner">
      <router-link to="/" class="brand">
        <img src="/travelgo-mark.svg" alt="TravelGo" class="brand-mark" />
        <span class="brand-word">Travel<span class="brand-word-accent">Go</span></span>
      </router-link>

      <!-- Login / Sign Up pages: nothing but the logo and the two auth actions -->
      <div v-if="isAuthPage" class="auth-actions">
        <router-link to="/login" class="auth-btn" :class="{ filled: route.path === '/login' }">
          Log In
        </router-link>
        <router-link to="/signup" class="auth-btn" :class="{ filled: route.path !== '/login' }">
          Sign Up
        </router-link>
      </div>

      <!-- Every other page: full nav + dark mode, profile and log out -->
      <template v-else>
        <div class="nav-links">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="{ active: isActive(link.to) }"
          >
            {{ t(link.label) }}
          </router-link>
        </div>

        <div class="nav-right">
          <div class="nav-actions">
            <button
              type="button"
              class="lang-btn"
              :aria-label="`Switch language to ${languageLabel === 'EN' ? 'Khmer' : 'English'}`"
              @click="toggleLanguage"
            >
              <Icon name="globe" :size="14" />
              {{ languageLabel }}
            </button>

            <div ref="notificationsRef" class="notifications-wrap">
              <button
                type="button"
                class="icon-btn"
                :aria-expanded="isNotificationsOpen"
                :aria-label="t('Notifications')"
                @click="isNotificationsOpen = !isNotificationsOpen"
              >
                <Icon name="bell" :size="17" />
                <span v-if="unreadCount" class="icon-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              </button>

              <div v-if="isNotificationsOpen" class="notifications-panel">
                <div class="notifications-head">
                  <p class="notifications-title">{{ t('Notifications') }}</p>
                  <button
                    v-if="unreadCount"
                    type="button"
                    class="mark-read-btn"
                    @click="markAllAsRead()"
                  >
                    {{ t('Mark all as read') }}
                  </button>
                </div>
                <ul v-if="notifications.length" class="notifications-list">
                  <li v-for="notification in notifications.slice(0, 5)" :key="notification.id">
                    <router-link
                      class="notification-item"
                      :class="{ unread: !notification.read }"
                      :to="notification.link || '/notifications'"
                      @click="markAsRead(notification.id); isNotificationsOpen = false"
                    >
                      <span class="kind-icon" :class="notificationKindMeta[notification.kind].cssClass">
                        <Icon :name="notificationKindMeta[notification.kind].icon" :size="15" />
                      </span>
                      <span class="notification-text">
                        <span class="notification-title">{{ notification.title }}</span>
                        <span class="notification-time">{{ relativeTime(notification.createdAt) }}</span>
                      </span>
                      <span v-if="!notification.read" class="unread-dot" :aria-label="t('Unread')" />
                    </router-link>
                  </li>
                </ul>
                <p v-else class="notifications-empty">{{ t("You're all caught up — no new notifications.") }}</p>
                <router-link to="/notifications" class="notifications-footer" @click="isNotificationsOpen = false">
                  {{ t('View all notifications') }}
                </router-link>
              </div>
            </div>

            <button
              type="button"
              class="icon-btn"
              :aria-pressed="theme === 'dark'"
              :aria-label="theme === 'dark' ? t('Switch to light mode') : t('Switch to dark mode')"
              @click="toggleTheme"
            >
              <Icon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
            </button>

            <router-link
              to="/profile"
              class="avatar-btn"
              :class="{ active: isActive('/profile') }"
              :aria-label="isLoggedIn ? `Profile: ${user?.name}` : 'Profile'"
            >
              <span v-if="isLoggedIn">{{ initials }}</span>
              <Icon v-else name="user" :size="16" />
            </router-link>
          </div>

          <button
            class="sidebar-toggle"
            type="button"
            :aria-label="t('Toggle application sidebar')"
            @click="emit('toggleSidebar')"
          >
            <Icon name="map" :size="17" />
          </button>

          <button
            class="menu-toggle"
            type="button"
            :aria-expanded="isMenuOpen"
            :aria-label="t('Toggle menu')"
            @click="isMenuOpen = !isMenuOpen"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </template>
    </div>

    <MobileMenu v-if="!isAuthPage" :links="links" :open="isMenuOpen" @close="isMenuOpen = false">
      <template #extra>
        <router-link to="/profile" class="mobile-link" @click="isMenuOpen = false">
          {{ t('Profile') }}
        </router-link>
        <button type="button" class="mobile-link" @click="toggleLanguage">
          🌐 {{ languageLabel === 'EN' ? 'ភាសាខ្មែរ' : 'English' }}
        </button>
        <button type="button" class="mobile-link" @click="toggleTheme">
          {{ theme === 'dark' ? t('Switch to Light Mode') : t('Switch to Dark Mode') }}
        </button>
      </template>
    </MobileMenu>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--color-white);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.navbar-inner {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: none;
  min-height: var(--navbar-height);
  padding: 0.4rem 1rem 0.4rem 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  grid-column: 1;
  justify-self: start;
  width: var(--sidebar-width);
  padding-left: 1.25rem;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-primary);
  flex-shrink: 0;
}

.brand-mark {
  display: block;
  width: 34px;
  height: 37px;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-word-accent {
  color: var(--color-accent);
}

.nav-links {
  display: flex;
  grid-column: 2;
  justify-self: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.nav-link {
  font-weight: 500;
  font-size: var(--fs-navbar);
  color: var(--color-text);
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link.active {
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 600;
}

.auth-actions,
.nav-right {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-right: 1rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  background: none;
  color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
}

.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  height: 34px;
  padding: 0 0.7rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 999px;
  background: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  transition: border-color 0.2s, color 0.2s;
}

.lang-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.icon-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.icon-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}

.icon-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
}

.notifications-wrap {
  position: relative;
}

.notifications-panel {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  width: 340px;
  max-width: calc(100vw - 2rem);
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 0.85rem;
  z-index: 5;
}

.notifications-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem; }
.notifications-title { margin: 0; font-weight: 700; color: var(--color-primary); }
.mark-read-btn { padding: 0; border: 0; background: none; color: var(--color-accent); font-size: 12px; font-weight: 700; cursor: pointer; }
.mark-read-btn:hover { text-decoration: underline; }
.notifications-list { display: grid; gap: 0.25rem; margin: 0; padding: 0; list-style: none; }
.notification-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.5rem; border-radius: 8px; }
.notification-item:hover { background: rgba(var(--color-primary-rgb), 0.05); }
.notification-item.unread { background: rgba(var(--color-accent-rgb), 0.09); }
.kind-icon { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; }
.kind-icon.kind-trip { background: rgba(45, 106, 79, 0.12); color: var(--color-primary-light); }
.kind-icon.kind-booking { background: rgba(var(--color-accent-rgb), 0.18); color: var(--color-accent); }
.kind-icon.kind-reminder { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); }
.kind-icon.kind-travel-update { background: rgba(180, 60, 50, 0.12); color: #a33a2b; }
.kind-icon.kind-system { background: rgba(var(--color-primary-rgb), 0.08); color: var(--color-muted); }
.notification-text { flex: 1; min-width: 0; display: grid; gap: 0.1rem; }
.notification-title { color: var(--color-primary); font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notification-item.unread .notification-title { font-weight: 700; }
.notification-time { color: var(--color-muted); font-size: 11px; }
.unread-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-accent); flex-shrink: 0; }
.notifications-empty { margin: 0.25rem 0 0.5rem; color: var(--color-muted); font-size: var(--fs-card-desc); }
.notifications-footer { display: block; margin-top: 0.5rem; padding-top: 0.6rem; border-top: 1px solid rgba(var(--color-primary-rgb), 0.1); color: var(--color-accent); font-size: 12px; font-weight: 700; text-align: center; }
.notifications-footer:hover { text-decoration: underline; }

.auth-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}

.auth-btn:hover {
  color: var(--color-primary);
}

.auth-btn.filled {
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 600;
}

.auth-btn.filled:hover {
  background: var(--color-accent);
  color: var(--color-primary);
}

.avatar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  transition: box-shadow 0.2s;
}

.avatar-btn:hover {
  box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb), 0.4);
}

.avatar-btn.active {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.sidebar-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 50%;
  background: none;
  color: var(--color-primary);
  cursor: pointer;
}

.menu-toggle span {
  display: block;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px;
}

@media (max-width: 1280px) {
  .navbar-inner {
    gap: 1.1rem;
  }

  .brand { font-size: 21px; }

  .nav-links {
    gap: 0.15rem;
  }

  .nav-link {
    font-size: 15px;
    padding: 0.4rem 0.6rem;
  }

  .auth-btn {
    font-size: 15px;
  }

  .auth-actions,
  .nav-right {
    margin-right: 0.25rem;
  }
}

@media (max-width: 900px) {
  .navbar-inner {
    grid-template-columns: minmax(0, 1fr) auto;
    padding-left: 1rem;
  }

  .brand {
    width: auto;
    padding-left: 0;
  }

  .nav-links {
    display: none;
  }

  .sidebar-toggle {
    display: flex;
  }

  .menu-toggle {
    display: flex;
  }
}
</style>
