<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTripPlanner } from '../../composables/useTripPlanner'
import type { MapRouteStop } from '../../types/route'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'
import MapView from '../../components/explore/MapView.vue'
import RoutePanel from '../../components/explore/RoutePanel.vue'

const { trip, destinationById, summary } = useTripPlanner()
const selectedIndex = ref(0)
const routeStops = computed<MapRouteStop[]>(() =>
  [...trip.value.items].sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)).flatMap((item, index) => {
    const destination = destinationById.value.get(item.destinationId)
    return destination ? [{ id: item.id, order: index + 1, day: item.day, time: item.time, destination }] : []
  })
)

watch(routeStops, (stops) => {
  if (selectedIndex.value >= stops.length) selectedIndex.value = Math.max(0, stops.length - 1)
}, { immediate: true })
</script>

<template>
  <section class="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
    <header class="mx-auto mb-8 max-w-2xl text-center">
      <div class="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[rgb(var(--color-accent-rgb)/0.16)] text-[var(--color-primary)]"><Icon name="map" :size="24" /></div>
      <h1 class="text-[var(--color-primary)]">Your interactive route</h1>
      <p class="mt-2 text-[var(--color-muted)]">Select a stop from the route to focus it on the map.</p>
    </header>

    <div v-if="routeStops.length" class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <MapView :stops="routeStops" :selected-index="selectedIndex" @select="selectedIndex = $event" />
      <RoutePanel :stops="routeStops" :selected-index="selectedIndex" :distance-km="summary.distanceKm" :travel-hours="summary.travelHours" @select="selectedIndex = $event" />
    </div>

    <div v-else class="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-[rgb(var(--color-primary-rgb)/0.28)] bg-[var(--color-white)] px-6 py-14 text-center shadow-[var(--shadow)]">
      <Icon name="map" :size="42" />
      <h2 class="mt-4 text-2xl text-[var(--color-primary)]">No route yet</h2>
      <p class="mt-2 text-[var(--color-muted)]">Add destinations to your trip to see them on an interactive map.</p>
      <Button class="mt-6" to="/trip-planner" variant="accent">Go to Trip Planner</Button>
    </div>
  </section>
</template>
