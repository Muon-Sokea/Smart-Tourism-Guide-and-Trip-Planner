<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { destinations } from '../../data/destinations'
import { useFavorites } from '../../composables/useFavorites'
import { useTripPlanner } from '../../composables/useTripPlanner'
import RatingDisplay from '../../components/explore/RatingDisplay.vue'
import DestinationGrid from '../../components/explore/DestinationGrid.vue'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'

const route = useRoute()
const { isFavorite, toggleFavorite } = useFavorites()
const { trip, addDestination } = useTripPlanner()

const destination = computed(() =>
  destinations.find((item) => item.id === Number(route.params.id))
)

const isInTrip = computed(() =>
  trip.value.items.some((item) => item.destinationId === destination.value?.id)
)

const nearbyDestinations = computed(() => {
  if (!destination.value) return []
  return destinations
    .filter((item) => item.category === destination.value?.category && item.id !== destination.value?.id)
    .slice(0, 3)
})

function handleAddToTrip() {
  if (!destination.value || isInTrip.value) return
  addDestination(destination.value.id, 1)
}
</script>

<template>
  <div class="details" v-if="destination">
    <div class="container">
      <router-link to="/explore" class="back-link">
        <Icon name="chevron-down" :size="16" />
        Back to Explore
      </router-link>

      <!-- Destination Hero -->
      <div class="details-image-wrap">
        <img :src="destination.image" :alt="destination.name" class="details-image" />
        <button
          class="favorite-btn"
          type="button"
          :aria-pressed="isFavorite(destination.id)"
          :aria-label="isFavorite(destination.id) ? 'Remove from favorites' : 'Add to favorites'"
          @click="toggleFavorite(destination.id)"
        >
          <Icon :name="isFavorite(destination.id) ? 'heart-filled' : 'heart'" :size="22" />
        </button>
      </div>

      <div class="details-header">
        <h1>{{ destination.name }}</h1>
        <p class="details-sub">
          {{ destination.country }} &middot; {{ destination.category }} &middot;
          <RatingDisplay :rating="destination.rating" />
        </p>

        <div class="details-actions">
          <Button variant="outline" @click="toggleFavorite(destination.id)">
            <Icon :name="isFavorite(destination.id) ? 'heart-filled' : 'heart'" :size="16" />
            {{ isFavorite(destination.id) ? 'Remove from Favorites' : 'Add to Favorites' }}
          </Button>
          <Button variant="primary" :disabled="isInTrip" @click="handleAddToTrip">
            <Icon name="plus" :size="16" />
            {{ isInTrip ? 'Added to Trip' : 'Add to Trip' }}
          </Button>
        </div>
      </div>

      <!-- About Section -->
      <section class="details-section">
        <h2>About This Destination</h2>
        <p>{{ destination.description }}</p>
      </section>

      <!-- Destination Information -->
      <section class="info-grid">
        <div class="info-card">
          <span class="info-label">Country</span>
          <span class="info-value">{{ destination.country }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Category</span>
          <span class="info-value">{{ destination.category }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Rating</span>
          <span class="info-value"><RatingDisplay :rating="destination.rating" /></span>
        </div>
        <div class="info-card">
          <span class="info-label">Best Time</span>
          <span class="info-value">{{ destination.bestTime }}</span>
        </div>
        <div class="info-card">
          <span class="info-label">Estimated Cost</span>
          <span class="info-value">{{ destination.estimatedCost }}</span>
        </div>
      </section>

      <!-- Highlights -->
      <section class="details-section">
        <h2>Highlights</h2>
        <div class="highlight-grid">
          <div v-for="highlight in destination.highlights" :key="highlight" class="highlight-card">
            <span class="highlight-icon"><Icon name="check" :size="18" /></span>
            <span>{{ highlight }}</span>
          </div>
        </div>
      </section>

      <!-- Nearby Destinations -->
      <section v-if="nearbyDestinations.length" class="details-section">
        <h2>Nearby Destinations</h2>
        <DestinationGrid :destinations="nearbyDestinations" />
      </section>

      <!-- Route Section -->
      <section class="route-section">
        <Button to="/map" variant="outline">
          <Icon name="route" :size="16" />
          View Route
        </Button>
      </section>
    </div>
  </div>

  <div class="details-not-found" v-else>
    <div class="container">
      <p>Destination not found.</p>
      <router-link to="/explore" class="back-link">&larr; Back to Explore</router-link>
    </div>
  </div>
</template>

<style scoped>
.details {
  padding: 1.75rem 0 3rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.back-link:hover {
  color: var(--color-accent);
}

.details-image-wrap {
  position: relative;
  margin-bottom: 1.5rem;
}

.details-image {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: var(--radius);
  display: block;
}

.favorite-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--color-white);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow);
}

.favorite-btn[aria-pressed='true'] {
  color: var(--color-accent);
}

.details-header {
  margin-bottom: 2rem;
}

.details-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.details-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.4rem;
}

.details-sub {
  color: var(--color-muted);
  margin: 0 0 1.25rem;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section h2 {
  color: var(--color-primary);
  margin: 0 0 0.75rem;
}

.details-section > p {
  color: var(--color-text);
  line-height: 1.6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.info-card {
  background: var(--color-white);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.info-label {
  font-size: var(--fs-label);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.info-value {
  font-size: var(--fs-card-title);
  color: var(--color-primary);
  font-weight: 600;
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.highlight-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(var(--color-primary-rgb), 0.04);
  border-radius: var(--radius);
  padding: 0.9rem 1.1rem;
  color: var(--color-primary);
  font-weight: 600;
}

.highlight-icon {
  display: inline-flex;
  color: var(--color-accent);
}

.route-section {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}

.details-not-found {
  padding: 4rem 0;
  text-align: center;
  color: var(--color-muted);
}

@media (max-width: 600px) {
  .details-actions :deep(.btn),
  .route-section :deep(.btn) {
    width: 100%;
  }
}
</style>
