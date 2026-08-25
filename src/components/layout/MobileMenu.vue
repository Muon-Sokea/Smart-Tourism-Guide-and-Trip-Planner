<script setup lang="ts">
defineProps<{
  links: { label: string; to: string }[]
  open: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div v-if="open" class="mobile-menu">
    <router-link
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="mobile-link"
      @click="$emit('close')"
    >
      {{ link.label }}
    </router-link>

    <slot name="extra" />
  </div>
</template>

<style scoped>
.mobile-menu {
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.1);
  padding: 0.5rem 1.5rem 1rem;
}

.mobile-menu :deep(.mobile-link) {
  display: block;
  width: 100%;
  padding: 0.75rem 0;
  color: var(--color-text);
  font-size: 18px;
  font-weight: 500;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.06);
  cursor: pointer;
}

.mobile-menu :deep(.mobile-link:last-child) {
  border-bottom: none;
}
</style>
