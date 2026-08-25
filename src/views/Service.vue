<script setup lang="ts">
import Icon from '../components/common/Icon.vue'

const services = [
  {
    title: 'Discover',
    description: 'Browse a curated set of destinations from every corner of the world, sorted by category.',
    icon: 'compass',
  },
  {
    title: 'Plan',
    description: 'Build a simple day-by-day itinerary and keep every stop organized by day and time.',
    icon: 'route',
  },
  {
    title: 'Explore',
    description: 'Search and filter destinations by name, country, category, or rating in a few clicks.',
    icon: 'map',
  },
  {
    title: 'Save Favorites',
    description: 'Keep a personal shortlist of places you want to visit, ready whenever you need it.',
    icon: 'heart',
  },
]
</script>

<template>
  <div class="service">
    <div class="container">
      <header class="page-header">
        <h1>Our Services</h1>
        <p>Everything TravelGo offers to help you plan your next trip.</p>
      </header>

      <div class="service-grid">
        <div v-for="service in services" :key="service.title" class="service-card">
          <span class="service-icon"><Icon :name="service.icon" :size="26" /></span>
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service {
  padding: 2.5rem 0 4rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.5rem;
}

.page-header p {
  color: var(--color-muted);
  margin: 0;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.service-card {
  text-align: center;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem 1.25rem;
}

.service-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.service-card h3 {
  color: var(--color-primary);
  margin: 0 0 0.5rem;
}

.service-card p {
  color: var(--color-muted);
  margin: 0;
  font-size: var(--fs-card-desc);
}
</style>
