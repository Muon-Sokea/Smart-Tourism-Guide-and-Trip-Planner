<script setup lang="ts">
defineProps<{
  totalDays: number
  modelValue: number
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <div class="day-selector">
    <button
      v-for="day in totalDays"
      :key="day"
      type="button"
      class="day-tab"
      :class="{ active: modelValue === day }"
      @click="$emit('update:modelValue', day)"
    >
      Day {{ day }}
    </button>
  </div>
</template>

<style scoped>
.day-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.day-tab {
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  background: var(--color-white);
  color: var(--color-primary);
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  cursor: pointer;
}

.day-tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}
</style>
