<script setup lang="ts">
import { computed } from 'vue'
import type { MapRouteStop } from '../../types/route'
import { t } from '../../composables/useLanguage'

const props = defineProps<{
  stops: MapRouteStop[]
  selectedIndex: number
  distanceKm: number
  travelHours: number
}>()

defineEmits<{
  select: [index: number]
}>()

const earthRadiusKm = 6371
function distanceBetween(first: MapRouteStop['destination'], second: MapRouteStop['destination']) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const latitudeDelta = toRadians(second.coordinates.latitude - first.coordinates.latitude)
  const longitudeDelta = toRadians(second.coordinates.longitude - first.coordinates.longitude)
  const firstLatitude = toRadians(first.coordinates.latitude)
  const secondLatitude = toRadians(second.coordinates.latitude)
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDuration(hours: number) {
  const totalMinutes = Math.round(hours * 60)
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
}

const segments = computed(() => props.stops.slice(1).map((stop, index) => {
  const from = props.stops[index]
  const distanceKm = distanceBetween(from.destination, stop.destination)
  return {
    from: from.destination.name,
    to: stop.destination.name,
    distanceKm,
    duration: formatDuration(distanceKm / 40),
  }
}))
</script>

<template>
  <aside class="route-panel" :aria-label="t('Route information')">
    <section class="route-summary">
      <p class="eyebrow">{{ t('Route summary') }}</p>
      <div class="summary-grid">
        <div><strong>{{ stops.length }}</strong><span>{{ t('Places') }}</span></div>
        <div><strong>{{ stops.length ? stops[stops.length - 1].day : 0 }}</strong><span>{{ t('Days') }}</span></div>
        <div><strong>{{ distanceKm.toLocaleString(undefined, { maximumFractionDigits: 1 }) }} km</strong><span>{{ t('Estimated distance') }}</span></div>
        <div><strong>{{ formatDuration(travelHours) }}</strong><span>{{ t('Estimated travel time') }}</span></div>
      </div>
    </section>

    <section class="route-sequence">
      <div class="panel-heading"><p class="eyebrow">{{ t('Your route') }}</p><span>{{ stops.length }} {{ t('stops') }}</span></div>
      <ol>
        <li v-for="(stop, index) in stops" :key="stop.id" :class="{ selected: index === selectedIndex }">
          <button type="button" @click="$emit('select', index)">
            <span class="stop-number">{{ String(stop.order).padStart(2, '0') }}</span>
            <span class="stop-copy"><strong>{{ stop.destination.name }}</strong><small>{{ stop.destination.country }} · Day {{ stop.day }}</small></span>
          </button>
          <div v-if="segments[index]" class="segment">
            <span class="segment-line"></span>
            <span><b>{{ segments[index].from }} → {{ segments[index].to }}</b><small>{{ segments[index].distanceKm.toLocaleString(undefined, { maximumFractionDigits: 1 }) }} km · {{ segments[index].duration }}</small></span>
          </div>
        </li>
      </ol>
    </section>
  </aside>
</template>

<style scoped>
.route-panel { display: grid; gap: 1.25rem; min-width: 0; }
.route-summary, .route-sequence { padding: 1.25rem; border: 1px solid rgba(var(--color-primary-rgb), 0.1); border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); }
.eyebrow { margin: 0 0 0.75rem; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 0.75rem; }
.summary-grid div { display: grid; gap: 0.15rem; }
.summary-grid strong { color: var(--color-primary); font-size: var(--fs-card-title); }
.summary-grid span, .panel-heading span, small { color: var(--color-muted); font-size: var(--fs-small); }
.panel-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
.panel-heading .eyebrow { margin-bottom: 0; }
ol { display: grid; gap: 0; margin: 1rem 0 0; padding: 0; list-style: none; }
li > button { display: flex; width: 100%; align-items: center; gap: 0.75rem; padding: 0.55rem; border: 1px solid transparent; border-radius: 8px; background: transparent; color: var(--color-text); text-align: left; cursor: pointer; }
li > button:hover, li.selected > button { border-color: rgba(var(--color-accent-rgb), 0.55); background: rgba(var(--color-accent-rgb), 0.1); }
.stop-number { color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; }
.stop-copy { display: grid; gap: 0.12rem; min-width: 0; }
.stop-copy strong { color: var(--color-primary); font-size: var(--fs-card-desc); }
.segment { display: grid; grid-template-columns: 18px 1fr; gap: 0.75rem; min-height: 54px; padding: 0.05rem 0 0.05rem 0.85rem; }
.segment-line { width: 1px; margin-left: 4px; background: rgba(var(--color-primary-rgb), 0.22); }
.segment span:last-child { display: grid; gap: 0.1rem; padding: 0.25rem 0; }
.segment b { color: var(--color-muted); font-size: 11px; font-weight: 600; }
</style>
