<script setup lang="ts">
import { computed } from 'vue'
import { useFavorites } from '../../composables/useFavorites'
import { destinations } from '../../data/destinations'
import { serviceCatalog } from '../../utils/serviceCatalog'
import DestinationGrid from '../../components/explore/DestinationGrid.vue'
import ExploreContentCard from '../../components/explore/ExploreContentCard.vue'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'

const { favoriteIds } = useFavorites()

// Hearts work on both destination cards and service cards (hotels,
// restaurants, activities), so the Favorites page lists both kinds.
const favoriteDestinations = computed(() =>
  destinations.filter((destination) => favoriteIds.value.includes(destination.id))
)

const favoriteServices = computed(() =>
  serviceCatalog.filter((service) => favoriteIds.value.includes(service.id))
)

const totalFavorites = computed(() => favoriteDestinations.value.length + favoriteServices.value.length)
</script>

<template>
  <div class="favorites">
    <div class="container">
      <header class="page-header">
        <h1>My Favorites</h1>
        <p>Keep the places you want to visit close at hand.</p>
        <span class="favorite-count">
          {{ totalFavorites }}
          {{ totalFavorites === 1 ? 'place saved' : 'places saved' }}
        </span>
      </header>

      <template v-if="totalFavorites">
        <section v-if="favoriteDestinations.length">
          <h2 class="section-title">Destinations</h2>
          <DestinationGrid :destinations="favoriteDestinations" />
        </section>

        <section v-if="favoriteServices.length">
          <h2 class="section-title">Stays, Food &amp; Activities</h2>
          <div class="services-grid">
            <ExploreContentCard v-for="item in favoriteServices" :key="item.id" :item="item" />
          </div>
        </section>
      </template>

      <div v-else class="empty-favorites">
        <Icon name="heart" :size="40" />
        <p class="empty-title">No favorites yet.</p>
        <p class="empty-subtitle">
          Explore destinations, hotels, restaurants, and activities and save the ones you'd love to visit.
        </p>
        <Button to="/explore" variant="accent">Explore TravelGo</Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites {
  padding: 2rem 0 3rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.5rem;
}

.page-header p {
  color: var(--color-muted);
  margin: 0 0 0.75rem;
}

.favorite-count {
  display: inline-block;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  font-weight: 600;
  font-size: var(--fs-label);
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
}

.section-title {
  color: var(--color-primary);
  margin: 0 0 1rem;
}

.favorites section + section {
  margin-top: 2rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.1rem;
}

.empty-favorites {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  color: var(--color-primary);
  padding: 3rem 0;
}

.empty-title {
  font-size: var(--fs-card-title);
  font-weight: 600;
  margin: 0.5rem 0 0;
}

.empty-subtitle {
  color: var(--color-muted);
  margin: 0 0 1.5rem;
  max-width: 360px;
}

@media (max-width: 600px) {
  .services-grid {
    grid-template-columns: 1fr;
  }

  .empty-favorites :deep(.btn) {
    width: 100%;
    max-width: 320px;
  }
}
</style>
