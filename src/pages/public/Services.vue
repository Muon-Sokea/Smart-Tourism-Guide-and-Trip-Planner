<script setup lang="ts">
import Icon from '../../components/common/Icon.vue'

const services = [
  {
    title: 'Travel Discovery',
    description: 'Browse a curated set of destinations from every corner of the world, sorted by category.',
    icon: 'compass',
  },
  {
    title: 'Trip Planning',
    description: 'Build a simple day-by-day itinerary and keep every stop organized by day and time.',
    icon: 'route',
  },
  {
    title: 'Smart Explore',
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
        <p class="eyebrow">A simpler way to travel</p>
        <h1>Our Services</h1>
        <p>Everything TravelGo offers to help you discover, organize, and remember your next trip.</p>
      </header>

      <section class="service-intro">
        <div>
          <p class="eyebrow">TravelGo at a glance</p>
          <h2>From first idea to a clearer plan</h2>
        </div>
        <p>Use one focused workspace to find inspiration, compare possibilities, and keep the places you love close.</p>
      </section>

      <section class="service-grid" aria-label="TravelGo services">
        <article v-for="(service, index) in services" :key="service.title" class="service-card">
          <span class="service-index">0{{ index + 1 }}</span>
          <span class="service-icon"><Icon :name="service.icon" :size="22" /></span>
          <div>
            <h3>{{ service.title }}</h3>
            <p>{{ service.description }}</p>
          </div>
        </article>
      </section>

      <div class="service-footer-note">
        <Icon name="arrow-right" :size="18" />
        <span>Start with Explore and build your journey at your own pace.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.service {
  padding: 2.5rem 0 3.25rem;
}

.page-header {
  max-width: 720px;
  margin: 0 auto 2.25rem;
  text-align: center;
}

.eyebrow {
  margin: 0 0 0.3rem;
  color: var(--color-accent);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.4rem;
}

.page-header p {
  color: var(--color-muted);
  margin: 0;
}

.service-intro {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 2rem;
  align-items: center;
  max-width: 1040px;
  margin: 0 auto 1.5rem;
  padding: 1.35rem 1.5rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.service-intro h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--fs-section-title);
}

.service-intro > p {
  color: var(--color-muted);
  line-height: 1.6;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  max-width: 1040px;
  margin: 0 auto;
}

.service-card {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: start;
  min-width: 0;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.2rem;
}

.service-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  flex: 0 0 auto;
}

.service-card h3 {
  color: var(--color-primary);
  margin: 0 0 0.35rem;
}

.service-card p {
  color: var(--color-muted);
  margin: 0;
  font-size: var(--fs-card-desc);
  line-height: 1.5;
}

.service-index {
  position: absolute;
  top: 0.85rem;
  right: 1rem;
  color: rgba(var(--color-primary-rgb), 0.28);
  font-size: var(--fs-small);
  font-weight: 700;
}

.service-footer-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  max-width: 1040px;
  margin: 1.75rem auto 0;
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
}

.service-footer-note svg {
  color: var(--color-accent);
}

@media (max-width: 680px) {
  .service-intro {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1.15rem 0;
  }

  .service-grid {
    grid-template-columns: 1fr;
  }
}
</style>
