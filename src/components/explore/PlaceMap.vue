<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeocodeResult } from '../../utils/geocode'
import { t } from '../../composables/useLanguage'

const props = defineProps<{
  /** Real coordinates for the place being shown. */
  point: GeocodeResult | null
  /** Human-readable place name shown in the marker popup. */
  title: string
  /** Extra context line under the title in the popup. */
  subtitle?: string
}>()

const mapElement = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null
let streetLayer: L.TileLayer | null = null
let satelliteLayer: L.TileLayer | null = null
let resizeObserver: ResizeObserver | null = null
let markerIcon: L.DivIcon | null = null

const isSatellite = ref(false)

function placeIcon() {
  return L.divIcon({
    className: 'place-marker-wrapper',
    html: '<span class="place-marker"></span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  })
}

function renderPoint() {
  if (!map || !props.point) return
  const position: L.LatLngExpression = [props.point.latitude, props.point.longitude]

  marker?.remove()
  marker = L.marker(position, { icon: markerIcon ?? placeIcon() })
    .addTo(map)
    .bindPopup(`<strong>${props.title}</strong>${props.subtitle ? `<br>${props.subtitle}` : ''}`)

  map.setView(position, Math.max(map.getZoom(), 15), { animate: true })
  marker.openPopup()
}

function toggleMapType() {
  if (!map || !streetLayer || !satelliteLayer) return
  if (isSatellite.value) {
    satelliteLayer.remove()
    streetLayer.addTo(map)
  } else {
    streetLayer.remove()
    satelliteLayer.addTo(map)
  }
  isSatellite.value = !isSatellite.value
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

  markerIcon = placeIcon()
  renderPoint()

  resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false, animate: false }))
  resizeObserver.observe(mapElement.value)
})

watch(() => props.point, () => {
  renderPoint()
  // Recenter tightly when the coordinates change (e.g. another service page).
  if (map && props.point) {
    map.setView([props.point.latitude, props.point.longitude], 15, { animate: true })
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  map?.remove()
  map = null
  marker = null
  markerIcon = null
})
</script>

<template>
  <div class="place-map" :aria-label="t('Service location map')">
    <div ref="mapElement" class="map-canvas"></div>
    <button type="button" class="map-type-btn" :aria-pressed="isSatellite" @click="toggleMapType">
      {{ isSatellite ? 'Street' : 'Satellite' }}
    </button>
    <span v-if="point" class="map-coords">
      {{ point.latitude.toFixed(4) }}, {{ point.longitude.toFixed(4) }}
    </span>
  </div>
</template>

<style scoped>
.place-map {
  position: relative;
  height: 340px;
  overflow: hidden;
  border-radius: var(--radius);
  border: 1px solid rgba(var(--color-primary-rgb), 0.28);
  background: #dbe5df;
  isolation: isolate;
  touch-action: none;
}

.map-canvas {
  width: 100%;
  height: 100%;
}

.map-type-btn {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 500;
  padding: 0.45rem 0.8rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-white);
  color: var(--color-primary);
  font-size: var(--fs-small);
  font-weight: 700;
  box-shadow: var(--shadow);
  cursor: pointer;
}

.map-type-btn:hover {
  color: var(--color-accent);
}

.map-coords {
  position: absolute;
  left: 0.7rem;
  bottom: 0.7rem;
  z-index: 500;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: rgba(var(--scrim-rgb), 0.8);
  color: var(--color-on-dark);
  font-size: 12px;
  font-weight: 600;
}

</style>

<!-- Marker HTML is injected by Leaflet at runtime, so these styles cannot be scoped. -->
<style>
.place-marker-wrapper {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
}

.place-marker {
  position: relative;
  width: 26px;
  height: 26px;
  border: 3px solid var(--color-white);
  border-radius: 50% 50% 50% 0;
  background: var(--color-accent);
  box-shadow: 0 3px 10px rgba(27, 67, 50, 0.4);
  transform: rotate(-45deg);
}

.place-marker::after {
  content: '';
  position: absolute;
  top: 5px;
  left: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
}
</style>
