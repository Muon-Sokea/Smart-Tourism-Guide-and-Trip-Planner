import { computed, ref, watch } from 'vue'
import type { BudgetCategory, BudgetExpense, Trip, ItineraryItem, PlaceKind } from '../types/trip'
import type { Destination } from '../types/destination'
import { destinations } from '../data/destinations'
import { useMyTrips } from './useMyTrips'
import {
  SERVICE_DESTINATION_ID_OFFSET,
  serviceAsDestination,
  serviceCatalog,
  serviceLabel,
} from '../utils/serviceCatalog'

const STORAGE_KEY = 'travelgo-trip'

function defaultTrip(): Trip {
  return {
    id: crypto.randomUUID(),
    name: 'My Trip',
    destination: '',
    startDate: '',
    endDate: '',
    days: 3,
    items: [],
    budget: [],
    checklist: [
      { id: crypto.randomUUID(), label: 'Passport / ID', completed: false },
      { id: crypto.randomUUID(), label: 'Travel documents', completed: false },
      { id: crypto.randomUUID(), label: 'Charger', completed: false },
    ],
  }
}

function loadTrip(): Trip {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultTrip()
    const saved = JSON.parse(raw) as Partial<Trip>
    return {
      ...defaultTrip(),
      ...saved,
      items: saved.items ?? [],
      budget: saved.budget ?? [],
      checklist: saved.checklist ?? [],
    }
  } catch {
    return defaultTrip()
  }
}

