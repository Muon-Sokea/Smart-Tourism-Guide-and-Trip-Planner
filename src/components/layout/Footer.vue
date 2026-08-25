<script setup lang="ts">
import { navLinks } from '../../data/navLinks'
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <h3>TravelGo</h3>
        <p>Discover interesting places and plan your next journey with ease.</p>
      </div>

      <div class="footer-links">
        <router-link v-for="link in navLinks" :key="link.to" :to="link.to">
          {{ link.label }}
        </router-link>
      </div>
    </div>

    <p class="footer-copyright">&copy; 2026 TravelGo. All rights reserved.</p>
  </footer>
</template>

<style scoped>
.footer {
  background: rgb(var(--scrim-rgb));
  color: var(--color-on-dark);
  margin-top: 3rem;
  padding: 2.5rem 0 1.25rem;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
}

.footer-brand h3 {
  margin: 0 0 0.4rem;
  color: var(--color-accent);
}

.footer-brand p {
  margin: 0;
  max-width: 320px;
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--fs-card-desc);
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.footer-links a {
  color: var(--color-on-dark);
  font-size: var(--fs-navbar);
  font-weight: 500;
}

.footer-links a:hover {
  color: var(--color-accent);
}

.footer-copyright {
  text-align: center;
  margin: 2rem 0 0;
  font-size: var(--fs-small);
  color: rgba(255, 255, 255, 0.7);
}
</style>
