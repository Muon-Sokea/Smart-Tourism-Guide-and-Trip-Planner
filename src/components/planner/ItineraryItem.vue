<script setup lang="ts">
import { computed } from 'vue'
import type { ItineraryItem } from '../../types/trip'
import type { ResolvedPlace } from '../../composables/useTripPlanner'
import Icon from '../common/Icon.vue'

const props = defineProps<{
  item: ItineraryItem
  place: ResolvedPlace | undefined
  totalDays: number
  isLast: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
  move: [payload: { id: string; direction: 'up' | 'down' }]
  update: [changes: { day?: number; time?: string; durationLabel?: string }]
}>()

const dayOptions = computed(() =>
  Array.from({ length: Math.max(props.totalDays, props.item.day) }, (_, index) => index + 1)
)

function setDay(event: Event) {
  emit('update', { day: Number((event.target as HTMLSelectElement).value) })
}

function setTime(event: Event) {
  emit('update', { time: (event.target as HTMLInputElement).value })
}
</script>

<template>
  <div class="timeline-row">
    <div class="timeline-marker">
      <span class="timeline-dot" :class="`kind-${place?.kind ?? 'destination'}`"></span>
      <span v-if="!isLast" class="timeline-line"></span>
    </div>

    <div class="timeline-content">
      <span class="timeline-time">{{ item.time }}</span>

      <div class="timeline-card">
        <div class="timeline-card-main">
          <span v-if="place" class="place-kind">{{ place.kindLabel }}</span>
          <h3>
            <Icon name="map-pin" :size="16" />
            {{ place?.name ?? 'Unknown place' }}
          </h3>
          <p v-if="place">{{ place.country }} · Visit for {{ item.durationLabel }}</p>
          <div class="timeline-edit">
            <label>
              Day
              <select :value="item.day" @change="setDay">
                <option v-for="day in dayOptions" :key="day" :value="day">Day {{ day }}</option>
              </select>
            </label>
            <label>Time <input :value="item.time" type="time" @change="setTime" /></label>
          </div>
        </div>

        <div class="timeline-actions">
          <button
            class="move-btn"
            type="button"
            aria-label="Move earlier"
            @click="emit('move', { id: item.id, direction: 'up' })"
          >
            <Icon name="arrow-up" :size="15" />
          </button>
          <button
            class="move-btn"
            type="button"
            aria-label="Move later"
            @click="emit('move', { id: item.id, direction: 'down' })"
          >
            <Icon name="arrow-down" :size="15" />
          </button>
          <button
            class="remove-btn"
            type="button"
            aria-label="Remove from itinerary"
            @click="emit('remove', item.id)"
          >
            <Icon name="trash" :size="16" />
          </button>
        </div>
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

.timeline-dot.kind-hotel {
  background: var(--color-accent);
}

.timeline-dot.kind-restaurant {
  background: #a33a2b;
}

.timeline-dot.kind-activity {
  background: var(--color-primary-light, var(--color-primary));
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

.place-kind {
  display: inline-block;
  margin-bottom: 0.3rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: rgba(var(--color-accent-rgb), 0.14);
  color: var(--color-accent);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
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

.timeline-edit input,
.timeline-edit select {
  min-width: 0;
  padding: 0.25rem 0.35rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 5px;
  background: var(--color-white);
  color: var(--color-text);
  font: inherit;
}

.timeline-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.move-btn,
.remove-btn {
  display: inline-grid;
  place-items: center;
  border: none;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
}

.move-btn:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.08);
}

.remove-btn:hover {
  color: var(--color-accent);
  background: rgba(var(--color-accent-rgb), 0.1);
}
</style>
