import type { ExploreContentType } from './explore'

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'

export interface Booking {
  id: string
  userId: string
  serviceId: number
  serviceType: ExploreContentType
  serviceName: string
  date?: string
  time?: string
  startDate?: string
  endDate?: string
  guests?: number
  quantity?: number
  price: number
  totalPrice: number
  status: BookingStatus
  roomType?: string
  numberOfRooms?: number
  participants?: number
  specialRequest?: string
  tripId?: string
}
