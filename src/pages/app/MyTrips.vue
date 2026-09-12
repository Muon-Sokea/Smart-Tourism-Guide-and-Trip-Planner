<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMyTrips } from '../../composables/useMyTrips'
import { useBookings } from '../../composables/useBookings'
import { useTripPlanner } from '../../composables/useTripPlanner'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'
import type { Trip } from '../../types/trip'
import type { Booking } from '../../types/booking'

const router = useRouter()
const { upcomingTrips, pastTrips, tripById, deleteTrip } = useMyTrips()
const { bookings } = useBookings()
const { trip, setTripInfo, placeForItem } = useTripPlanner()

const selectedTripId = ref<string | null>(null)
const selectedTrip = computed(() => selectedTripId.value ? tripById(selectedTripId.value) : null)
const confirmDeleteId = ref<string | null>(null)

function viewTrip(tripId: string) {
  selectedTripId.value = tripId
}

function backToList() {
  selectedTripId.value = null
}

function editTrip(tripData: Trip) {
  setTripInfo({
    name: tripData.name,
    destination: tripData.destination,
    startDate: tripData.startDate,
    endDate: tripData.endDate,
  })
  trip.value.items = [...tripData.items]
  trip.value.budget = [...tripData.budget]
  trip.value.checklist = [...tripData.checklist]
  router.push('/trip-planner')
}

/** Load this saved trip into the planner so every page that reads the planner
    state (map route, summary, itinerary) shows THAT trip — not whatever was
    last open. The id travels with it, so map saves keep targeting this trip. */
function loadIntoPlanner(tripData: Trip) {
  setTripInfo({
    name: tripData.name,
    destination: tripData.destination,
    startDate: tripData.startDate,
    endDate: tripData.endDate,
  })
  trip.value.id = tripData.id
  trip.value.items = [...tripData.items]
  trip.value.budget = [...tripData.budget]
  trip.value.checklist = [...tripData.checklist]
}

/** View Route: put the saved trip into the planner first, then open the map
    without a focus param so it draws the full multi-stop route of that trip. */
function viewRoute(tripData: Trip) {
  if (!tripData.items.length) return
  loadIntoPlanner(tripData)
  router.push('/map')
}

function confirmDelete(tripId: string) {
  confirmDeleteId.value = tripId
}

function executeDelete() {
  if (confirmDeleteId.value) {
    deleteTrip(confirmDeleteId.value)
    if (selectedTripId.value === confirmDeleteId.value) {
      selectedTripId.value = null
    }
    confirmDeleteId.value = null
  }
}

function cancelDelete() {
  confirmDeleteId.value = null
}

function tripBookings(tripId: string): Booking[] {
  return bookings.value.filter((b) => b.tripId === tripId)
}

