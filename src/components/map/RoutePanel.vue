<script setup lang="ts">
import type { TripRoute } from '../../types/route'

defineProps<{
  route: TripRoute
}>()
</script>

<template>
  <div class="route-panel">
    <!-- TODO: ordered list of stops with simple connecting line -->
  </div>
</template>

<style scoped></style>
