<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div class="empty-state">
    <p>{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--color-muted);
}

@media (max-width: 600px) {
  .empty-state :deep(.btn) {
    width: 100%;
    max-width: 320px;
  }
}
</style>
