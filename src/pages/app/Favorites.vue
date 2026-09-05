<script setup lang="ts">
import { computed } from 'vue'
import { useFavorites } from '../../composables/useFavorites'
import { destinations } from '../../data/destinations'
import DestinationGrid from '../../components/explore/DestinationGrid.vue'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'

const { favoriteIds } = useFavorites()

const favoriteDestinations = computed(() =>
  destinations.filter((destination) => favoriteIds.value.includes(destination.id))
)
</script>

<template>
  <div class="favorites">
    <div class="container">
      <header class="page-header">
        <h1>My Favorite Destinations</h1>
        <p>Keep the places you want to visit close at hand.</p>
        <span class="favorite-count">
          {{ favoriteDestinations.length }}
          {{ favoriteDestinations.length === 1 ? 'destination saved' : 'destinations saved' }}
        </span>
      </header>

      <DestinationGrid
        v-if="favoriteDestinations.length"
        :destinations="favoriteDestinations"
      />

      <div v-else class="empty-favorites">
        <Icon name="heart" :size="40" />
        <p class="empty-title">No favorite destinations yet.</p>
        <p class="empty-subtitle">
          Explore destinations and save the places you'd love to visit.
        </p>
        <Button to="/explore" variant="accent">Explore Destinations</Button>
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
  .empty-favorites :deep(.btn) {
    width: 100%;
    max-width: 320px;
  }
}
</style>
