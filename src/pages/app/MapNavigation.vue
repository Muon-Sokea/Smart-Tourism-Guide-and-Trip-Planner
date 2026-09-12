<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTripPlanner } from '../../composables/useTripPlanner'
import { backLabelFor, useNavHistory } from '../../composables/useNavHistory'
import { fallbackPointFor, geocodeLocation } from '../../utils/geocode'
import type { MapRouteStop } from '../../types/route'
import type { Destination, DestinationCoordinates } from '../../types/destination'
import { SERVICE_DESTINATION_ID_OFFSET, destinationForServiceId, findService } from '../../utils/serviceCatalog'
import { t } from '../../composables/useLanguage'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'
import MapView from '../../components/explore/MapView.vue'
import RoutePanel from '../../components/explore/RoutePanel.vue'

const route = useRoute()
const { trip, destinationById, placeForItem, summary } = useTripPlanner()
// Back steps through the user's actual visit trail (step by step) — the map
// can be reached from the trip planner, a destination page, or a service page.
const { goBack, previousFullPath } = useNavHistory()
const mapView = ref<InstanceType<typeof MapView> | null>(null)
const activeDay = ref(0)
const selectedIndex = ref(0)
const routeStarted = ref(false)
const directionsActive = ref(false)
const showMore = ref(false)
const showSettings = ref(false)
const showRouteOptions = ref(false)
const routeLineVisible = ref(true)
const routeMarkersVisible = ref(true)
const mapType = ref<'street' | 'satellite'>('street')
const isFullscreen = ref(false)
const notice = ref('')
const savedRouteKey = computed(() => `travelgo-saved-route-${trip.value.id}-${activeDay.value}`)
const isSaved = ref(false)
const navigationOrigin = ref<DestinationCoordinates | null>(null)
const originLabel = ref('Your location')
const directionsOpen = ref(false)
const directionsLatitude = ref('')
const directionsLongitude = ref('')
const directionsLocation = ref('')
const isGeocoding = ref(false)
const directionsError = ref('')
const selectedDestination = computed(() => {
  const destinationId = Number(route.query.destination)
  if (!Number.isInteger(destinationId)) return undefined
  /* Focus mode: a destination id can be a plain catalog destination or a
     service-backed itinerary place (offset range) — both resolve here. */
  return destinationId >= SERVICE_DESTINATION_ID_OFFSET
    ? destinationForServiceId(destinationId)
    : destinationById.value.get(destinationId)
})

/* Service-focus mode: /map?service=hotel/3 — the map shows the REAL location
   of the selected hotel/restaurant/activity, geocoded from its own location
   string. Dynamic per place — never one fixed position. */
const focusedService = computed(() => {
  const serviceParam = typeof route.query.service === 'string' ? route.query.service : ''
  if (!serviceParam) return null
  const [serviceType, serviceId] = serviceParam.split('/')
  if (serviceType !== 'hotel' && serviceType !== 'restaurant' && serviceType !== 'activity') return null
  return findService(serviceType, Number(serviceId)) ?? null
})

// Coordinates resolve async: instant fallback from the city table first, then
// refined by the live geocode when it arrives.
const focusedServicePoint = ref<DestinationCoordinates | null>(null)

watch(
  () => [focusedService.value?.name, focusedService.value?.location] as const,
  async ([name, location]) => {
    if (!focusedService.value || !location) {
      focusedServicePoint.value = null
      return
    }
    const fallback = fallbackPointFor(location)
    focusedServicePoint.value = fallback
      ? { latitude: fallback.latitude, longitude: fallback.longitude }
      : null
    const geocoded = await geocodeLocation(location)
    // Guard against the user navigating to another service while resolving.
    if (focusedService.value && focusedService.value.name === name) {
      focusedServicePoint.value = geocoded
        ? { latitude: geocoded.latitude, longitude: geocoded.longitude }
        : focusedServicePoint.value
    }
  },
  { immediate: true }
)
/* A pseudo-Destination for the focused service so it flows through the same
   MapView/RoutePanel pipeline as trip stops — no duplicate map system. */
