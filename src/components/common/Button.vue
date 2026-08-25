<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'accent' | 'outline'
    to?: string
  }>(),
  { variant: 'primary' }
)
</script>

<template>
  <router-link v-if="to" :to="to" class="btn" :class="variant">
    <slot />
  </router-link>
  <button v-else class="btn" :class="variant">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: var(--fs-button);
  border: none;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s, color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn.primary:hover {
  background: var(--color-accent);
}

.btn.accent {
  background: var(--color-accent);
  color: var(--color-primary);
}

.btn.accent:hover {
  opacity: 0.9;
}

.btn.outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn.outline:hover {
  background: var(--color-primary);
  color: var(--color-white);
}
</style>
