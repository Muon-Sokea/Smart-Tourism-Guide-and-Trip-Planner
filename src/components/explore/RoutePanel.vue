<script setup lang="ts">
import type { MapRouteStop } from '../../types/route'

defineProps<{
  stops: MapRouteStop[]
  selectedIndex: number
  distanceKm: number
  travelHours: number
}>()

defineEmits<{
  select: [index: number]
}>()
</script>

<template>
  <div class="route-panel">
    <!-- TODO: ordered list of stops with simple connecting line -->
  </div>
</template>

<style scoped></style>