const focusedServiceStop = computed<MapRouteStop | null>(() => {
  const service = focusedService.value
  const point = focusedServicePoint.value
  if (!service || !point) return null
  const destination: Destination = {
    id: -2,
    name: service.name,
    country: service.location,
    category: service.category,
    rating: service.rating,
    bestTime: '',
    estimatedCost: service.price,
    image: service.image,
    description: service.description,
    highlights: [],
    coordinates: point,
  }
  return { id: `service-${service.type}-${service.id}`, order: 1, day: 1, time: '', destination }
})

const baseRouteStops = computed<MapRouteStop[]>(() => {
  if (focusedServiceStop.value) return [focusedServiceStop.value]
  if (selectedDestination.value) {
    return [{ id: `destination-${selectedDestination.value.id}`, order: 1, day: 1, time: '', destination: selectedDestination.value }]
  }
  return [...trip.value.items]
    .filter((item) => activeDay.value === 0 || item.day === activeDay.value)
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time)).flatMap((item, index) => {
    const place = placeForItem(item)
    return place ? [{ id: item.id, order: index + 1, day: item.day, time: item.time, destination: place }] : []
  })
})

const routeStops = computed<MapRouteStop[]>(() => {
  if (!navigationOrigin.value) return baseRouteStops.value
  const origin: Destination = {
    id: -1,
    name: originLabel.value,
    country: t('Current position'),
    category: t('Starting point'),
    rating: 0,
    bestTime: '',
    estimatedCost: '',
    image: '',
    description: '',
    highlights: [],
    coordinates: navigationOrigin.value,
  }
  return [{ id: 'navigation-origin', order: 1, day: 1, time: '', destination: origin }, ...baseRouteStops.value.map((stop, index) => ({ ...stop, order: index + 2 }))]
})

const routeDistanceKm = computed(() => routeStops.value.slice(1).reduce((total, stop, index) => {
  const from = routeStops.value[index].destination.coordinates
  const to = stop.destination.coordinates
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const latitudeDelta = toRadians(to.latitude - from.latitude)
  const longitudeDelta = toRadians(to.longitude - from.longitude)
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2
  return total + 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}, 0))
const routeTravelHours = computed(() => routeDistanceKm.value / 40)
const hasRoute = computed(() => routeStops.value.length > 0)
const isDestinationRoute = computed(() => Boolean(selectedDestination.value))
const isServiceRoute = computed(() => Boolean(focusedServiceStop.value))
const isFocusedRoute = computed(() => isDestinationRoute.value || isServiceRoute.value)
const focusedName = computed(() => selectedDestination.value?.name ?? focusedService.value?.name ?? '')
const mapBackLabel = computed(() =>
  t(backLabelFor(previousFullPath.value, isServiceRoute.value ? 'Back to Service' : isDestinationRoute.value ? 'Back to Destination' : 'Back to Trip Planner'))
)
const mapBackFallback = computed(() =>
  isServiceRoute.value ? '/explore' : isDestinationRoute.value ? `/explore/${selectedDestination.value?.id}` : '/trip-planner'
)
const routeTitle = computed(() => {
  if (isServiceRoute.value) return t('{name} Location', { name: focusedService.value?.name ?? '' })
  return isDestinationRoute.value ? t('{name} Location', { name: selectedDestination.value?.name ?? '' }) : t('View Route')
})
const routeSubtitle = computed(() => {
  if (isServiceRoute.value) {
    const point = focusedServicePoint.value
    const coords = point ? ` · ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}` : ''
    return `${focusedService.value?.location ?? ''}${coords}`
  }
  return isDestinationRoute.value
    ? `${selectedDestination.value?.country} · ${selectedDestination.value?.coordinates.latitude.toFixed(4)}, ${selectedDestination.value?.coordinates.longitude.toFixed(4)}`
    : t('{destination} · {days} Days · {activities} Activities', { destination: trip.value.destination || t('Plan your destinations'), days: trip.value.days, activities: trip.value.items.length })
})

