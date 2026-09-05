<script setup lang="ts">
import type { MapRouteStop } from '../../types/route'

defineProps<{
  stops: MapRouteStop[]
  selectedIndex: number
}>()

defineEmits<{
  select: [index: number]
}>()
</script>

<template>
  <div class="map-view">
    <!-- TODO: illustrative stop-by-stop route visual (no external map library) -->
  </div>
</template>

<style scoped></style>
