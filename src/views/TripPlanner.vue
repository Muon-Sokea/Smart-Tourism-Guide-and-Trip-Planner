<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTripPlanner } from '../composables/useTripPlanner'
import { destinations } from '../data/destinations'
import DaySelector from '../components/trip/DaySelector.vue'
import ItineraryItemRow from '../components/trip/ItineraryItem.vue'
import TripSummary from '../components/trip/TripSummary.vue'
import Button from '../components/common/Button.vue'
import Icon from '../components/common/Icon.vue'

const { trip, destinationById, itemsForDay, addDestination, removeItem, setName, setDays, summary } =
  useTripPlanner()

const activeDay = ref(1)
const isEditing = ref(false)
const isAdding = ref(false)
const draftName = ref(trip.value.name)
const draftDays = ref(trip.value.days)
const addSearch = ref('')

const activeDayItems = computed(() => itemsForDay(activeDay.value))

const addableDestinations = computed(() => {
  const query = addSearch.value.trim().toLowerCase()
  return destinations.filter(
    (destination) =>
      !query ||
      destination.name.toLowerCase().includes(query) ||
      destination.country.toLowerCase().includes(query)
  )
})

function startEditing() {
  draftName.value = trip.value.name
  draftDays.value = trip.value.days
  isEditing.value = true
}

function saveEditing() {
  setName(draftName.value.trim() || 'My Trip')
  setDays(Math.max(1, draftDays.value))
  if (activeDay.value > trip.value.days) {
    activeDay.value = trip.value.days
  }
  isEditing.value = false
}

function handleAddDestination(destinationId: number) {
  addDestination(destinationId, activeDay.value)
}
</script>

<template>
  <div class="trip-planner">
    <div class="container">
      <!-- Trip Header -->
      <header class="trip-header">
        <div v-if="!isEditing" class="trip-header-info">
          <h1>{{ trip.name }}</h1>
          <p>{{ trip.days }} Days &bull; {{ trip.items.length }} Places</p>
        </div>

        <form v-else class="trip-edit-form" @submit.prevent="saveEditing">
          <input v-model="draftName" type="text" placeholder="Trip name" />
          <input v-model.number="draftDays" type="number" min="1" max="14" />
          <Button variant="primary" type="submit">Save</Button>
        </form>

        <Button v-if="!isEditing" variant="outline" @click="startEditing">
          <Icon name="edit" :size="16" />
          Edit Trip
        </Button>
      </header>

      <div class="trip-layout">
        <div class="trip-main">
          <!-- Day Selector -->
          <DaySelector v-model="activeDay" :total-days="trip.days" />

          <!-- Itinerary -->
          <div class="itinerary">
            <ItineraryItemRow
              v-for="(item, index) in activeDayItems"
              :key="item.id"
              :item="item"
              :destination="destinationById.get(item.destinationId)"
              :is-last="index === activeDayItems.length - 1"
              @remove="removeItem"
            />

            <p v-if="!activeDayItems.length" class="empty-day">
              No destinations added to Day {{ activeDay }} yet.
            </p>
          </div>

          <Button variant="accent" @click="isAdding = !isAdding">
            <Icon name="plus" :size="16" />
            Add Destination
          </Button>

          <!-- Add Destination Panel -->
          <div v-if="isAdding" class="add-panel">
            <input
              v-model="addSearch"
              type="text"
              placeholder="Search destinations..."
              class="add-search"
            />

            <ul class="add-list">
              <li v-for="destination in addableDestinations" :key="destination.id">
                <span>{{ destination.name }} <em>({{ destination.country }})</em></span>
                <button type="button" @click="handleAddDestination(destination.id)">
                  <Icon name="plus" :size="14" /> Add
                </button>
              </li>
            </ul>
          </div>
        </div>

        <aside class="trip-sidebar">
          <TripSummary :summary="summary" />
          <Button to="/map" variant="outline">
            <Icon name="route" :size="16" />
            View Route
          </Button>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trip-planner {
  padding: 2.5rem 0 4rem;
}

.trip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.trip-header-info h1 {
  color: var(--color-primary);
  margin: 0 0 0.35rem;
}

.trip-header-info p {
  color: var(--color-muted);
  margin: 0;
}

.trip-edit-form {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.trip-edit-form input {
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: var(--fs-body);
}

.trip-edit-form input[type='number'] {
  width: 80px;
}

.trip-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.trip-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.itinerary {
  margin-top: 0.5rem;
}

.empty-day {
  color: var(--color-muted);
  padding: 1.5rem 0;
}

.add-panel {
  background: rgba(var(--color-primary-rgb), 0.04);
  border-radius: var(--radius);
  padding: 1.25rem;
}

.add-search {
  width: 100%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font-size: var(--fs-body);
  margin-bottom: 1rem;
}

.add-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 260px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-white);
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
}

.add-list em {
  color: var(--color-muted);
  font-style: normal;
  font-size: var(--fs-card-desc);
}

.add-list button {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  cursor: pointer;
}

.trip-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 900px) {
  .trip-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .trip-header {
    flex-direction: column;
    align-items: stretch;
  }

  .trip-header :deep(.btn),
  .trip-main > :deep(.btn),
  .trip-sidebar :deep(.btn) {
    width: 100%;
  }

  .trip-edit-form {
    flex-direction: column;
  }

  .trip-edit-form input[type='number'] {
    width: 100%;
  }
}
</style>
