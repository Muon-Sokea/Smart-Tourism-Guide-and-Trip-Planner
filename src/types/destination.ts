export interface DestinationCoordinates {
  latitude: number
  longitude: number
}

export interface Destination {
  id: number
  name: string
  country: string
  category: string
  rating: number
  bestTime: string
  estimatedCost: string
  image: string
  description: string
  highlights: string[]
  coordinates: DestinationCoordinates
}
