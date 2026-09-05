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
  update: [changes: { day?: number; time?: string; durationLabel?: string }]
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
          <div class="timeline-edit">
            <label>Day <input :value="item.day" type="number" min="1" @change="$emit('update', { day: Number(($event.target as HTMLInputElement).value) })" /></label>
            <label>Time <input :value="item.time" type="time" @change="$emit('update', { time: ($event.target as HTMLInputElement).value })" /></label>
            <label>Duration <input :value="item.durationLabel" type="text" @change="$emit('update', { durationLabel: ($event.target as HTMLInputElement).value })" /></label>
          </div>
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

.timeline-edit {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.65rem;
}

.timeline-edit label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-muted);
  font-size: var(--fs-small);
}

.timeline-edit input {
  width: 86px;
  padding: 0.25rem 0.35rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 5px;
  background: var(--color-white);
  color: var(--color-text);
  font: inherit;
}

.timeline-edit label:first-child input {
  width: 48px;
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
