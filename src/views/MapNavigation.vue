<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTripPlanner } from '../composables/useTripPlanner'
import Button from '../components/common/Button.vue'
import Icon from '../components/common/Icon.vue'

const { trip, destinationById, summary } = useTripPlanner()

const routeStops = computed(() =>
  [...trip.value.items]
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
    .map((item) => ({ item, destination: destinationById.value.get(item.destinationId) }))
    .filter((stop) => stop.destination)
)

const selectedIndex = ref(0)

function formatTravelTime(hours: number) {
  const totalMinutes = Math.round(hours * 60)
  if (totalMinutes < 60) return `${totalMinutes} minutes`
  const wholeHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`
}
</script>

<template>
  <div class="map-navigation">
    <div class="container">
      <header class="page-header">
        <h1>Your Route</h1>
        <p>Explore your planned journey.</p>
      </header>

      <div v-if="routeStops.length" class="route-layout">
        <!-- Main Map Area -->
        <div class="map-area">
          <div
            v-for="(stop, index) in routeStops"
            :key="stop.item.id"
            class="map-marker"
            :class="{ selected: selectedIndex === index }"
            @click="selectedIndex = index"
          >
            <div class="marker-row">
              <span class="marker-badge">{{ index + 1 }}</span>
              <span class="marker-name">
                <Icon name="map-pin" :size="16" />
                {{ stop.destination?.name }}
              </span>
            </div>
            <span v-if="index < routeStops.length - 1" class="marker-connector"></span>
          </div>
        </div>

        <!-- Route Panel -->
        <aside class="route-panel">
          <h2>Your Route</h2>
          <ol class="route-list">
            <li
              v-for="(stop, index) in routeStops"
              :key="stop.item.id"
              :class="{ selected: selectedIndex === index }"
              @click="selectedIndex = index"
            >
              {{ stop.destination?.name }}
            </li>
          </ol>

          <div class="route-summary">
            <h3>Route Summary</h3>
            <p>{{ routeStops.length }} destinations</p>
            <p>{{ summary.distanceKm }} km</p>
            <p>{{ formatTravelTime(summary.travelHours) }}</p>
          </div>
        </aside>
      </div>

      <div v-else class="empty-route">
        <Icon name="map" :size="40" />
        <p class="empty-title">No route yet.</p>
        <p class="empty-subtitle">
          Add destinations to your trip to see them mapped out here.
        </p>
        <Button to="/trip-planner" variant="accent">Go to Trip Planner</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-navigation {
  padding: 2.5rem 0 4rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.5rem;
}

.page-header p {
  color: var(--color-muted);
  margin: 0;
}

.route-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.map-area {
  background-color: rgba(var(--color-primary-rgb), 0.04);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath d='M0 40 Q60 10 120 40' stroke='%23d4a017' stroke-width='2' fill='none' opacity='0.35'/%3E%3Cpath d='M0 90 Q60 60 120 100' stroke='%23d4a017' stroke-width='2' fill='none' opacity='0.25'/%3E%3Cline x1='20' y1='0' x2='20' y2='120' stroke='%231b4332' stroke-width='1' opacity='0.08'/%3E%3Cline x1='70' y1='0' x2='70' y2='120' stroke='%231b4332' stroke-width='1' opacity='0.08'/%3E%3Crect x='30' y='15' width='18' height='14' rx='2' fill='%231b4332' opacity='0.06'/%3E%3Crect x='80' y='60' width='20' height='16' rx='2' fill='%231b4332' opacity='0.06'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 120px 120px;
  border-radius: var(--radius);
  padding: 2rem 1.5rem;
}

.map-marker {
  cursor: pointer;
}

.marker-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 0.75rem 1rem;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.map-marker.selected .marker-row {
  border-color: var(--color-accent);
}

.marker-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--fs-label);
  flex-shrink: 0;
}

.map-marker.selected .marker-badge {
  background: var(--color-accent);
  color: var(--color-primary);
}

.marker-name {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  color: var(--color-primary);
}

.marker-connector {
  display: block;
  width: 2px;
  height: 24px;
  background: rgba(var(--color-primary-rgb), 0.25);
  margin-left: calc(1rem + 14px);
}

.route-panel {
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.route-panel h2 {
  color: var(--color-primary);
  margin: 0 0 1rem;
}

.route-list {
  list-style: decimal;
  padding-left: 1.25rem;
  margin: 0 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.route-list li {
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  color: var(--color-text);
  font-weight: 500;
}

.route-list li.selected {
  background: rgba(var(--color-accent-rgb), 0.15);
  color: var(--color-primary);
  font-weight: 700;
}

.route-summary {
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.1);
  padding-top: 1rem;
}

.route-summary h3 {
  color: var(--color-primary);
  margin: 0 0 0.75rem;
}

.route-summary p {
  color: var(--color-muted);
  margin: 0 0 0.4rem;
}

.empty-route {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  color: var(--color-primary);
  padding: 3rem 0;
}

.empty-title {
  font-size: var(--fs-card-title);
  font-weight: 600;
  margin: 0.5rem 0 0;
}

.empty-subtitle {
  color: var(--color-muted);
  margin: 0 0 1.5rem;
  max-width: 360px;
}

@media (max-width: 900px) {
  .route-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .empty-route :deep(.btn) {
    width: 100%;
    max-width: 320px;
  }
}
</style>
