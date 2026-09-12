<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { MapRouteStop } from '../../types/route'
import { t } from '../../composables/useLanguage'

const props = defineProps<{
  stops: MapRouteStop[]
  selectedIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let routeLine: L.Polyline | null = null
let activeSegmentLine: L.Polyline | null = null
let markers: L.Marker[] = []
let userMarker: L.Marker | null = null
let streetLayer: L.TileLayer | null = null
let satelliteLayer: L.TileLayer | null = null
let resizeObserver: ResizeObserver | null = null

function markerIcon(order: number, selected: boolean) {
  return L.divIcon({
    className: 'route-marker-wrapper',
    html: `<span class="route-marker${selected ? ' is-selected' : ''}">${order}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  })
}

function renderRoute() {
  if (!map) return

  markers.forEach((marker) => marker.remove())
  markers = []
  routeLine?.remove()
  activeSegmentLine?.remove()
  activeSegmentLine = null

  const points = props.stops.map((stop) => [stop.destination.coordinates.latitude, stop.destination.coordinates.longitude] as L.LatLngExpression)
  routeLine = L.polyline(points, {
    color: '#d4a017',
    weight: 5,
    opacity: 0.95,
    dashArray: '9 8',
  }).addTo(map)

  props.stops.forEach((stop, index) => {
    const marker = L.marker(points[index], { icon: markerIcon(stop.order, index === props.selectedIndex) })
      .addTo(map as L.Map)
      .bindPopup(`<strong>${stop.order}. ${stop.destination.name}</strong><br>${stop.destination.country}`)
      .on('click', () => emit('select', index))
    markers.push(marker)
  })

  if (points.length > 1) {
    map.fitBounds(L.latLngBounds(points), { padding: [42, 42], maxZoom: 10 })
  } else if (points.length === 1) {
    map.setView(points[0], 10)
  }
}

function fitRoute() {
  if (!map || props.stops.length < 2) return
  const points = props.stops.map((stop) => [stop.destination.coordinates.latitude, stop.destination.coordinates.longitude] as L.LatLngExpression)
  map.fitBounds(L.latLngBounds(points), { padding: [42, 42], maxZoom: 10, animate: true })
}

function focusStop(index: number) {
  const marker = markers[index]
  if (marker && map) {
    map.panTo(marker.getLatLng(), { animate: true })
    marker.openPopup()
  }
}

function highlightSegment(index: number) {
  if (!map || index >= props.stops.length - 1) return
  const from = props.stops[index].destination.coordinates
  const to = props.stops[index + 1].destination.coordinates
  activeSegmentLine?.remove()
  activeSegmentLine = L.polyline([[from.latitude, from.longitude], [to.latitude, to.longitude]], {
    color: '#d4a017',
    weight: 8,
    opacity: 1,
    lineCap: 'round',
  }).addTo(map)
}

function showUserLocation(latitude: number, longitude: number) {
  if (!map) return
  userMarker?.remove()
  userMarker = L.marker([latitude, longitude], { icon: L.divIcon({ className: 'user-location-wrapper', html: '<span class="user-location-marker"></span>', iconSize: [24, 24], iconAnchor: [12, 12] }) })
    .addTo(map)
    .bindPopup('Your location')
  map.setView([latitude, longitude], Math.max(map.getZoom(), 13), { animate: true })
}

function setRouteLineVisible(visible: boolean) {
  if (!routeLine || !map) return
  if (visible) routeLine.addTo(map)
  else routeLine.remove()
}

function setMarkersVisible(visible: boolean) {
  markers.forEach((marker) => visible ? marker.addTo(map as L.Map) : marker.remove())
}

function setMapType(type: 'street' | 'satellite') {
  if (!map || !streetLayer || !satelliteLayer) return
  if (type === 'satellite') {
    streetLayer.remove()
    satelliteLayer.addTo(map)
  } else {
    satelliteLayer.remove()
    streetLayer.addTo(map)
  }
}

async function toggleFullscreen() {
  if (!mapElement.value) return
  if (document.fullscreenElement) await document.exitFullscreen()
  else await mapElement.value.parentElement?.requestFullscreen()
}

function focusSelected(index: number) {
  focusStop(index)
}

onMounted(async () => {
  await nextTick()
  if (!mapElement.value) return
  map = L.map(mapElement.value, {
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    inertia: true,
    inertiaDeceleration: 1800,
    inertiaMaxSpeed: 1500,
    wheelDebounceTime: 40,
    wheelPxPerZoomLevel: 80,
  })
  streetLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
    maxNativeZoom: 18,
  }).addTo(map)
  satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
    maxNativeZoom: 18,
  })
  resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false, animate: false }))
  resizeObserver.observe(mapElement.value)
  renderRoute()
})

watch(() => props.stops, renderRoute, { deep: true })
watch(() => props.selectedIndex, focusSelected)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  map?.remove()
  map = null
  activeSegmentLine = null
  userMarker = null
})

defineExpose({ fitRoute, focusStop, highlightSegment, showUserLocation, setRouteLineVisible, setMarkersVisible, setMapType, toggleFullscreen })
</script>

<template>
  <div ref="mapElement" class="map-view" :aria-label="t('Interactive itinerary map')"></div>
</template>

<style>
.map-view {
  min-height: 620px;
  height: min(70vh, 720px);
  overflow: hidden;
  border: 1px solid rgba(var(--color-primary-rgb), 0.28);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  background: #dbe5df;
  isolation: isolate;
  touch-action: none;
}

.route-marker-wrapper {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
}

.route-marker {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 3px solid var(--color-white);
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 2px 8px rgba(27, 67, 50, 0.35);
  color: var(--color-white);
  font-size: 13px;
  font-weight: 700;
}

.route-marker.is-selected {
  background: var(--color-accent);
  color: var(--color-primary);
  transform: scale(1.12);
}

.user-location-wrapper {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
}

.user-location-marker {
  width: 16px;
  height: 16px;
  border: 3px solid var(--color-white);
  border-radius: 50%;
  background: #3182ce;
  box-shadow: 0 0 0 7px rgba(49, 130, 206, 0.2), 0 2px 6px rgba(27, 67, 50, 0.3);
}

.leaflet-control-attribution {
  font-size: 10px;
}

@media (max-width: 640px) {
  .map-view {
    min-height: 380px;
    height: 56vh;
  }
}
</style>
