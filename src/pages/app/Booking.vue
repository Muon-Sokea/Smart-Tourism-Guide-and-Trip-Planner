<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { findService, priceNumber, serviceAvailability, serviceLabel } from '../../utils/serviceCatalog'
import { useBookings } from '../../composables/useBookings'
import { useTripPlanner } from '../../composables/useTripPlanner'
import { backLabelFor, useNavHistory } from '../../composables/useNavHistory'
import type { Booking } from '../../types/booking'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'

const route = useRoute()
// Back steps through the user's actual visit trail (step by step), falling
// back to Explore when this page was opened directly.
const { goBack, previousFullPath } = useNavHistory()
const backTarget = computed(() => previousFullPath.value || '/explore')
const backLabel = computed(() => backLabelFor(previousFullPath.value))
const { createBooking } = useBookings()
const { trip } = useTripPlanner()
const serviceType = computed(() => route.params.type as 'hotel' | 'restaurant' | 'activity')
const service = computed(() => findService(serviceType.value, Number(route.params.id)))
const step = ref<'form' | 'review' | 'confirmed'>('form')
const error = ref('')
const booking = ref<Booking | null>(null)
const form = reactive({ startDate: '', endDate: '', date: '', time: '', guests: 2, roomType: 'Standard Room', numberOfRooms: 1, specialRequest: '', participants: 2 })
const today = new Date().toISOString().slice(0, 10)
const price = computed(() => service.value ? priceNumber(service.value) : 0)
const nights = computed(() => form.startDate && form.endDate ? Math.max(0, Math.round((new Date(`${form.endDate}T00:00:00`).getTime() - new Date(`${form.startDate}T00:00:00`).getTime()) / 86400000)) : 0)
const total = computed(() => serviceType.value === 'hotel' ? price.value * nights.value * form.numberOfRooms : serviceType.value === 'activity' ? price.value * form.participants : 0)
const formTitle = computed(() => serviceType.value === 'restaurant' ? 'Restaurant Reservation' : `${serviceLabel(serviceType.value)} Booking`)

function validate() {
  error.value = ''
  if (!service.value || serviceAvailability(service.value) === 'Not Available') { error.value = 'This service is not available for booking.'; return false }
  if (serviceType.value === 'hotel') {
    if (!form.startDate || !form.endDate) error.value = 'Check-in and check-out dates are required.'
    else if (form.endDate <= form.startDate) error.value = 'Check-out must be after check-in.'
    else if (form.guests < 1 || form.numberOfRooms < 1) error.value = 'Guests and rooms must be greater than 0.'
  } else if (serviceType.value === 'restaurant') {
    if (!form.date || !form.time) error.value = 'Date and time are required.'
    else if (form.guests < 1) error.value = 'Guests must be greater than 0.'
  } else if (!form.date || !form.time) error.value = 'Date and time are required.'
  else if (form.participants < 1) error.value = 'Participants must be greater than 0.'
  return !error.value
}

function continueToReview() {
  if (validate()) step.value = 'review'
}

function confirmBooking() {
  if (!service.value || !validate()) return
  const input: Omit<Booking, 'id' | 'status'> = {
    userId: 'local-user', serviceId: service.value.id, serviceType: service.value.type, serviceName: service.value.name,
    price: price.value, totalPrice: total.value, tripId: trip.value.id,
    ...(serviceType.value === 'hotel' ? { startDate: form.startDate, endDate: form.endDate, guests: form.guests, quantity: form.numberOfRooms, roomType: form.roomType, numberOfRooms: form.numberOfRooms } : serviceType.value === 'restaurant' ? { date: form.date, time: form.time, guests: form.guests, specialRequest: form.specialRequest } : { date: form.date, time: form.time, participants: form.participants, quantity: form.participants }),
  }
  booking.value = createBooking(input)
  step.value = 'confirmed'
}

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : 'Not set'
}

/* The router reuses this component when the user jumps from one service's
   booking page to another (e.g. via related cards), so reset the flow and the
   form whenever the selected service changes — otherwise the new booking
   would start on the old service's review/confirmation step and stale dates. */
