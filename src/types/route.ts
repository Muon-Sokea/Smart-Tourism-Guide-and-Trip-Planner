export interface RouteStop {
  destinationId: number
  order: number
}

export interface TripRoute {
  tripId: string
  stops: RouteStop[]
}