watch(routeStops, (stops) => {
  if (selectedIndex.value >= stops.length) selectedIndex.value = Math.max(0, stops.length - 1)
  isSaved.value = localStorage.getItem(savedRouteKey.value) === 'true'
}, { immediate: true })

function syncFullscreenState() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

onMounted(() => document.addEventListener('fullscreenchange', syncFullscreenState))
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', syncFullscreenState))

function showNotice(message: string) {
  notice.value = message
  window.setTimeout(() => { notice.value = '' }, 2800)
}

function showDirections() {
  directionsActive.value = true
  routeStarted.value = false
  directionsOpen.value = true
  directionsError.value = ''
}

function displayDirections() {
  if (!navigationOrigin.value) return
  routeStarted.value = false
  routeLineVisible.value = true
  routeMarkersVisible.value = true
  nextTick(() => {
    mapView.value?.setRouteLineVisible(true)
    mapView.value?.setMarkersVisible(true)
    mapView.value?.fitRoute()
    showNotice(t('Route displayed.'))
  })
}

function startRoute() {
  requestCurrentLocation((coordinates) => {
    navigationOrigin.value = coordinates
    originLabel.value = t('Your location')
    directionsActive.value = false
    routeStarted.value = true
    selectedIndex.value = 0
    nextTick(() => {
      mapView.value?.fitRoute()
      mapView.value?.highlightSegment(0)
      showNotice(t('Navigation started to {name}.', { name: baseRouteStops.value[0]?.destination.name ?? '' }))
    })
  })
}

function requestCurrentLocation(onSuccess: (coordinates: DestinationCoordinates) => void) {
  if (!navigator.geolocation) {
    showNotice(t('Location access is not available in this browser.'))
    return
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => onSuccess({ latitude: coords.latitude, longitude: coords.longitude }),
    () => showNotice(t('Location access is required to start navigation.'))
  )
}

function useCurrentLocationForDirections() {
  requestCurrentLocation((coordinates) => {
    navigationOrigin.value = coordinates
    originLabel.value = t('Your location')
    directionsOpen.value = false
    displayDirections()
  })
}

