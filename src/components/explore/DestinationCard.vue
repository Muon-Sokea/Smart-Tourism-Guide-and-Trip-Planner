<script setup lang="ts">
import type { Destination } from '../../types/destination'
import RatingDisplay from './RatingDisplay.vue'
import Icon from '../common/Icon.vue'
import { useFavorites } from '../../composables/useFavorites'

defineProps<{
  destination: Destination
}>()

const { isFavorite, toggleFavorite } = useFavorites()
</script>

<template>
  <div class="destination-card">
    <div class="card-image-wrap">
      <img :src="destination.image" :alt="destination.name" class="card-image" />
      <button
        class="favorite-btn"
        type="button"
        :aria-pressed="isFavorite(destination.id)"
        :aria-label="isFavorite(destination.id) ? 'Remove from favorites' : 'Add to favorites'"
        @click="toggleFavorite(destination.id)"
      >
        <Icon :name="isFavorite(destination.id) ? 'heart-filled' : 'heart'" :size="18" />
      </button>
    </div>

    <div class="card-body">
      <div class="card-top">
        <h3 class="card-name">{{ destination.name }}</h3>
        <RatingDisplay :rating="destination.rating" />
      </div>

      <p class="card-country">{{ destination.country }}</p>
      <span class="card-category">{{ destination.category }}</span>
      <p class="card-description">{{ destination.description }}</p>

      <router-link :to="`/explore/${destination.id}`" class="card-btn">
        View Details
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.destination-card {
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}

.destination-card:hover {
  transform: translateY(-4px);
}

.card-image-wrap {
  position: relative;
}

.card-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.favorite-btn {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 32px;
  height: 32px;
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

.card-body {
  padding: 0.8rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-name {
  margin: 0;
  color: var(--color-primary);
}

.card-country {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
}

.card-category {
  align-self: flex-start;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  font-size: var(--fs-small);
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}

.card-description {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 0.35rem;
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-btn {
  margin-top: 0.25rem;
  align-self: flex-start;
  background: var(--color-primary);
  color: var(--color-white);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: var(--fs-button);
  font-weight: 600;
  transition: background 0.2s;
}

.card-btn:hover {
  background: var(--color-accent);
}
</style>
