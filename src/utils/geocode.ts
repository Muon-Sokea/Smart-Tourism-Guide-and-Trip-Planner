import { ref } from 'vue'

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface GeocodeResult extends GeoPoint {
  label: string
  /** Where the coordinates came from — cache, live geocode, or the offline fallback table. */
  source: 'cache' | 'geocoded' | 'fallback'
}

const CACHE_KEY = 'travelgo-geocode-cache'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

interface CacheEntry extends GeoPoint {
  label: string
  expiry: number
}

// Fuzzy in-memory cache so switching between services in the same city
// does not refetch, while the component-level reactive state still updates.
const memoryCache = new Map<string, GeocodeResult>()
const pendingRequests = new Map<string, Promise<GeocodeResult | null>>()

function loadCache(): Record<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {}
  } catch {
    return {}
  }
}

function saveToCache(key: string, entry: CacheEntry) {
  try {
    const cache = loadCache()
    cache[key] = entry
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Storage full or unavailable — memory cache still works for this session.
  }
}

function cacheKeyFor(query: string): string {
  return query.trim().toLowerCase()
}

/**
 * Offline fallbacks for the cities used across TravelGo's hotels, restaurants,
 * and activities data. Used when the geocoder is unreachable (offline demo),
 * so every service still shows a plausible real-world map position.
 */
const fallbackCoordinates: Record<string, GeoPoint> = {
  'siem reap, cambodia': { latitude: 13.3633, longitude: 103.8564 },
  'phnom penh, cambodia': { latitude: 11.5564, longitude: 104.9282 },
  'koh rong, cambodia': { latitude: 10.7156, longitude: 103.2464 },
  'angkor wat, cambodia': { latitude: 13.4125, longitude: 103.867 },
  'bangkok, thailand': { latitude: 13.7563, longitude: 100.5018 },
  'chiang mai, thailand': { latitude: 18.7883, longitude: 98.9853 },
  'phuket, thailand': { latitude: 7.8907, longitude: 98.3948 },
  'koh samui, thailand': { latitude: 9.5084, longitude: 100.0131 },
  'tokyo, japan': { latitude: 35.6762, longitude: 139.6503 },
  'mount fuji, japan': { latitude: 35.3606, longitude: 138.7274 },
  'kyoto, japan': { latitude: 35.0116, longitude: 135.7681 },
  'hanoi, vietnam': { latitude: 21.0278, longitude: 105.8342 },
  'ho chi minh city, vietnam': { latitude: 10.8231, longitude: 106.6297 },
  'ha long bay, vietnam': { latitude: 20.9101, longitude: 107.1839 },
  'ubud, bali, indonesia': { latitude: -8.5069, longitude: 115.2625 },
  'ubud, indonesia': { latitude: -8.5069, longitude: 115.2625 },
  'bali, indonesia': { latitude: -8.4095, longitude: 115.1889 },
  'seminyak, bali, indonesia': { latitude: -8.6912, longitude: 115.1571 },
  'central java, indonesia': { latitude: -7.2911, longitude: 110.2436 },
  'luang prabang, laos': { latitude: 19.8867, longitude: 102.135 },
  'bagan, myanmar': { latitude: 21.1717, longitude: 94.8585 },
  'santorini, greece': { latitude: 36.3932, longitude: 25.4615 },
}

function fallbackFor(location: string): GeocodeResult | null {
  const key = location.trim().toLowerCase()
  if (fallbackCoordinates[key]) {
    return { ...fallbackCoordinates[key], label: location, source: 'fallback' }
  }
  // Partial match: "Seminyak, Bali, Indonesia" style extra detail.
  for (const [candidate, point] of Object.entries(fallbackCoordinates)) {
    if (key.includes(candidate) || candidate.includes(key)) {
      return { ...point, label: location, source: 'fallback' }
    }
  }
  return null
}

/**
 * Synchronous fallback lookup for components that need an instant approximate
 * position (e.g. the Map page marker) before the precise geocode resolves.
 */
export function fallbackPointFor(location: string): GeocodeResult | null {
  return fallbackFor(location)
}

async function geocodeWithNominatim(location: string): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`,
      { headers: { Accept: 'application/json' } }
    )
    if (!response.ok) return null
    const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>
    const result = results[0]
    if (!result) return null
    return {
      latitude: Number(result.lat),
      longitude: Number(result.lon),
      label: result.display_name.split(',').slice(0, 3).join(',').trim(),
      source: 'geocoded',
    }
  } catch {
    return null
  }
}

/**
 * Resolve a location string ("Siem Reap, Cambodia") to real coordinates.
 * Order: in-memory cache → localStorage cache → live geocode → offline table.
 * Requests are de-duplicated so parallel lookups for the same place share one call.
 */
export async function geocodeLocation(location: string): Promise<GeocodeResult | null> {
  const trimmed = location.trim()
  if (!trimmed) return null

  const key = cacheKeyFor(trimmed)

  const memory = memoryCache.get(key)
  if (memory) return memory

  const stored = loadCache()[key]
  if (stored && stored.expiry > Date.now()) {
    const entry: GeocodeResult = { latitude: stored.latitude, longitude: stored.longitude, label: stored.label, source: 'cache' }
    memoryCache.set(key, entry)
    return entry
  }

  const existingRequest = pendingRequests.get(key)
  if (existingRequest) return existingRequest

  const request = (async () => {
    const geocoded = await geocodeWithNominatim(trimmed)
    if (geocoded) {
      memoryCache.set(key, geocoded)
      saveToCache(key, { ...geocoded, expiry: Date.now() + CACHE_TTL_MS })
      return geocoded
    }
    const fallback = fallbackFor(trimmed)
    if (fallback) {
      memoryCache.set(key, fallback)
      return fallback
    }
    return null
  })()

  pendingRequests.set(key, request)
  try {
    return await request
  } finally {
    pendingRequests.delete(key)
  }
}

/**
 * Reactive geocode for components: starts with a graceful fallback point when
 * available, then updates to the precise geocoded coordinates once resolved.
 */
export function useGeocodedPoint(location: () => string) {
  const point = ref<GeocodeResult | null>(null)
  const isLoading = ref(false)

  async function resolve() {
    const query = location()
    point.value = null
    if (!query) return

    isLoading.value = true
    // Show the offline fallback immediately (if any) so the map is never empty,
    // then refine with the live geocode result when it arrives.
    const fallback = fallbackFor(query)
    if (fallback) point.value = fallback
    const result = await geocodeLocation(query)
    if (result) point.value = result
    isLoading.value = false
  }

  return { point, isLoading, resolve }
}
