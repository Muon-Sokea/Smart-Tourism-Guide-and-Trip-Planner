<script setup lang="ts">
import Icon from '../common/Icon.vue'

defineProps<{
  summary: {
    places: number
    days: number
    distanceKm: number
    travelMinutes: number
  }
}>()

function formatTravelTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}
</script>

<template>
  <div class="trip-summary">
    <h2>Trip Summary</h2>

    <div class="summary-grid">
      <div class="summary-item">
        <Icon name="map-pin" :size="20" />
        <span class="summary-value">{{ summary.places }}</span>
        <span class="summary-label">Places</span>
      </div>

      <div class="summary-item">
        <Icon name="calendar" :size="20" />
        <span class="summary-value">{{ summary.days }}</span>
        <span class="summary-label">Days</span>
      </div>

      <div class="summary-item">
        <Icon name="route" :size="20" />
        <span class="summary-value">{{ summary.distanceKm }} km</span>
        <span class="summary-label">Est. Distance</span>
      </div>

      <div class="summary-item">
        <Icon name="clock" :size="20" />
        <span class="summary-value">{{ formatTravelTime(summary.travelMinutes) }}</span>
        <span class="summary-label">Est. Travel Time</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trip-summary {
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.25rem;
}

.trip-summary h2 {
  color: var(--color-primary);
  margin: 0 0 1rem;
  font-size: var(--fs-section-title);
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
  color: var(--color-primary);
}

.summary-value {
  font-size: var(--fs-card-title);
  font-weight: 700;
}

.summary-label {
  font-size: var(--fs-label);
  color: var(--color-muted);
}
</style>
