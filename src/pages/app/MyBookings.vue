<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBookings } from '../../composables/useBookings'
import { findService, serviceLabel } from '../../utils/serviceCatalog'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'
import type { Booking, BookingStatus } from '../../types/booking'
import type { ExploreContentType } from '../../types/explore'

const { bookings, cancelBooking } = useBookings()

const activeFilter = ref<'all' | ExploreContentType>('all')
const selectedBookingId = ref<string | null>(null)
const selectedBooking = computed(() => selectedBookingId.value ? bookings.value.find(b => b.id === selectedBookingId.value) || null : null)
const confirmCancelId = ref<string | null>(null)

const filters: { label: string; value: 'all' | ExploreContentType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Hotels', value: 'hotel' },
  { label: 'Restaurants', value: 'restaurant' },
  { label: 'Activities', value: 'activity' },
]

const filteredBookings = computed(() =>
  activeFilter.value === 'all'
    ? bookings.value
    : bookings.value.filter(b => b.serviceType === activeFilter.value)
)

function viewDetails(bookingId: string) {
  selectedBookingId.value = bookingId
}

function backToList() {
  selectedBookingId.value = null
}

function confirmCancel(bookingId: string) {
  confirmCancelId.value = bookingId
}

function executeCancel() {
  if (confirmCancelId.value) {
    cancelBooking(confirmCancelId.value)
    if (selectedBookingId.value === confirmCancelId.value) {
      selectedBookingId.value = null
    }
    confirmCancelId.value = null
  }
}

function cancelCancel() {
  confirmCancelId.value = null
}

function getBookingService(booking: Booking) {
  return findService(booking.serviceType, booking.serviceId)
}

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function statusClass(status: BookingStatus): string {
  switch (status) {
    case 'Confirmed': return 'status-confirmed'
    case 'Pending': return 'status-pending'
    case 'Cancelled': return 'status-cancelled'
    case 'Completed': return 'status-completed'
  }
}

function typeIcon(type: ExploreContentType): string {
  if (type === 'hotel') return 'building'
  if (type === 'restaurant') return 'utensils'
  return 'flag'
}
</script>

