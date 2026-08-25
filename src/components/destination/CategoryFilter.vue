<script setup lang="ts">
import Icon from '../common/Icon.vue'
import { categoryOptions } from '../../data/categories'

defineProps<{
  categories: string[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

function iconFor(category: string) {
  return categoryOptions.find((option) => option.name === category)?.icon
}
</script>

<template>
  <div class="category-filter">
    <button
      v-for="category in categories"
      :key="category"
      class="filter-btn"
      :class="{ active: modelValue === category }"
      @click="$emit('update:modelValue', category)"
    >
      <Icon v-if="iconFor(category)" :name="iconFor(category)!" :size="16" />
      {{ category }}
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  background: var(--color-white);
  color: var(--color-primary);
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: var(--fs-label);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.filter-btn:hover {
  border-color: var(--color-accent);
}

.filter-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}
</style>
