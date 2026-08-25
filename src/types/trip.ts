export interface ItineraryItem {
  id: string
  destinationId: number
  day: number
  time: string
  durationLabel: string
}

export interface Trip {
  id: string
  name: string
  days: number
  items: ItineraryItem[]
}