<template>
  <div class="my-bookings">
    <div class="container">
      <!-- Booking Details View -->
      <template v-if="selectedBooking">
        <div class="detail-header">
          <button type="button" class="back-btn" @click="backToList"><Icon name="arrow-left" :size="16" /> Back to My Bookings</button>
          <div class="detail-actions">
            <Button :to="`/services/${selectedBooking.serviceType}/${selectedBooking.serviceId}`" variant="outline"><Icon name="compass" :size="15" /> View Service</Button>
          </div>
        </div>

        <header class="detail-hero">
          <div>
            <p class="eyebrow">{{ serviceLabel(selectedBooking.serviceType) }} Booking</p>
            <h1>{{ selectedBooking.serviceName }}</h1>
            <p class="detail-subtitle">{{ selectedBooking.id }}</p>
          </div>
          <span class="status-badge" :class="statusClass(selectedBooking.status)">{{ selectedBooking.status }}</span>
        </header>

        <!-- Service Image -->
        <div class="detail-image" v-if="getBookingService(selectedBooking)?.image">
          <img :src="getBookingService(selectedBooking)!.image" :alt="selectedBooking.serviceName" />
        </div>

        <!-- Booking Information -->
        <section class="detail-section">
          <h2>Booking Information</h2>
          <dl class="info-list">
            <div><dt>Booking Reference</dt><dd>{{ selectedBooking.id }}</dd></div>
            <div><dt>Service</dt><dd>{{ selectedBooking.serviceName }}</dd></div>
            <div><dt>Type</dt><dd>{{ serviceLabel(selectedBooking.serviceType) }}</dd></div>
            <div v-if="getBookingService(selectedBooking)?.location"><dt>Location</dt><dd>{{ getBookingService(selectedBooking)!.location }}</dd></div>
            <div><dt>Status</dt><dd><span class="status-badge" :class="statusClass(selectedBooking.status)">{{ selectedBooking.status }}</span></dd></div>
          </dl>
        </section>

        <!-- Hotel Details -->
        <section v-if="selectedBooking.serviceType === 'hotel'" class="detail-section">
          <h2>Stay Details</h2>
          <dl class="info-list">
            <div><dt>Check-in</dt><dd>{{ formatDate(selectedBooking.startDate) }}</dd></div>
            <div><dt>Check-out</dt><dd>{{ formatDate(selectedBooking.endDate) }}</dd></div>
            <div v-if="selectedBooking.roomType"><dt>Room Type</dt><dd>{{ selectedBooking.roomType }}</dd></div>
            <div v-if="selectedBooking.numberOfRooms"><dt>Number of Rooms</dt><dd>{{ selectedBooking.numberOfRooms }}</dd></div>
            <div v-if="selectedBooking.guests"><dt>Guests</dt><dd>{{ selectedBooking.guests }}</dd></div>
          </dl>
        </section>

        <!-- Restaurant Details -->
        <section v-if="selectedBooking.serviceType === 'restaurant'" class="detail-section">
          <h2>Reservation Details</h2>
          <dl class="info-list">
            <div><dt>Date</dt><dd>{{ formatDate(selectedBooking.date) }}</dd></div>
            <div v-if="selectedBooking.time"><dt>Time</dt><dd>{{ selectedBooking.time }}</dd></div>
            <div v-if="selectedBooking.guests"><dt>Number of Guests</dt><dd>{{ selectedBooking.guests }}</dd></div>
            <div v-if="selectedBooking.specialRequest"><dt>Special Request</dt><dd>{{ selectedBooking.specialRequest }}</dd></div>
          </dl>
        </section>

        <!-- Activity Details -->
        <section v-if="selectedBooking.serviceType === 'activity'" class="detail-section">
          <h2>Activity Details</h2>
          <dl class="info-list">
            <div><dt>Date</dt><dd>{{ formatDate(selectedBooking.date) }}</dd></div>
            <div v-if="selectedBooking.time"><dt>Time</dt><dd>{{ selectedBooking.time }}</dd></div>
            <div v-if="selectedBooking.participants"><dt>Participants</dt><dd>{{ selectedBooking.participants }}</dd></div>
          </dl>
        </section>

        <!-- Price -->
        <section class="detail-section price-section">
          <h2>Price</h2>
          <div class="price-breakdown">
            <div class="price-row" v-if="selectedBooking.price"><span>Unit Price</span><strong>${{ selectedBooking.price }}</strong></div>
            <div class="price-row total"><span>Total</span><strong>${{ selectedBooking.totalPrice }}</strong></div>
          </div>
        </section>

        <!-- Actions -->
        <div class="detail-footer" v-if="selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Pending'">
          <template v-if="confirmCancelId !== selectedBooking.id">
            <Button variant="outline" @click="confirmCancel(selectedBooking.id)"><Icon name="x" :size="15" /> Cancel Booking</Button>
          </template>
          <div v-else class="confirm-cancel">
            <span>Are you sure you want to cancel this booking?</span>
            <Button variant="accent" @click="executeCancel">Yes, Cancel</Button>
            <Button variant="outline" @click="cancelCancel">No, Keep</Button>
          </div>
        </div>
      </template>

      <!-- Bookings List View -->
      <template v-else>
        <header class="page-header">
          <div>
            <p class="eyebrow">Your bookings</p>
            <h1>My Bookings</h1>
            <p class="page-subtitle">Manage your hotel, restaurant, and activity bookings.</p>
          </div>
        </header>

        <!-- Filters -->
        <div class="filters">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            :class="['filter-btn', { active: activeFilter === filter.value }]"
            @click="activeFilter = filter.value"
          >{{ filter.label }}</button>
        </div>

        <!-- Empty State -->
        <div v-if="!filteredBookings.length" class="empty-state">
          <Icon name="bookmark" :size="40" />
          <h2 v-if="activeFilter === 'all'">No bookings yet</h2>
          <h2 v-else>No {{ activeFilter === 'hotel' ? 'hotel' : activeFilter === 'restaurant' ? 'restaurant' : 'activity' }} bookings</h2>
          <p v-if="activeFilter === 'all'">Explore hotels, restaurants, and activities and make your first booking.</p>
          <p v-else>You haven't booked any {{ activeFilter === 'hotel' ? 'hotels' : activeFilter === 'restaurant' ? 'restaurants' : 'activities' }} yet.</p>
          <Button to="/explore" variant="accent"><Icon name="compass" :size="16" /> Explore Services</Button>
        </div>

        <!-- Booking Cards -->
        <div v-else class="bookings-grid">
          <div v-for="booking in filteredBookings" :key="booking.id" class="booking-card">
            <div class="card-image" v-if="getBookingService(booking)?.image">
              <img :src="getBookingService(booking)!.image" :alt="booking.serviceName" />
              <span class="card-type"><Icon :name="typeIcon(booking.serviceType)" :size="14" /> {{ serviceLabel(booking.serviceType) }}</span>
            </div>
            <div class="card-body">
              <div class="card-top">
                <h3>{{ booking.serviceName }}</h3>
                <span class="status-badge" :class="statusClass(booking.status)">{{ booking.status }}</span>
              </div>
              <p v-if="getBookingService(booking)?.location" class="card-location"><Icon name="map-pin" :size="14" /> {{ getBookingService(booking)!.location }}</p>
              <div class="card-meta">
                <span><Icon name="calendar" :size="14" /> {{ booking.startDate ? `${formatDate(booking.startDate)} — ${formatDate(booking.endDate)}` : formatDate(booking.date) }}</span>
                <span class="card-price">${{ booking.totalPrice }}</span>
              </div>
              <div class="card-actions">
                <Button variant="primary" @click="viewDetails(booking.id)">View Details</Button>
                <Button v-if="booking.status === 'Confirmed' || booking.status === 'Pending'" variant="outline" :to="`/services/${booking.serviceType}/${booking.serviceId}`"><Icon name="compass" :size="14" /> View Service</Button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.my-bookings { padding: 2.25rem 0 3.25rem; }
