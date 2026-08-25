<script setup lang="ts">
import type { ItineraryItem } from '../../types/trip'
import type { Destination } from '../../types/destination'
import Icon from '../common/Icon.vue'

defineProps<{
  item: ItineraryItem
  destination: Destination | undefined
  isLast: boolean
}>()

defineEmits<{
  remove: [id: string]
}>()
</script>

<template>
  <div class="timeline-row">
    <div class="timeline-marker">
      <span class="timeline-dot"></span>
      <span v-if="!isLast" class="timeline-line"></span>
    </div>

    <div class="timeline-content">
      <span class="timeline-time">{{ item.time }}</span>

      <div class="timeline-card">
        <div class="timeline-card-main">
          <h3>
            <Icon name="map-pin" :size="16" />
            {{ destination?.name ?? 'Unknown destination' }}
          </h3>
          <p>Visit for {{ item.durationLabel }}</p>
        </div>

        <button
          class="remove-btn"
          type="button"
          aria-label="Remove from itinerary"
          @click="$emit('remove', item.id)"
        >
          <Icon name="trash" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-row {
  display: flex;
  gap: 1rem;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}

.timeline-line {
  flex: 1;
  width: 2px;
  background: rgba(var(--color-primary-rgb), 0.2);
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
  padding-bottom: 1.5rem;
}

.timeline-time {
  display: block;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: 0.5rem;
}

.timeline-card {
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.timeline-card-main h3 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-primary);
  margin: 0 0 0.25rem;
}

.timeline-card-main p {
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
  margin: 0;
}

.remove-btn {
  border: none;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  padding: 0.25rem;
}

.remove-btn:hover {
  color: var(--color-accent);
}
</style>
