<script setup lang="ts">
import Icon from '../common/Icon.vue'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    size?: 'default' | 'large'
  }>(),
  {
    placeholder: 'Search destinations...',
    size: 'default',
  }
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="search-bar" :class="size">
    <Icon name="search" :size="size === 'large' ? 20 : 18" />
    <input
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 999px;
  padding: 0.75rem 1.1rem;
  color: var(--color-muted);
}

.search-bar:focus-within {
  border-color: var(--color-accent);
  color: var(--color-primary);
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--fs-body);
  color: var(--color-text);
}

.search-bar.large {
  padding: 1rem 1.5rem;
}
</style>
