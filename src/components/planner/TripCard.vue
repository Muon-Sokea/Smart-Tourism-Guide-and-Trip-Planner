<script setup lang="ts">
import type { Trip } from '../../types/trip'
import Button from '../common/Button.vue'

defineProps<{
  trip: Trip
}>()
</script>

<template>
  <div class="trip-card">
    <h3>{{ trip.name }}</h3>
    <p>{{ trip.days }} Days &bull; {{ trip.items.length }} Places</p>
    <Button to="/trip-planner" variant="outline">View Trip</Button>
  </div>
</template>

<style scoped>
.trip-card {
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  max-width: 320px;
}

.trip-card h3 {
  color: var(--color-primary);
  margin: 0;
}

.trip-card p {
  color: var(--color-muted);
  margin: 0 0 0.5rem;
}
</style>
