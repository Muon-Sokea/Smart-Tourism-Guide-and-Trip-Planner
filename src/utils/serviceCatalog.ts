import { activities } from '../data/activities'
import { destinations } from '../data/destinations'
import { hotels } from '../data/hotels'
import { restaurants } from '../data/restaurants'
import type { ExploreContent, ExploreContentType } from '../types/explore'
import type { Destination } from '../types/destination'
import { fallbackPointFor } from './geocode'

export const serviceCatalog = [...hotels, ...restaurants, ...activities]

/* Catalog destinations used by serviceAsDestination before the city fallback table. */
const destinationsByLocation = destinations

export function findService(type: ExploreContentType, id: number): ExploreContent | undefined {
  return serviceCatalog.find((service) => service.type === type && service.id === id)
}

export function priceNumber(service: ExploreContent) {
  const match = service.price.match(/\d+(?:\.\d+)?/)
  return match ? Number(match[0]) : 0
}

export function serviceLabel(type: ExploreContentType) {
  return type === 'restaurant' ? 'Restaurant' : type === 'hotel' ? 'Hotel' : 'Activity'
}

/**
 * Service items get itinerary ids in their own range so they never collide
 * with the destination catalog — `idOffset + service.id`.
 */
export const SERVICE_DESTINATION_ID_OFFSET = 1000

/**
 * Inverse of the offset-id scheme: given an itinerary/offset id, return the
 * service-backed Destination (used by map focus links that point at a stop).
 */
export function destinationForServiceId(offsetId: number): Destination | undefined {
  const service = serviceCatalog.find((entry) => SERVICE_DESTINATION_ID_OFFSET + entry.id === offsetId)
  return service ? serviceAsDestination(service) : undefined
}

export function serviceAvailability(service: ExploreContent) {
  if (service.id % 13 === 0) return 'Not Available'
  return service.id % 11 === 0 ? 'Limited Availability' : 'Available'
}

/**
 * Approximate offline coordinates for the cities used by the service catalog.
 * Services only store a location string, so when no catalog destination matches
 * their city we fall back to this table (same source as the geocoder's
 * offline fallbacks) to keep every itinerary stop placeable on the map.
 */
const SERVICE_CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'siem reap': { latitude: 13.3633, longitude: 103.8564 },
  'phnom penh': { latitude: 11.5564, longitude: 104.9282 },
  'koh rong': { latitude: 10.7156, longitude: 103.2464 },
  bangkok: { latitude: 13.7563, longitude: 100.5018 },
  'chiang mai': { latitude: 18.7883, longitude: 98.9853 },
  phuket: { latitude: 7.8907, longitude: 98.3948 },
  'koh samui': { latitude: 9.5084, longitude: 100.0131 },
  tokyo: { latitude: 35.6762, longitude: 139.6503 },
  'mount fuji': { latitude: 35.3606, longitude: 138.7274 },
  kyoto: { latitude: 35.0116, longitude: 135.7681 },
  hanoi: { latitude: 21.0278, longitude: 105.8342 },
  'ho chi minh city': { latitude: 10.8231, longitude: 106.6297 },
  'ha long bay': { latitude: 20.9101, longitude: 107.1839 },
  ubud: { latitude: -8.5069, longitude: 115.2625 },
  bali: { latitude: -8.4095, longitude: 115.1889 },
  seminyak: { latitude: -8.6912, longitude: 115.1571 },
  'central java': { latitude: -7.2911, longitude: 110.2436 },
  'luang prabang': { latitude: 19.8867, longitude: 102.135 },
  bagan: { latitude: 21.1717, longitude: 94.8585 },
}

function cityPointFor(location: string): { latitude: number; longitude: number } {
  const normalized = location.trim().toLowerCase()
  for (const [city, point] of Object.entries(SERVICE_CITY_COORDINATES)) {
    if (normalized.includes(city)) return point
  }
  return { latitude: 0, longitude: 0 }
}

/**
 * Represent any hotel/restaurant/activity as a Destination-shaped object so it
 * flows through the existing itinerary, map, and route pipeline — a place added
 * from a service page and one added from the Trip Planner are the same thing.
 * Coordinates resolve like the map page: from a matching catalog destination,
 * else the city fallback table (refined live by the geocoder on the map).
 */
export function serviceAsDestination(service: ExploreContent): Destination {
  const matchingDestination = destinationsByLocation.find(
    (destination) =>
      `${destination.name}, ${destination.country}` === service.location ||
      destination.name === service.location.split(',')[0].trim()
  )
  const coordinates =
    matchingDestination?.coordinates ??
    fallbackPointFor(service.location) ??
    cityPointFor(service.location)
  return {
    id: SERVICE_DESTINATION_ID_OFFSET + service.id,
    name: service.name,
    country: service.location,
    category: service.category,
    rating: service.rating,
    bestTime: '',
    estimatedCost: service.price,
    image: service.image,
    description: service.description,
    highlights: [],
    coordinates,
  }
}
