<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="auth-page">
    <div class="container auth-container">
      <div class="auth-card">
        <h1>{{ title }}</h1>
        <p class="auth-subtitle">{{ subtitle }}</p>

        <slot />

        <p class="auth-switch">
          <slot name="switch" />
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  padding: 3.5rem 0 4rem;
}

.auth-container {
  display: flex;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2.5rem 2rem;
}

.auth-card h1 {
  color: var(--color-primary);
  text-align: center;
  margin: 0 0 0.5rem;
}

.auth-subtitle {
  color: var(--color-muted);
  text-align: center;
  margin: 0 0 2rem;
}

.auth-switch {
  text-align: center;
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
  margin: 1.5rem 0 0;
}

.auth-switch :deep(a) {
  color: var(--color-primary);
  font-weight: 600;
}

.auth-switch :deep(a:hover) {
  color: var(--color-accent);
}

.auth-page :deep(.auth-form) {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.auth-page :deep(.field) {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.auth-page :deep(.field span) {
  font-size: var(--fs-label);
  font-weight: 500;
  color: var(--color-primary);
}

.auth-page :deep(.input-wrap) {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  color: var(--color-muted);
}

.auth-page :deep(.input-wrap:focus-within) {
  border-color: var(--color-accent);
  color: var(--color-primary);
}

.auth-page :deep(.input-wrap input) {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--fs-body);
  color: var(--color-text);
}

.auth-page :deep(.error-message) {
  color: var(--color-accent);
  font-size: var(--fs-label);
  margin: 0;
}

.auth-page :deep(.auth-form .btn) {
  width: 100%;
  margin-top: 0.25rem;
}
</style>
