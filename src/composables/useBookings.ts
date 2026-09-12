import { ref, watch } from 'vue'
import type { ExploreContentType } from '../types/explore'
import type { Booking } from '../types/booking'

const STORAGE_KEY = 'travelgo-bookings'

function loadBookings(): Booking[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as Booking[]) : []
  } catch {
    return []
  }
}

const bookings = ref<Booking[]>(loadBookings())

watch(bookings, (value) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}, { deep: true })

function createBooking(input: Omit<Booking, 'id' | 'status'>) {
  const datePart = (input.startDate || input.date || new Date().toISOString()).replace(/-/g, '').slice(0, 8)
  const id = `TG-${datePart}-${String(bookings.value.length + 1).padStart(3, '0')}`
  const booking: Booking = { ...input, id, status: 'Confirmed' }
  bookings.value.push(booking)
  return booking
}

function bookingsForService(serviceType: ExploreContentType, serviceId: number) {
  return bookings.value.filter((booking) => booking.serviceType === serviceType && booking.serviceId === serviceId)
}

function cancelBooking(bookingId: string) {
  const booking = bookings.value.find((b) => b.id === bookingId)
  if (booking && (booking.status === 'Confirmed' || booking.status === 'Pending')) {
    booking.status = 'Cancelled'
  }
}

export function useBookings() {
  return { bookings, createBooking, bookingsForService, cancelBooking }
}