/** A resolved itinerary entry: the displayable place plus what kind of place it is. */
export interface ResolvedPlace extends Destination {
  kind: PlaceKind
  kindLabel: string
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
const AVERAGE_TRAVEL_SPEED_KMH = 40

function distanceBetween(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number }
) {
  const earthRadiusKm = 6371
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const latitudeDelta = toRadians(second.latitude - first.latitude)
  const longitudeDelta = toRadians(second.longitude - first.longitude)
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(first.latitude)) *
      Math.cos(toRadians(second.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nextTimeForDay(day: number): string {
  const itemsOnDay = trip.value.items.filter((item) => item.day === day)
  const hour = START_HOUR + itemsOnDay.length * DEFAULT_DURATION_HOURS
  const wholeHour = Math.floor(hour)
  const minutes = hour % 1 === 0 ? '00' : '30'
  return `${String(wholeHour).padStart(2, '0')}:${minutes}`
}

function calculateDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 1
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const difference = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  return Math.max(1, Math.min(31, difference))
}

const { saveTrip } = useMyTrips()

export function useTripPlanner() {
  const destinationById = computed(
    () => new Map(destinations.map((destination) => [destination.id, destination]))
  )

  /* Every place an itinerary item can point at: destinations by their own id,
     hotels/restaurants/activities behind SERVICE_DESTINATION_ID_OFFSET so a
     service page and the planner share one single itinerary. */
  const placeById = computed(() => {
    const map = new Map<number, { place: Destination; kind: PlaceKind; kindLabel: string }>()
    for (const destination of destinations) {
      map.set(destination.id, { place: destination, kind: 'destination', kindLabel: 'Destination' })
    }
    for (const service of serviceCatalog) {
      map.set(SERVICE_DESTINATION_ID_OFFSET + service.id, {
        place: serviceAsDestination(service),
        kind: service.type,
        kindLabel: serviceLabel(service.type),
      })
    }
    return map
  })

  function placeForItem(item: ItineraryItem): ResolvedPlace | undefined {
    const entry = placeById.value.get(item.destinationId)
    return entry ? { ...entry.place, kind: entry.kind, kindLabel: entry.kindLabel } : undefined
  }

  function placeIdFor(kind: PlaceKind, placeId: number) {
    return kind === 'destination' ? placeId : SERVICE_DESTINATION_ID_OFFSET + placeId
  }

  /** True when this exact place is already part of the trip — one place, once. */
  function isPlaceInTrip(kind: PlaceKind, placeId: number) {
    return trip.value.items.some((item) => item.destinationId === placeIdFor(kind, placeId))
  }

  function itemsForDay(day: number) {
    return trip.value.items
      .filter((item) => item.day === day)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  /**
   * Add any place (destination, hotel, restaurant, activity) to the itinerary.
   * Returns 'exists' when the place is already in the trip — callers use that
   * for the "Added to Trip" state instead of creating a duplicate entry.
   */
  function addPlace(kind: PlaceKind, placeId: number, day: number): 'added' | 'exists' {
    if (isPlaceInTrip(kind, placeId)) return 'exists'
    const scheduledDay = Math.min(Math.max(1, day), Math.max(1, trip.value.days))
    const item: ItineraryItem = {
      id: crypto.randomUUID(),
      destinationId: placeIdFor(kind, placeId),
      day: scheduledDay,
      time: nextTimeForDay(scheduledDay),
      durationLabel: '1.5 hours',
      kind,
    }
    trip.value.items.push(item)
    return 'added'
  }

  function addDestination(destinationId: number, day: number) {
    addPlace('destination', destinationId, day)
  }

  /** Swap an item's time slot with its neighbour on the same day to reorder. */
  function moveItem(itemId: string, direction: 'up' | 'down') {
    const items = trip.value.items
    const currentItem = items.find((item) => item.id === itemId)
    if (!currentItem) return
    const dayItems = items
      .filter((item) => item.day === currentItem.day)
      .sort((a, b) => a.time.localeCompare(b.time))
    const index = dayItems.findIndex((item) => item.id === itemId)
    const neighbor = direction === 'up' ? dayItems[index - 1] : dayItems[index + 1]
    if (!neighbor) return
    const movedTime = currentItem.time
    currentItem.time = neighbor.time
    neighbor.time = movedTime
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

  function setTripInfo(info: { name: string; destination: string; startDate: string; endDate: string }) {
    trip.value.name = info.name
    trip.value.destination = info.destination
    trip.value.startDate = info.startDate
    trip.value.endDate = info.endDate
    setDays(calculateDays(info.startDate, info.endDate))
  }

  function updateItem(itemId: string, changes: Partial<Pick<ItineraryItem, 'day' | 'time' | 'durationLabel'>>) {
    const item = trip.value.items.find((entry) => entry.id === itemId)
    if (item) Object.assign(item, changes)
  }

  function addExpense(category: BudgetCategory, description: string, amount: number) {
    trip.value.budget.push({ id: crypto.randomUUID(), category, description, amount })
  }

  function updateExpense(expenseId: string, changes: Partial<BudgetExpense>) {
    const expense = trip.value.budget.find((entry) => entry.id === expenseId)
    if (expense) Object.assign(expense, changes)
  }

  function removeExpense(expenseId: string) {
    trip.value.budget = trip.value.budget.filter((entry) => entry.id !== expenseId)
  }

  function addChecklistItem(label: string) {
    trip.value.checklist.push({ id: crypto.randomUUID(), label, completed: false })
  }

  function toggleChecklistItem(itemId: string) {
    const item = trip.value.checklist.find((entry) => entry.id === itemId)
    if (item) item.completed = !item.completed
  }

  function removeChecklistItem(itemId: string) {
    trip.value.checklist = trip.value.checklist.filter((entry) => entry.id !== itemId)
  }

  const summary = computed(() => {
    const orderedPlaces = [...trip.value.items]
      .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
      .map((item) => placeForItem(item))
      .filter((place): place is ResolvedPlace => Boolean(place))
    const totalDistanceKm = orderedPlaces.slice(1).reduce(
      (total, place, index) =>
        total + distanceBetween(orderedPlaces[index].coordinates, place.coordinates),
      0
    )
    const travelHours = totalDistanceKm / AVERAGE_TRAVEL_SPEED_KMH
    const travelMinutes = Math.round(travelHours * 60)

    return {
      places: orderedPlaces.length,
      days: trip.value.days,
      distanceKm: Math.round(totalDistanceKm * 10) / 10,
      travelHours,
      travelMinutes,
    }
  })

  const budgetTotal = computed(() => trip.value.budget.reduce((total, expense) => total + expense.amount, 0))
  const completedChecklist = computed(() => trip.value.checklist.filter((item) => item.completed).length)

  /* Shared "Royal Palace added to your trip" confirmation. One message for all
     detail pages, replaced (and auto-cleared) whenever a new place is added. */
  const lastAddedMessage = ref('')
  let addedMessageTimer: number | undefined

  function showPlaceAdded(name: string) {
    lastAddedMessage.value = `${name} added to your trip`
    window.clearTimeout(addedMessageTimer)
    addedMessageTimer = window.setTimeout(() => {
      lastAddedMessage.value = ''
    }, 2600)
  }

  function saveToMyTrips() {
    saveTrip(trip.value)
  }

  return {
    trip,
    saveToMyTrips,
    destinationById,
    placeById,
    placeForItem,
    isPlaceInTrip,
    itemsForDay,
    addPlace,
    addDestination,
    moveItem,
    removeItem,
    lastAddedMessage,
    showPlaceAdded,
    setName,
    setDays,
    setTripInfo,
    updateItem,
    addExpense,
    updateExpense,
    removeExpense,
    addChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    budgetTotal,
    completedChecklist,
    summary,
  }
}
