<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MobileMenu from './MobileMenu.vue'
import Icon from '../common/Icon.vue'
import { useAuth } from '../../composables/useAuth'
import { useTheme } from '../../composables/useTheme'
import { useFavorites } from '../../composables/useFavorites'
import { navLinks as links } from '../../data/navLinks'

const route = useRoute()
const isMenuOpen = ref(false)
const isNotificationsOpen = ref(false)
const notificationsRef = ref<HTMLElement | null>(null)
const { user, isLoggedIn } = useAuth()
const { theme, toggleTheme } = useTheme()
const { favoriteIds } = useFavorites()

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
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
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
        <span class="brand-mark">
          <Icon name="plane" :size="17" />
        </span>
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
            {{ link.label }}
          </router-link>
        </div>

        <div class="nav-right">
          <div class="nav-actions">
            <router-link
              to="/favorites"
              class="icon-btn"
              :class="{ active: isActive('/favorites') }"
              aria-label="Favorites"
            >
              <Icon :name="favoriteIds.length ? 'bookmark-filled' : 'bookmark'" :size="17" />
              <span v-if="favoriteIds.length" class="icon-badge">{{ favoriteIds.length }}</span>
            </router-link>

            <div ref="notificationsRef" class="notifications-wrap">
              <button
                type="button"
                class="icon-btn"
                :aria-expanded="isNotificationsOpen"
                aria-label="Notifications"
                @click="isNotificationsOpen = !isNotificationsOpen"
              >
                <Icon name="bell" :size="17" />
              </button>

              <div v-if="isNotificationsOpen" class="notifications-panel">
                <p class="notifications-title">Notifications</p>
                <p class="notifications-empty">You're all caught up — no new notifications.</p>
              </div>
            </div>

            <button
              type="button"
              class="icon-btn"
              :aria-pressed="theme === 'dark'"
              :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
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
            class="menu-toggle"
            type="button"
            :aria-expanded="isMenuOpen"
            aria-label="Toggle menu"
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
          Profile
        </router-link>
        <button type="button" class="mobile-link" @click="toggleTheme">
          {{ theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}
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
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.25rem;
  min-height: var(--navbar-height);
  padding: 0.5rem 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  grid-column: 1;
  justify-self: start;
  margin-left: 1rem;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-primary);
  flex-shrink: 0;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-primary);
  color: var(--color-white);
  box-shadow: 0 3px 8px rgba(var(--color-primary-rgb), 0.35);
  flex-shrink: 0;
}

.brand-mark :deep(svg) {
  transform: rotate(45deg);
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
  font-size: 16px;
  color: var(--color-text);
  padding: 0.45rem 0.8rem;
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
  gap: 0.9rem;
  flex-shrink: 0;
}

.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  background: none;
  color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
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
  width: 260px;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1rem 1.1rem;
  z-index: 5;
}

.notifications-title {
  margin: 0 0 0.4rem;
  font-weight: 700;
  color: var(--color-primary);
}

.notifications-empty {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
}

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
  width: 38px;
  height: 38px;
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

  .brand {
    font-size: 22px;
    margin-left: 0.25rem;
  }

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
  .nav-links {
    display: none;
  }

  .menu-toggle {
    display: flex;
  }
}
</style>
