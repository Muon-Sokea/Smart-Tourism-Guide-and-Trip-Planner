<script setup lang="ts">
import Icon from '../common/Icon.vue'

defineProps<{
  rating: number
}>()
</script>

<template>
  <span class="rating">
    <Icon name="star" :size="15" />
    {{ rating }}
  </span>
</template>

<style scoped>
.rating {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: var(--color-accent);
  font-size: var(--fs-label);
}
</style>