.page-header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.page-subtitle { margin-top: 0.4rem; color: var(--color-muted); max-width: 520px; }
.eyebrow { margin: 0 0 0.3rem; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1 { color: var(--color-primary); margin: 0; }
h2 { color: var(--color-primary); margin: 0 0 1rem; }

/* Filters */
.filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.filter-btn { padding: 0.5rem 1rem; border: 1px solid rgba(var(--color-primary-rgb), 0.2); border-radius: 999px; background: var(--color-white); color: var(--color-primary); font-size: var(--fs-small); font-weight: 600; cursor: pointer; transition: all 0.2s; }
.filter-btn:hover { border-color: var(--color-primary); }
.filter-btn.active { border-color: var(--color-primary); background: var(--color-primary); color: var(--color-white); }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 4rem 1.5rem; text-align: center; color: var(--color-primary); }
.empty-state h2 { margin-top: 0.5rem; }
.empty-state p { color: var(--color-muted); margin-bottom: 0.5rem; max-width: 420px; }

/* Booking Cards */
.bookings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.15rem; }
.booking-card { display: flex; flex-direction: column; border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); border: 1px solid rgba(var(--color-primary-rgb), 0.08); overflow: hidden; transition: box-shadow 0.2s; }
.booking-card:hover { box-shadow: 0 6px 20px rgba(27, 67, 50, 0.16); }

.card-image { position: relative; }
.card-image img { display: block; width: 100%; height: 180px; object-fit: cover; }
.card-type { position: absolute; left: 0.75rem; bottom: 0.75rem; display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.6rem; border-radius: 999px; background: rgba(var(--scrim-rgb), 0.8); color: var(--color-on-dark); font-size: var(--fs-small); font-weight: 600; }

.card-body { display: flex; flex-direction: column; gap: 0.65rem; padding: 1rem 1.15rem 1.15rem; flex: 1; }
.card-top { display: flex; align-items: start; justify-content: space-between; gap: 0.5rem; }
.card-top h3 { color: var(--color-primary); font-size: var(--fs-card-title); font-weight: 700; }
.card-location { display: flex; align-items: center; gap: 0.3rem; color: var(--color-muted); font-size: var(--fs-small); }

.card-meta { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; color: var(--color-muted); font-size: var(--fs-small); }
.card-meta span { display: inline-flex; align-items: center; gap: 0.3rem; }
.card-price { color: var(--color-primary); font-weight: 700; font-size: var(--fs-card-desc); }

.card-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: auto; padding-top: 0.65rem; border-top: 1px solid rgba(var(--color-primary-rgb), 0.08); }

/* Status Badges */
.status-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: var(--fs-small); font-weight: 600; white-space: nowrap; }
.status-confirmed { background: rgba(45, 106, 79, 0.12); color: var(--color-primary-light); }
.status-pending { background: rgba(var(--color-accent-rgb), 0.15); color: var(--color-accent); }
.status-cancelled { background: rgba(180, 60, 50, 0.1); color: #a33a2b; }
.status-completed { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-muted); }

/* Detail View */
.detail-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.back-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0; border: 0; background: none; color: var(--color-primary); font-weight: 600; cursor: pointer; }
.detail-actions { display: flex; gap: 0.5rem; }

.detail-hero { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1); }
.detail-subtitle { margin-top: 0.35rem; color: var(--color-muted); font-size: var(--fs-small); }

.detail-image { margin-bottom: 1.25rem; border-radius: var(--radius); overflow: hidden; }
.detail-image img { display: block; width: 100%; max-height: 360px; object-fit: cover; }

.detail-section { background: var(--color-white); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.25rem; margin-bottom: 1rem; }
.detail-section h2 { font-size: var(--fs-section-title); margin-bottom: 1rem; }

.info-list { display: grid; gap: 0.75rem; margin: 0; }
.info-list div { display: flex; justify-content: space-between; gap: 1rem; padding-bottom: 0.65rem; border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1); }
.info-list div:last-child { border-bottom: 0; padding-bottom: 0; }
.info-list dt { color: var(--color-muted); }
.info-list dd { margin: 0; color: var(--color-primary); font-weight: 600; text-align: right; }

/* Price */
.price-section { background: rgba(var(--color-primary-rgb), 0.03); }
.price-breakdown { display: grid; gap: 0.5rem; }
.price-row { display: flex; justify-content: space-between; gap: 1rem; color: var(--color-muted); }
.price-row strong { color: var(--color-primary); }
.price-row.total { padding-top: 0.65rem; border-top: 1px solid rgba(var(--color-primary-rgb), 0.12); }
.price-row.total strong { font-size: var(--fs-card-title); color: var(--color-primary); }

/* Footer Actions */
.detail-footer { margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid rgba(var(--color-primary-rgb), 0.1); }
.confirm-cancel { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.confirm-cancel span { color: var(--color-muted); font-size: var(--fs-small); }

/* Responsive */
@media (max-width: 760px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .detail-header { flex-direction: column; align-items: flex-start; }
  .detail-hero { flex-direction: column; align-items: flex-start; }
  .bookings-grid { grid-template-columns: 1fr; }
  .info-list div { flex-direction: column; gap: 0.25rem; }
  .info-list dd { text-align: left; }
}
</style>
