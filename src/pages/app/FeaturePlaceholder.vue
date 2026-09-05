<script setup lang="ts">
import { useRoute } from 'vue-router'
import Icon from '../../components/common/Icon.vue'

const route = useRoute()
</script>

<template>
  <div class="placeholder container">
    <Icon name="compass" :size="32" />
    <p class="eyebrow">TravelGo workspace</p>
    <h1>{{ route.meta.title || 'Coming soon' }}</h1>
    <p>This part of your travel companion is ready for its feature module.</p>
  </div>
</template>

<style scoped>
.placeholder {
  display: grid;
  place-items: center;
  min-height: 60vh;
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--color-primary);
}

.placeholder p:last-child {
  color: var(--color-muted);
}

.eyebrow {
  margin-top: 1rem;
  color: var(--color-accent);
  font-size: var(--fs-label);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>