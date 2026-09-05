import { computed, ref, watch } from 'vue'
import type { BudgetCategory, BudgetExpense, Trip, ItineraryItem } from '../types/trip'
import { destinations } from '../data/destinations'

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
    const orderedDestinations = [...trip.value.items]
      .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
      .map((item) => destinationById.value.get(item.destinationId))
      .filter((destination): destination is NonNullable<typeof destination> => Boolean(destination))
    const totalDistanceKm = orderedDestinations.slice(1).reduce(
      (total, destination, index) =>
        total + distanceBetween(orderedDestinations[index].coordinates, destination.coordinates),
      0
    )
    const totalTravelHours = totalDistanceKm / 40

    return {
      places: orderedDestinations.length,
      days: trip.value.days,
      distanceKm: Math.round(totalDistanceKm),
      travelHours: totalTravelHours,
    }
  })

  const budgetTotal = computed(() => trip.value.budget.reduce((total, expense) => total + expense.amount, 0))
  const completedChecklist = computed(() => trip.value.checklist.filter((item) => item.completed).length)

  return {
    trip,
    destinationById,
    itemsForDay,
    addDestination,
    removeItem,
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
