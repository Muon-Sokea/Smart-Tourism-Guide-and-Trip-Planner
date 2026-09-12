import { computed, ref, watch } from 'vue'
import type { Trip } from '../types/trip'

const STORAGE_KEY = 'travelgo-my-trips'

function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Trip[]) : []
  } catch {
    return []
  }
}

const trips = ref<Trip[]>(loadTrips())

watch(
  trips,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true }
)

export function useMyTrips() {
  const today = new Date().toISOString().slice(0, 10)

  const upcomingTrips = computed(() =>
    trips.value
      .filter((trip) => !trip.endDate || trip.endDate >= today)
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
  )

  const pastTrips = computed(() =>
    trips.value
      .filter((trip) => trip.endDate && trip.endDate < today)
      .sort((a, b) => (b.endDate || '').localeCompare(a.endDate || ''))
  )

  function tripById(id: string) {
    return trips.value.find((t) => t.id === id)
  }

  function saveTrip(trip: Trip) {
    const index = trips.value.findIndex((t) => t.id === trip.id)
    if (index >= 0) {
      trips.value[index] = { ...trip }
    } else {
      trips.value.push({ ...trip })
    }
  }

  function deleteTrip(id: string) {
    trips.value = trips.value.filter((t) => t.id !== id)
  }

  function hasTrip(id: string) {
    return trips.value.some((t) => t.id === id)
  }

  return { trips, upcomingTrips, pastTrips, tripById, saveTrip, deleteTrip, hasTrip }
}
