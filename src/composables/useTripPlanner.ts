import { computed, ref, watch } from 'vue'
import type { Trip, ItineraryItem } from '../types/trip'
import { destinations } from '../data/destinations'

const STORAGE_KEY = 'travelgo-trip'

function defaultTrip(): Trip {
  return { id: crypto.randomUUID(), name: 'My Trip', days: 3, items: [] }
}

function loadTrip(): Trip {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Trip) : defaultTrip()
  } catch {
    return defaultTrip()
  }
}

// Module-level state so every component sharing this composable sees the same trip.
const trip = ref<Trip>(loadTrip())

watch(
  trip,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true }
)

// Simple sequential scheduling: each new stop on a day starts where the last one left off.
const START_HOUR = 8
const DEFAULT_DURATION_HOURS = 1.5

function nextTimeForDay(day: number): string {
  const itemsOnDay = trip.value.items.filter((item) => item.day === day)
  const hour = START_HOUR + itemsOnDay.length * DEFAULT_DURATION_HOURS
  const wholeHour = Math.floor(hour)
  const minutes = hour % 1 === 0 ? '00' : '30'
  return `${String(wholeHour).padStart(2, '0')}:${minutes}`
}

export function useTripPlanner() {
  const destinationById = computed(
    () => new Map(destinations.map((destination) => [destination.id, destination]))
  )

  function itemsForDay(day: number) {
    return trip.value.items
      .filter((item) => item.day === day)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  function addDestination(destinationId: number, day: number) {
    const item: ItineraryItem = {
      id: crypto.randomUUID(),
      destinationId,
      day,
      time: nextTimeForDay(day),
      durationLabel: '1.5 hours',
    }
    trip.value.items.push(item)
  }

  function removeItem(itemId: string) {
    trip.value.items = trip.value.items.filter((item) => item.id !== itemId)
  }

  function setName(name: string) {
    trip.value.name = name
  }

  function setDays(days: number) {
    trip.value.days = days
    trip.value.items = trip.value.items.filter((item) => item.day <= days)
  }

  // Distance/time have no real geodata behind them — this is a simple,
  // clearly-labeled estimate based on the number of stops in the trip.
  const summary = computed(() => {
    const placeCount = trip.value.items.length
    const totalDistanceKm = Math.max(0, placeCount - 1) * 12
    const totalTravelHours = totalDistanceKm / 40

    return {
      places: placeCount,
      days: trip.value.days,
      distanceKm: totalDistanceKm,
      travelHours: totalTravelHours,
    }
  })

  return { trip, destinationById, itemsForDay, addDestination, removeItem, setName, setDays, summary }
}