function tripBudgetTotal(tripData: Trip): number {
  return tripData.budget.reduce((sum, e) => sum + e.amount, 0)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${dateStr}T00:00:00`))
}

function tripStatus(tripData: Trip): string {
  const today = new Date().toISOString().slice(0, 10)
  if (!tripData.startDate) return 'Planned'
  if (tripData.endDate && tripData.endDate < today) return 'Completed'
  if (tripData.startDate > today) return 'Upcoming'
  return 'In Progress'
}

function statusClass(tripData: Trip): string {
  const status = tripStatus(tripData)
  if (status === 'Completed') return 'status-completed'
  if (status === 'In Progress') return 'status-active'
  return 'status-upcoming'
}

function destName(destination: string): string {
  return destination ? destination.split(',')[0].trim() : 'Unknown'
}

function destCountry(destination: string): string {
  const parts = destination.split(',')
  return parts.length > 1 ? parts.slice(1).join(',').trim() : ''
}
</script>

<template>
  <div class="my-trips">
    <div class="container">
      <!-- Trip Details View -->
      <template v-if="selectedTrip">
        <div class="detail-header">
          <button type="button" class="back-btn" @click="backToList"><Icon name="arrow-left" :size="16" /> Back to My Trips</button>
          <div class="detail-actions">
            <Button variant="outline" @click="editTrip(selectedTrip!)"><Icon name="edit" :size="15" /> Edit Trip</Button>
            <Button variant="accent" :disabled="!selectedTrip!.items.length" @click="viewRoute(selectedTrip!)"><Icon name="route" :size="15" /> View Route</Button>
          </div>
        </div>

        <header class="detail-hero">
          <div>
            <p class="eyebrow">Trip Details</p>
            <h1>{{ selectedTrip.name }}</h1>
            <p class="detail-subtitle">{{ selectedTrip.destination || 'No destination set' }}</p>
          </div>
          <span class="status-badge" :class="statusClass(selectedTrip)">{{ tripStatus(selectedTrip) }}</span>
        </header>

        <!-- Trip Overview -->
        <section class="detail-section overview-card">
          <h2>Trip Overview</h2>
          <div class="overview-grid">
            <div class="overview-item"><Icon name="calendar" :size="18" /><div><span class="overview-label">Dates</span><strong>{{ formatDate(selectedTrip.startDate) }} — {{ formatDate(selectedTrip.endDate) }}</strong></div></div>
            <div class="overview-item"><Icon name="clock" :size="18" /><div><span class="overview-label">Duration</span><strong>{{ selectedTrip.days }} days</strong></div></div>
            <div class="overview-item"><Icon name="map-pin" :size="18" /><div><span class="overview-label">Places</span><strong>{{ selectedTrip.items.length }} activities</strong></div></div>
            <div class="overview-item"><Icon name="compass" :size="18" /><div><span class="overview-label">Budget</span><strong>${{ tripBudgetTotal(selectedTrip).toFixed(0) }}</strong></div></div>
          </div>
        </section>

        <!-- Itinerary -->
        <section class="detail-section" v-if="selectedTrip.items.length">
          <h2>Itinerary</h2>
          <div class="itinerary-timeline">
            <div v-for="day in selectedTrip.days" :key="day" class="day-group">
              <h3 class="day-label">Day {{ day }}</h3>
              <div v-if="selectedTrip.items.filter(i => i.day === day).length" class="day-items">
                <div v-for="item in selectedTrip.items.filter(i => i.day === day).sort((a, b) => a.time.localeCompare(b.time))" :key="item.id" class="itinerary-item">
                  <span class="item-time">{{ item.time }}</span>
                  <div class="item-details">
                    <strong>{{ placeForItem(item)?.name ?? 'Unknown place' }}</strong>
                    <span>{{ placeForItem(item)?.country ?? '' }}{{ placeForItem(item) ? ' · ' : '' }}{{ item.durationLabel }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="no-items">No activities planned</p>
            </div>
          </div>
        </section>

        <!-- Budget -->
        <section class="detail-section" v-if="selectedTrip.budget.length">
          <h2>Budget</h2>
          <div class="budget-summary">
            <span class="budget-total">${{ tripBudgetTotal(selectedTrip).toFixed(2) }}</span>
            <span class="budget-count">{{ selectedTrip.budget.length }} expenses</span>
          </div>
          <div class="budget-list">
            <div v-for="expense in selectedTrip.budget" :key="expense.id" class="budget-row">
              <span class="budget-category">{{ expense.category }}</span>
              <span class="budget-desc">{{ expense.description }}</span>
              <span class="budget-amount">${{ expense.amount.toFixed(2) }}</span>
            </div>
          </div>
        </section>

        <!-- Checklist -->
        <section class="detail-section" v-if="selectedTrip.checklist.length">
          <h2>Checklist</h2>
          <div class="checklist-summary">
            {{ selectedTrip.checklist.filter(c => c.completed).length }} / {{ selectedTrip.checklist.length }} complete
          </div>
          <ul class="checklist-detail">
            <li v-for="item in selectedTrip.checklist" :key="item.id" :class="{ done: item.completed }">
              <Icon :name="item.completed ? 'check' : 'plus'" :size="14" />
              <span>{{ item.label }}</span>
            </li>
          </ul>
        </section>

        <!-- Booked Services -->
        <section class="detail-section" v-if="tripBookings(selectedTrip.id).length">
          <h2>Booked Services</h2>
          <div class="bookings-list">
            <div v-for="booking in tripBookings(selectedTrip.id)" :key="booking.id" class="booking-row">
              <div class="booking-info">
                <strong>{{ booking.serviceName }}</strong>
                <span>{{ booking.serviceType }} · {{ booking.date || booking.startDate || '—' }}</span>
              </div>
              <div class="booking-meta">
                <span class="booking-price">${{ booking.totalPrice }}</span>
                <span class="booking-status" :class="`status-${booking.status.toLowerCase()}`">{{ booking.status }}</span>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- Trip List View -->
      <template v-else>
        <header class="page-header">
          <div>
            <p class="eyebrow">Your journeys</p>
            <h1>My Trips</h1>
            <p class="page-subtitle">Manage your saved trips and continue planning your journey.</p>
          </div>
          <Button to="/trip-planner" variant="accent"><Icon name="plus" :size="16" /> Create New Trip</Button>
        </header>

        <!-- Empty State -->
        <div v-if="!upcomingTrips.length && !pastTrips.length" class="empty-state">
          <Icon name="compass" :size="40" />
          <h2>No trips yet</h2>
          <p>Start planning your next journey with TravelGo.</p>
          <Button to="/trip-planner" variant="accent"><Icon name="plus" :size="16" /> Create Your First Trip</Button>
        </div>

        <!-- Upcoming Trips -->
        <section v-if="upcomingTrips.length" class="trips-section">
          <h2>Upcoming Trips</h2>
          <div class="trips-grid">
            <div v-for="tripItem in upcomingTrips" :key="tripItem.id" class="trip-card">
              <div class="card-top">
                <div class="card-header">
                  <h3>{{ tripItem.name }}</h3>
                  <span class="status-badge" :class="statusClass(tripItem)">{{ tripStatus(tripItem) }}</span>
                </div>
                <p class="card-destination">{{ destName(tripItem.destination) }}<span v-if="destCountry(tripItem.destination)">, {{ destCountry(tripItem.destination) }}</span></p>
              </div>
              <div class="card-stats">
                <span><Icon name="calendar" :size="14" /> {{ formatDate(tripItem.startDate) }} — {{ formatDate(tripItem.endDate) }}</span>
                <span><Icon name="clock" :size="14" /> {{ tripItem.days }} days</span>
                <span><Icon name="map-pin" :size="14" /> {{ tripItem.items.length }} places</span>
                <span><Icon name="compass" :size="14" /> ${{ tripBudgetTotal(tripItem).toFixed(0) }}</span>
              </div>
              <div class="card-actions">
                <Button variant="primary" @click="viewTrip(tripItem.id)">View Trip</Button>
                <Button variant="outline" @click="editTrip(tripItem)"><Icon name="edit" :size="14" /> Edit</Button>
                <button v-if="confirmDeleteId !== tripItem.id" type="button" class="delete-btn" @click="confirmDelete(tripItem.id)"><Icon name="trash" :size="14" /> Delete</button>
                <div v-else class="confirm-delete">
                  <span>Delete?</span>
                  <button type="button" class="confirm-yes" @click="executeDelete">Yes</button>
                  <button type="button" class="confirm-no" @click="cancelDelete">No</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Past Trips -->
        <section v-if="pastTrips.length" class="trips-section">
          <h2>Past Trips</h2>
          <div class="trips-grid past">
            <div v-for="tripItem in pastTrips" :key="tripItem.id" class="trip-card compact">
              <div class="card-top">
                <div class="card-header">
                  <h3>{{ tripItem.name }}</h3>
                  <span class="status-badge status-completed">Completed</span>
                </div>
                <p class="card-destination">{{ destName(tripItem.destination) }}<span v-if="destCountry(tripItem.destination)">, {{ destCountry(tripItem.destination) }}</span></p>
              </div>
              <div class="card-stats">
                <span><Icon name="calendar" :size="14" /> {{ formatDate(tripItem.startDate) }} — {{ formatDate(tripItem.endDate) }}</span>
                <span><Icon name="map-pin" :size="14" /> {{ tripItem.items.length }} places</span>
              </div>
              <div class="card-actions">
                <Button variant="outline" @click="viewTrip(tripItem.id)">View Trip</Button>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.my-trips { padding: 2.25rem 0 3.25rem; }
.page-header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; }
.page-subtitle { margin-top: 0.4rem; color: var(--color-muted); max-width: 520px; }
.eyebrow { margin: 0 0 0.3rem; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1 { color: var(--color-primary); margin: 0; }
h2 { color: var(--color-primary); margin: 0 0 1rem; }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 4rem 1.5rem; text-align: center; color: var(--color-primary); }
.empty-state h2 { margin-top: 0.5rem; }
.empty-state p { color: var(--color-muted); margin-bottom: 0.5rem; }

/* Trip Sections */
.trips-section { margin-bottom: 2.5rem; }
.trips-section h2 { font-size: var(--fs-section-title); }

/* Trip Cards Grid */
.trips-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.15rem; }
.trips-grid.past { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

.trip-card { display: flex; flex-direction: column; gap: 0.85rem; padding: 1.25rem; border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); border: 1px solid rgba(var(--color-primary-rgb), 0.08); transition: box-shadow 0.2s; }
.trip-card:hover { box-shadow: 0 6px 20px rgba(27, 67, 50, 0.16); }
.trip-card.compact { padding: 1rem; }

.card-top { display: flex; flex-direction: column; gap: 0.35rem; }
.card-header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.card-header h3 { color: var(--color-primary); font-size: var(--fs-card-title); font-weight: 700; }
.card-destination { color: var(--color-muted); font-size: var(--fs-card-desc); }

.card-stats { display: flex; flex-wrap: wrap; gap: 0.65rem 1.25rem; color: var(--color-muted); font-size: var(--fs-small); }
.card-stats span { display: inline-flex; align-items: center; gap: 0.3rem; }

.card-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; padding-top: 0.5rem; border-top: 1px solid rgba(var(--color-primary-rgb), 0.08); }

/* Status Badges */
.status-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: var(--fs-small); font-weight: 600; white-space: nowrap; }
.status-upcoming { background: rgba(var(--color-accent-rgb), 0.15); color: var(--color-accent); }
.status-active { background: rgba(45, 106, 79, 0.12); color: var(--color-primary-light); }
.status-completed { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-muted); }

/* Delete */
.delete-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.4rem 0.75rem; border: 1px solid rgba(180, 60, 50, 0.25); border-radius: 999px; background: transparent; color: #a33a2b; font-size: var(--fs-small); font-weight: 600; cursor: pointer; }
.delete-btn:hover { background: rgba(180, 60, 50, 0.08); }
.confirm-delete { display: flex; align-items: center; gap: 0.4rem; font-size: var(--fs-small); color: var(--color-muted); }
.confirm-yes, .confirm-no { padding: 0.25rem 0.6rem; border: 0; border-radius: 6px; font-size: var(--fs-small); font-weight: 600; cursor: pointer; }
.confirm-yes { background: #a33a2b; color: #fff; }
.confirm-no { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); }

/* Detail View */
.detail-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.back-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0; border: 0; background: none; color: var(--color-primary); font-weight: 600; cursor: pointer; }
.detail-actions { display: flex; gap: 0.5rem; }

.detail-hero { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1); }
.detail-subtitle { margin-top: 0.35rem; color: var(--color-muted); }

.detail-section { background: var(--color-white); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.25rem; margin-bottom: 1.25rem; }
.detail-section h2 { font-size: var(--fs-section-title); margin-bottom: 1rem; }

/* Overview */
.overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.overview-item { display: flex; align-items: flex-start; gap: 0.65rem; color: var(--color-primary); }
.overview-label { display: block; color: var(--color-muted); font-size: var(--fs-small); margin-bottom: 0.15rem; }
.overview-item strong { font-size: var(--fs-card-title); }

/* Itinerary */
.itinerary-timeline { display: grid; gap: 1rem; }
.day-label { color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
.day-items { display: grid; gap: 0.4rem; }
.itinerary-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 8px; background: rgba(var(--color-primary-rgb), 0.03); }
.item-time { color: var(--color-muted); font-size: var(--fs-small); font-weight: 600; min-width: 48px; }
.item-details { display: grid; gap: 0.1rem; }
.item-details strong { color: var(--color-primary); font-size: var(--fs-card-desc); }
.item-details span { color: var(--color-muted); font-size: var(--fs-small); }
.no-items { color: var(--color-muted); font-size: var(--fs-card-desc); font-style: italic; }

/* Budget */
.budget-summary { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1rem; }
.budget-total { color: var(--color-primary); font-size: var(--fs-stat); font-weight: 700; }
.budget-count { color: var(--color-muted); font-size: var(--fs-small); }
.budget-list { display: grid; gap: 0.4rem; }
.budget-row { display: grid; grid-template-columns: 1fr 2fr auto; gap: 0.75rem; align-items: center; padding: 0.55rem 0.75rem; border-radius: 8px; background: rgba(var(--color-primary-rgb), 0.03); font-size: var(--fs-card-desc); }
.budget-category { color: var(--color-accent); font-weight: 600; font-size: var(--fs-small); }
.budget-desc { color: var(--color-text); }
.budget-amount { color: var(--color-primary); font-weight: 700; text-align: right; }

/* Checklist */
.checklist-summary { color: var(--color-muted); font-size: var(--fs-small); margin-bottom: 0.75rem; }
.checklist-detail { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.35rem; }
.checklist-detail li { display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.6rem; border-radius: 6px; font-size: var(--fs-card-desc); color: var(--color-text); }
.checklist-detail li.done { color: var(--color-muted); text-decoration: line-through; }
.checklist-detail li .icon { color: var(--color-primary); }

/* Bookings */
.bookings-list { display: grid; gap: 0.5rem; }
.booking-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.7rem 0.85rem; border-radius: 8px; background: rgba(var(--color-primary-rgb), 0.03); }
.booking-info { display: grid; gap: 0.15rem; }
.booking-info strong { color: var(--color-primary); font-size: var(--fs-card-desc); }
.booking-info span { color: var(--color-muted); font-size: var(--fs-small); }
.booking-meta { display: flex; align-items: center; gap: 0.75rem; }
.booking-price { color: var(--color-primary); font-weight: 700; font-size: var(--fs-card-desc); }
.booking-status { padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 12px; font-weight: 600; }
.status-confirmed { background: rgba(45, 106, 79, 0.12); color: var(--color-primary-light); }
.status-pending { background: rgba(var(--color-accent-rgb), 0.15); color: var(--color-accent); }
.status-cancelled { background: rgba(180, 60, 50, 0.1); color: #a33a2b; }
.status-completed { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-muted); }

/* Responsive */
@media (max-width: 900px) { .overview-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 760px) {
  .page-header, .detail-header { flex-direction: column; align-items: flex-start; }
  .page-header :deep(.btn), .detail-actions { width: 100%; }
  .detail-actions :deep(.btn) { flex: 1; }
  .trips-grid { grid-template-columns: 1fr; }
  .detail-hero { flex-direction: column; align-items: flex-start; }
  .budget-row { grid-template-columns: 1fr auto; }
  .booking-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}
@media (max-width: 480px) { .overview-grid { grid-template-columns: 1fr; } .card-stats { flex-direction: column; gap: 0.35rem; } }
</style>
