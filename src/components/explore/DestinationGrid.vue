<script setup lang="ts">
import type { Destination } from '../../types/destination'
import DestinationCard from './DestinationCard.vue'
import EmptyState from '../common/EmptyState.vue'

withDefaults(
  defineProps<{
    destinations: Destination[]
    emptyMessage?: string
  }>(),
  { emptyMessage: 'No destinations found.' }
)
</script>

<template>
  <div v-if="destinations.length" class="destination-grid">
    <DestinationCard
      v-for="destination in destinations"
      :key="destination.id"
      :destination="destination"
    />
  </div>

  <EmptyState v-else :message="emptyMessage">
    <slot name="empty-action" />
  </EmptyState>
</template>

<style scoped>
.destination-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.1rem;
}

@media (max-width: 900px) {
  .destination-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 600px) {
  .destination-grid {
    grid-template-columns: 1fr;
  }
}
</style>