watch(service, () => {
  step.value = 'form'
  error.value = ''
  booking.value = null
  form.startDate = ''
  form.endDate = ''
  form.date = ''
  form.time = ''
  form.specialRequest = ''
})
</script>

<template>
  <div class="booking-page">
    <div class="container">
      <router-link :to="backTarget" class="back-link" @click.prevent="goBack()"><Icon name="arrow-left" :size="16" /> {{ backLabel }}</router-link>
      <div v-if="service" class="booking-layout">
        <main class="booking-main">
          <p class="eyebrow">TravelGo booking</p>
          <h1>{{ step === 'confirmed' ? 'Booking Confirmed' : formTitle }}</h1>
          <p class="booking-subtitle">{{ service.name }} · {{ service.location }}</p>

          <section v-if="step === 'form'" class="form-card">
            <div v-if="serviceType === 'hotel'" class="form-grid">
              <label>Check-in<input v-model="form.startDate" type="date" :min="today" /></label>
              <label>Check-out<input v-model="form.endDate" type="date" :min="form.startDate || today" /></label>
              <label>Guests<input v-model.number="form.guests" type="number" min="1" /></label>
              <label>Room Type<select v-model="form.roomType"><option>Standard Room</option><option>Deluxe Room</option><option>Family Room</option></select></label>
              <label>Number of Rooms<input v-model.number="form.numberOfRooms" type="number" min="1" /></label>
            </div>
            <div v-else class="form-grid">
              <label>Date<input v-model="form.date" type="date" :min="today" /></label>
              <label>Time<input v-model="form.time" type="time" /></label>
              <label v-if="serviceType === 'restaurant'">Guests<input v-model.number="form.guests" type="number" min="1" /></label>
              <label v-else>Participants<input v-model.number="form.participants" type="number" min="1" /></label>
              <label v-if="serviceType === 'restaurant'" class="wide">Special Request<textarea v-model="form.specialRequest" rows="3" placeholder="Optional"></textarea></label>
            </div>
            <p v-if="error" class="form-error" role="alert">{{ error }}</p>
            <Button variant="accent" @click="continueToReview">Continue</Button>
          </section>

          <section v-else-if="step === 'review'" class="form-card review-card">
            <h2>Review Booking</h2>
            <dl><div><dt>Service</dt><dd>{{ service.name }}</dd></div><div v-if="serviceType === 'hotel'"><dt>Stay</dt><dd>{{ formatDate(form.startDate) }} → {{ formatDate(form.endDate) }}</dd></div><div v-else><dt>Date and time</dt><dd>{{ formatDate(form.date) }} · {{ form.time }}</dd></div><div><dt>{{ serviceType === 'hotel' || serviceType === 'restaurant' ? 'Guests' : 'Participants' }}</dt><dd>{{ serviceType === 'activity' ? form.participants : form.guests }}</dd></div><div v-if="serviceType === 'hotel'"><dt>Room</dt><dd>{{ form.roomType }} · {{ form.numberOfRooms }} room(s)</dd></div><div v-if="serviceType === 'restaurant' && form.specialRequest"><dt>Request</dt><dd>{{ form.specialRequest }}</dd></div></dl>
            <div class="review-total"><span>{{ serviceType === 'restaurant' ? 'Payment' : 'Estimated Total' }}</span><strong>{{ serviceType === 'restaurant' ? 'Pay at Service / Demo Booking' : `$${total}` }}</strong></div>
            <div class="review-actions"><Button variant="outline" @click="step = 'form'">Back</Button><Button variant="accent" @click="confirmBooking">Confirm Booking</Button></div>
          </section>

          <section v-else class="confirmation-card"><div class="confirmation-icon"><Icon name="check" :size="25" /></div><h2>Your booking has been successfully created.</h2><p>{{ service.name }}</p><strong>{{ booking?.id }}</strong><span>{{ booking?.status }} · {{ serviceType === 'hotel' ? `${formatDate(booking?.startDate)} → ${formatDate(booking?.endDate)}` : formatDate(booking?.date) }}</span><strong v-if="booking?.totalPrice">Total ${{ booking.totalPrice }}</strong><div class="review-actions"><Button to="/bookings" variant="accent">View My Bookings</Button><Button to="/trip-planner" variant="outline">View My Trip</Button></div></section>
        </main>
        <aside class="service-summary"><img :src="service.image" :alt="service.name" /><div><p class="eyebrow">Your selection</p><h2>{{ service.name }}</h2><p>{{ service.location }}</p><strong>{{ service.price }}</strong><span>{{ serviceAvailability(service) }}</span></div></aside>
      </div>
      <div v-else class="not-found"><h1>Service not found</h1><Button variant="outline" @click="goBack()">{{ backLabel }}</Button></div>
    </div>
  </div>
