<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../common/Icon.vue'
import { appNavigation } from '../../data/appNavigation'

const route = useRoute()

defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

const isActive = (path: string) =>
  path === '/explore' ? route.path === path : route.path === path || route.path.startsWith(`${path}/`)

const currentSection = computed(() => {
  for (const group of appNavigation) {
    if (group.items.some((item) => isActive(item.to))) return group.label
  }
  return ''
})
</script>

<template>
  <aside class="sidebar" :class="{ open }">
    <nav class="sidebar-nav" aria-label="TravelGo application">
      <div v-for="group in appNavigation" :key="group.label" class="sidebar-group">
        <p class="sidebar-label">{{ group.label }}</p>
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="sidebar-link"
          :class="{ active: isActive(item.to), 'section-active': currentSection === group.label }"
        >
          <Icon :name="item.icon" :size="17" />
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: var(--navbar-height) auto 0 0;
  z-index: 45;
  width: var(--sidebar-width);
  overflow-y: auto;
  background: var(--color-primary);
  color: var(--color-on-dark);
  padding: 1.25rem 0.9rem;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-on-dark);
  font-size: 1.35rem;
  font-weight: 700;
  padding: 0.25rem 0.7rem 1.6rem;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--color-accent);
  color: var(--color-primary);
}

.brand-mark :deep(svg) {
  transform: rotate(45deg);
}

.brand-accent {
  color: var(--color-accent);
}

.sidebar-nav,
.sidebar-group {
  display: flex;
  flex-direction: column;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 38px;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.86rem;
  transition: background 0.2s, color 0.2s;
}

.sidebar-link:hover,
.sidebar-link.active {
  background: rgba(255, 255, 255, 0.14);
  color: var(--color-accent);
}

.sidebar-link.active {
  font-weight: 600;
}

.sidebar-group {
  gap: 0.2rem;
  margin-bottom: 0.9rem;
}

.sidebar-label {
  margin: 0.2rem 0 0.3rem 0.7rem;
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (max-width: 800px) {
  .sidebar {
    width: min(var(--sidebar-width), 86vw);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: var(--shadow);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-nav {
    display: flex;
  }

  .sidebar-group {
    margin-bottom: 0;
  }
}
</style>