<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
  description?: string
}>()

// Event must be named `update:modelValue` so the parent's v-model binding receives it.
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <button
    type="button"
    class="settings-toggle"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="toggle-text">
      <span class="toggle-label">{{ label }}</span>
      <span v-if="description" class="toggle-description">{{ description }}</span>
    </span>
    <span class="toggle-track" :class="{ on: modelValue }">
      <span class="toggle-thumb" />
    </span>
  </button>
</template>

<style scoped>
.settings-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.55rem 0;
  border: 0;
  background: none;
  text-align: left;
  cursor: pointer;
}

.toggle-text {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.toggle-label {
  color: var(--color-text);
  font-size: var(--fs-body);
  font-weight: 500;
}

.toggle-description {
  color: var(--color-muted);
  font-size: var(--fs-small);
  line-height: 1.4;
}

.toggle-track {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: rgba(var(--color-primary-rgb), 0.18);
  transition: background 0.2s;
  flex-shrink: 0;
}

.toggle-track.on {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-white);
  transition: transform 0.2s;
}

.toggle-track.on .toggle-thumb {
  transform: translateX(16px);
}
</style>