</template>

<style scoped>
.booking-page { padding: 1.5rem 0 2.5rem; }
.back-link { display: inline-flex; align-items: center; gap: 0.35rem; margin-bottom: 1.5rem; color: var(--color-primary); font-weight: 600; }
.booking-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(21rem, 24rem); gap: 1.5rem; align-items: start; }
.booking-main { min-width: 0; padding-top: 0; }
.service-summary, .form-card, .confirmation-card { min-width: 0; }
.eyebrow { margin: 0 0 0.3rem; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1, h2 { color: var(--color-primary); }
.booking-subtitle { margin: 0.5rem 0 1.25rem; color: var(--color-muted); }
.form-card, .confirmation-card, .service-summary { padding: 1.5rem; border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.9rem; }
.form-grid label { display: grid; gap: 0.35rem; color: var(--color-primary); font-weight: 600; }
.form-grid .wide { grid-column: 1 / -1; }
input, select, textarea { width: 100%; border: 1px solid rgba(var(--color-primary-rgb), 0.2); border-radius: 8px; padding: 0.65rem; background: var(--color-white); color: var(--color-text); font: inherit; }
.form-card > .btn { margin-top: 1rem; }
.form-error { margin-top: 0.9rem; padding: 0.65rem; border-radius: 8px; background: rgba(var(--color-accent-rgb), 0.14); color: var(--color-primary); }
.service-summary { display: grid; gap: 1.15rem; align-self: start; }
.service-summary img { display: block; width: 100%; aspect-ratio: 16 / 10; min-height: 190px; object-fit: cover; border-radius: 10px; }
.service-summary h2 { margin-bottom: 0.3rem; font-size: var(--fs-card-title); }
.service-summary p:not(.eyebrow) { color: var(--color-muted); line-height: 1.45; }
.service-summary strong { display: block; margin-top: 0.75rem; color: var(--color-accent); font-size: var(--fs-card-title); }
.service-summary span { display: block; margin-top: 0.25rem; color: var(--color-primary); font-size: var(--fs-small); font-weight: 600; }
.review-card h2 { margin-bottom: 1rem; }
dl { display: grid; gap: 0.75rem; margin: 0; } dl div { display: flex; justify-content: space-between; gap: 1rem; padding-bottom: 0.65rem; border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1); } dt { color: var(--color-muted); } dd { margin: 0; color: var(--color-primary); font-weight: 600; text-align: right; }
.review-total { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1rem; color: var(--color-muted); } .review-total strong { color: var(--color-primary); }
.review-actions { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 1.25rem; }
.confirmation-card { display: grid; justify-items: center; gap: 0.75rem; text-align: center; } .confirmation-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--color-primary); color: var(--color-white); } .confirmation-card p, .confirmation-card span { color: var(--color-muted); } .confirmation-card strong { color: var(--color-primary); }
.not-found { padding: 3rem 0; text-align: center; }
@media (max-width: 850px) { .booking-layout { grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem); gap: 1rem; } .form-card, .confirmation-card, .service-summary { padding: 1.15rem; } }
@media (max-width: 700px) { .booking-layout { grid-template-columns: 1fr; } .service-summary { position: static; order: -1; } .service-summary img { min-height: 0; aspect-ratio: 16 / 9; } .form-grid { grid-template-columns: 1fr; } .form-grid .wide { grid-column: auto; } .review-actions :deep(.btn) { flex: 1 1 100%; } }
</style>