async function submitDirections() {
  if (directionsLocation.value.trim()) {
    isGeocoding.value = true
    directionsError.value = ''
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(directionsLocation.value.trim())}`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('Location search failed')
      const results = await response.json() as Array<{ lat: string; lon: string; display_name: string }>
      const result = results[0]
      if (!result) {
        directionsError.value = t('We could not find that location. Try a city, address, or landmark.')
        return
      }
      navigationOrigin.value = { latitude: Number(result.lat), longitude: Number(result.lon) }
      originLabel.value = result.display_name.split(',').slice(0, 2).join(',')
      directionsOpen.value = false
      displayDirections()
      return
    } catch {
      directionsError.value = t('Location search is unavailable. Try again or enter coordinates below.')
    } finally {
      isGeocoding.value = false
    }
    return
  }
  const latitude = Number(directionsLatitude.value)
  const longitude = Number(directionsLongitude.value)
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    directionsError.value = t('Enter a valid latitude (-90 to 90) and longitude (-180 to 180).')
    return
  }
  navigationOrigin.value = { latitude, longitude }
  originLabel.value = t('Entered starting location')
  directionsOpen.value = false
  displayDirections()
}

function locateUser() {
  if (!navigator.geolocation) {
    showNotice(t('Location access is not available in this browser.'))
    return
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => { mapView.value?.showUserLocation(coords.latitude, coords.longitude); showNotice(t('Showing your location.')) },
    () => showNotice(t('Location access is required to show your position.'))
  )
}

async function shareRoute() {
  const shareData = { title: routeTitle.value, text: t('View {title} on TravelGo', { title: routeTitle.value }), url: window.location.href }
  if (navigator.share) {
    try { await navigator.share(shareData); return } catch { return }
  }
  try {
    await navigator.clipboard.writeText(window.location.href)
    showNotice(t('Route link copied.'))
  } catch { showNotice(t('Unable to copy the route link.')) }
}

function toggleSave() {
  isSaved.value = !isSaved.value
  if (isSaved.value) localStorage.setItem(savedRouteKey.value, 'true')
  else localStorage.removeItem(savedRouteKey.value)
  showNotice(isSaved.value ? t('Route saved.') : t('Route removed from saved routes.'))
}

function toggleRouteLine() {
  routeLineVisible.value = !routeLineVisible.value
  mapView.value?.setRouteLineVisible(routeLineVisible.value)
}

function toggleRouteMarkers() {
  routeMarkersVisible.value = !routeMarkersVisible.value
  mapView.value?.setMarkersVisible(routeMarkersVisible.value)
}

function clearRoute() {
  routeStarted.value = false
  directionsActive.value = false
  routeLineVisible.value = false
  routeMarkersVisible.value = false
  mapView.value?.setRouteLineVisible(false)
  mapView.value?.setMarkersVisible(false)
  showMore.value = false
  showNotice(t('Route cleared. Use Directions to restore it.'))
}

async function toggleFullscreen() {
  await mapView.value?.toggleFullscreen()
  syncFullscreenState()
  showMore.value = false
}

function changeMapType(type: 'street' | 'satellite') {
  mapType.value = type
  mapView.value?.setMapType(type)
}
</script>

<template>
  <section class="route-page">
    <header class="route-header">
      <div>
        <p class="eyebrow">{{ t('Your journey') }}</p>
        <h1>{{ routeTitle }}</h1>
        <div class="trip-info"><strong>{{ isFocusedRoute ? focusedName : trip.name }}</strong><span>{{ routeSubtitle }}</span></div>
      </div>
      <Button variant="outline" @click="goBack(mapBackFallback)"><Icon name="arrow-left" :size="16" /> {{ mapBackLabel }}</Button>
    </header>

    <section v-if="directionsOpen" class="directions-dialog" aria-labelledby="directions-title">
      <div class="directions-dialog-header">
        <div><p class="eyebrow">{{ t('Directions') }}</p><h2 id="directions-title">{{ t('Choose a starting location') }}</h2></div>
        <button type="button" class="dialog-close" :aria-label="t('Close directions')" @click="directionsOpen = false">&times;</button>
      </div>
      <p class="dialog-copy">{{ t('Tell us where your journey begins, then we will draw the route to {name}.', { name: baseRouteStops[0]?.destination.name ?? '' }) }}</p>
      <div class="dialog-actions"><Button variant="accent" @click="useCurrentLocationForDirections"><Icon name="navigation" :size="16" /> {{ t('Use my current location') }}</Button></div>
      <form class="coordinates-form" @submit.prevent="submitDirections">
        <label class="location-field">{{ t('Starting place or address') }}<input v-model="directionsLocation" type="search" :placeholder="t('e.g. Phnom Penh, Cambodia')" autocomplete="street-address" /></label>
        <label>{{ t('Starting latitude') }}<input v-model="directionsLatitude" type="number" step="any" min="-90" max="90" placeholder="e.g. 13.4125" /></label>
        <label>{{ t('Starting longitude') }}<input v-model="directionsLongitude" type="number" step="any" min="-180" max="180" placeholder="e.g. 103.867" /></label>
        <p v-if="directionsError" class="form-error" role="alert">{{ directionsError }}</p>
        <button type="submit" class="dialog-submit" :disabled="isGeocoding">{{ isGeocoding ? t('Finding location...') : t('Use entered location') }}</button>
      </form>
    </section>

    <nav v-if="!isFocusedRoute && trip.days > 1" class="day-filter" :aria-label="t('Filter route by day')">
      <button type="button" :class="{ active: activeDay === 0 }" @click="activeDay = 0">{{ t('All Days') }}</button>
      <button v-for="day in trip.days" :key="day" type="button" :class="{ active: activeDay === day }" @click="activeDay = day">{{ t('Day {day}', { day }) }}</button>
    </nav>

    <div v-if="hasRoute" class="route-layout">
      <div class="map-shell">
        <MapView ref="mapView" :stops="routeStops" :selected-index="selectedIndex" @select="selectedIndex = $event" />
        <div class="map-top-controls">
          <button type="button" class="map-icon-button location-button" :title="t('My Location')" :aria-label="t('My Location')" @click="locateUser"><Icon name="navigation" :size="19" /></button>
          <div class="more-control">
            <button type="button" class="map-icon-button" :title="t('More map actions')" :aria-label="t('More map actions')" :aria-expanded="showMore" @click="showMore = !showMore"><Icon name="more-horizontal" :size="20" /></button>
            <div v-if="showMore" class="more-menu">
              <button type="button" @click="toggleFullscreen"><Icon name="fullscreen" :size="16" /> {{ isFullscreen ? t('Exit Fullscreen') : t('Fullscreen') }}</button>
              <button type="button" @click="showSettings = !showSettings; showRouteOptions = false"><Icon name="settings" :size="16" /> {{ t('Map Settings') }}</button>
              <button type="button" @click="showRouteOptions = !showRouteOptions; showSettings = false"><Icon name="route" :size="16" /> {{ t('Route Options') }}</button>
              <div v-if="showSettings" class="submenu">
                <button type="button" :class="{ active: mapType === 'street' }" @click="changeMapType('street')">{{ t('Street map') }}</button>
                <button type="button" :class="{ active: mapType === 'satellite' }" @click="changeMapType('satellite')">{{ t('Satellite map') }}</button>
                <button type="button" :class="{ active: routeMarkersVisible }" @click="toggleRouteMarkers">{{ t('Route markers') }}</button>
                <button type="button" :class="{ active: routeLineVisible }" @click="toggleRouteLine">{{ t('Route line') }}</button>
              </div>
              <div v-if="showRouteOptions" class="submenu">
                <button type="button" @click="mapView?.fitRoute(); showMore = false">{{ t('Show all route') }}</button>
                <button type="button" @click="clearRoute">{{ t('Clear route') }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="map-bottom-controls">
          <button type="button" class="action-button" :class="{ active: directionsActive }" :aria-pressed="directionsActive" @click="showDirections"><Icon name="route" :size="17" /> {{ t('Directions') }}</button>
          <button type="button" class="action-button start-button" :class="{ active: routeStarted }" @click="startRoute"><Icon name="navigation" :size="17" /> {{ routeStarted ? t('Started') : t('Start') }}</button>
          <button type="button" class="action-button" @click="shareRoute"><Icon name="share" :size="17" /> {{ t('Share') }}</button>
          <button type="button" class="action-button" :class="{ active: isSaved }" @click="toggleSave"><Icon :name="isSaved ? 'bookmark-filled' : 'bookmark'" :size="17" /> {{ isSaved ? t('Saved') : t('Save') }}</button>
        </div>
        <p v-if="notice" class="map-notice" role="status">{{ notice }}</p>
      </div>
      <RoutePanel :stops="routeStops" :selected-index="selectedIndex" :distance-km="isFocusedRoute ? 0 : activeDay === 0 ? summary.distanceKm : routeDistanceKm" :travel-hours="isFocusedRoute ? 0 : activeDay === 0 ? summary.travelHours : routeTravelHours" @select="selectedIndex = $event" />
    </div>

    <div v-else class="empty-route">
      <h2>{{ t('No route available yet.') }}</h2>
      <p>{{ t('Add at least 2 places to your itinerary') }}<br>{{ t('to view your route.') }}</p>
      <Button variant="accent" @click="goBack('/trip-planner')">{{ t('Back to Trip Planner') }}</Button>
    </div>
  </section>
</template>

<style scoped>
.route-page { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem 3.5rem; }
.route-header { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.5rem; }
.directions-dialog { display: grid; gap: 1rem; width: 100%; margin: 0 0 1.5rem; padding: 1.25rem; border: 1px solid rgba(var(--color-primary-rgb), 0.14); border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); }
.directions-dialog-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.directions-dialog h2 { margin: 0; color: var(--color-primary); font-size: var(--fs-section-title); }
.dialog-close { width: 2rem; height: 2rem; border: 0; border-radius: 50%; background: rgba(var(--color-primary-rgb), 0.08); color: var(--color-primary); font-size: 1.25rem; cursor: pointer; }
.dialog-copy { margin: 0; color: var(--color-muted); line-height: 1.5; }
.dialog-actions { display: flex; flex-wrap: wrap; gap: .75rem; }
.coordinates-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; align-items: end; }
.coordinates-form .location-field { grid-column: 1 / -1; }
.coordinates-form label { display: grid; gap: .3rem; color: var(--color-primary); font-size: var(--fs-small); font-weight: 700; }
.coordinates-form input { min-width: 0; padding: .65rem; border: 1px solid rgba(var(--color-primary-rgb), .2); border-radius: 8px; background: var(--color-white); color: var(--color-text); font: inherit; }
.form-error { grid-column: 1 / -1; margin: 0; color: #a33a2b; font-size: var(--fs-small); }
.dialog-submit { min-height: 2.65rem; padding: .55rem .9rem; border: 2px solid var(--color-primary); border-radius: 999px; background: transparent; color: var(--color-primary); font: inherit; font-weight: 700; cursor: pointer; }
.dialog-submit:hover { background: var(--color-primary); color: var(--color-white); }
.dialog-submit:disabled { cursor: wait; opacity: .6; }
.eyebrow { margin: 0 0 0.35rem; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1 { color: var(--color-primary); }
.trip-info { display: grid; gap: 0.1rem; margin-top: 0.65rem; color: var(--color-muted); }
.trip-info strong { color: var(--color-primary); font-size: var(--fs-card-title); }
.trip-info span { font-size: var(--fs-card-desc); }
.day-filter { display: flex; gap: 0.45rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.day-filter button { padding: 0.5rem 0.85rem; border: 1px solid rgba(var(--color-primary-rgb), 0.2); border-radius: 999px; background: var(--color-white); color: var(--color-primary); cursor: pointer; }
.day-filter button.active, .day-filter button:hover { border-color: var(--color-primary); background: var(--color-primary); color: var(--color-white); }
.route-layout { display: grid; grid-template-columns: minmax(0, 1fr) 22rem; gap: 1.25rem; align-items: start; }
.map-shell { position: relative; z-index: 1; min-width: 0; }
.map-top-controls { position: absolute; z-index: 500; top: 1rem; right: 1rem; left: 1rem; display: flex; justify-content: flex-end; pointer-events: none; }
.more-control { position: relative; }
.map-icon-button, .action-button, .more-menu button { display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem; border: 1px solid rgba(var(--color-primary-rgb), 0.16); background: var(--color-white); color: var(--color-primary); box-shadow: 0 3px 12px rgba(27, 67, 50, 0.18); cursor: pointer; }
.map-icon-button { width: 2.7rem; height: 2.7rem; padding: 0; border-radius: 50%; pointer-events: auto; }
.location-button { position: absolute; top: 4rem; left: 0; }
.map-icon-button:hover, .map-icon-button:focus-visible, .action-button:hover, .action-button:focus-visible { border-color: var(--color-accent); color: var(--color-primary); outline: 3px solid rgba(var(--color-accent-rgb), 0.28); outline-offset: 2px; }
.map-bottom-controls { position: absolute; z-index: 500; right: 1rem; bottom: 1rem; left: 1rem; display: flex; justify-content: center; gap: 0.55rem; pointer-events: none; }
.action-button { min-height: 2.65rem; padding: 0.55rem 0.8rem; border-radius: 999px; font-size: var(--fs-small); font-weight: 700; pointer-events: auto; }
.action-button.active { background: var(--color-primary); color: var(--color-white); }
.action-button.active:hover { background: var(--color-accent); color: var(--color-primary); }
.more-menu { position: absolute; top: 3.25rem; right: 0; width: 12rem; padding: 0.4rem; border: 1px solid rgba(var(--color-primary-rgb), 0.15); border-radius: 0.7rem; background: var(--color-white); box-shadow: 0 8px 24px rgba(27, 67, 50, 0.2); }
.more-menu button { width: 100%; justify-content: flex-start; padding: 0.6rem 0.65rem; border: 0; border-radius: 0.4rem; box-shadow: none; background: transparent; font-size: var(--fs-small); text-align: left; }
.more-menu button:hover, .more-menu button:focus-visible, .more-menu button.active { background: rgba(var(--color-accent-rgb), 0.16); outline: none; }
.submenu { margin: 0.15rem 0 0.25rem 1rem; padding-left: 0.35rem; border-left: 2px solid rgba(var(--color-accent-rgb), 0.45); }
.submenu button { padding: 0.42rem 0.55rem; font-size: 12px; }
.menu-label { display: block; padding: 0.45rem 0.55rem; color: var(--color-muted); font-size: 12px; }
.map-notice { position: absolute; z-index: 500; right: 50%; bottom: 4.5rem; transform: translateX(50%); margin: 0; padding: 0.55rem 0.85rem; border-radius: 999px; background: var(--color-primary); color: var(--color-white); box-shadow: var(--shadow); font-size: var(--fs-small); white-space: nowrap; }
:global(.map-shell:fullscreen) { display: grid; place-items: stretch; width: 100vw; height: 100vh; background: var(--color-bg); }
:global(.map-shell:fullscreen) .map-view { width: 100%; height: 100%; min-height: 100vh; border: 0; border-radius: 0; box-shadow: none; }
:global(.map-shell:fullscreen) .map-bottom-controls { bottom: 1.5rem; }
.empty-route { display: flex; max-width: 430px; flex-direction: column; align-items: center; margin: 4rem auto 0; padding: 3.5rem 1.5rem; border: 1px dashed rgba(var(--color-primary-rgb), 0.28); border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); text-align: center; color: var(--color-primary); }
.empty-route h2 { margin-top: 1rem; }
.empty-route p { margin: 0.5rem 0 1.5rem; color: var(--color-muted); }
@media (max-width: 900px) { .route-layout { grid-template-columns: minmax(0, 1fr) 18rem; } }
@media (max-width: 760px) { .route-page { padding-top: 2rem; } .route-header { align-items: flex-start; flex-direction: column; } .route-header :deep(.btn) { width: 100%; } .route-layout { grid-template-columns: 1fr; } .map-top-controls { top: 0.75rem; right: 0.75rem; left: 0.75rem; } .location-button { top: 4rem; } .map-bottom-controls { right: 0.75rem; bottom: 0.75rem; left: 0.75rem; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.45rem; } .action-button { width: 100%; } .map-notice { bottom: 6.75rem; max-width: calc(100% - 1.5rem); overflow: hidden; text-overflow: ellipsis; } .coordinates-form { grid-template-columns: 1fr; } .form-error { grid-column: auto; } }
@media (max-width: 420px) { .action-button { padding-inline: 0.5rem; font-size: 12px; } }
</style>
