<script setup lang="ts">
import type { RouteStop } from '../../types/route'

defineProps<{
  stops: RouteStop[]
}>()
</script>

<template>
  <div class="map-view">
    <!-- TODO: illustrative stop-by-stop route visual (no external map library) -->
  </div>
</template>

<style scoped></style>
