export interface RouteStop {
  destinationId: number
  order: number
}

export interface TripRoute {
  tripId: string
  stops: RouteStop[]
}

export interface MapRouteStop {
  id: string
  order: number
  day: number
  time: string
  destination: Destination
}
import type { Destination } from './destination'
