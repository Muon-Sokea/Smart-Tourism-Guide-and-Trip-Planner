<script setup lang="ts">
import type { ExploreContent } from '../../types/explore'
import Icon from '../common/Icon.vue'
import RatingDisplay from './RatingDisplay.vue'
import { useFavorites } from '../../composables/useFavorites'

const props = defineProps<{
  item: ExploreContent
}>()

const { isFavorite, toggleFavorite } = useFavorites()
</script>

<template>
  <article class="content-card">
    <div class="card-image-wrap">
      <img :src="props.item.image" :alt="props.item.name" class="card-image" />
      <button
        type="button"
        class="favorite-btn"
        :aria-pressed="isFavorite(props.item.id)"
        :aria-label="isFavorite(props.item.id) ? 'Remove from favorites' : 'Add to favorites'"
        @click="toggleFavorite(props.item.id)"
      >
        <Icon :name="isFavorite(props.item.id) ? 'heart-filled' : 'heart'" :size="17" />
      </button>
    </div>

    <div class="card-body">
      <div class="card-heading">
        <h3>{{ props.item.name }}</h3>
        <RatingDisplay :rating="props.item.rating" />
      </div>
      <p class="location"><Icon name="map-pin" :size="14" /> {{ props.item.location }}</p>
      <div class="meta-row">
        <span class="category">{{ props.item.category }}</span>
        <span class="price">{{ props.item.price }}</span>
      </div>
      <p class="description">{{ props.item.description }}</p>
      <router-link to="/explore" class="details-link">View Details</router-link>
    </div>
  </article>
</template>

<style scoped>
.content-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.card-image-wrap {
  position: relative;
}

.card-image {
  display: block;
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.favorite-btn {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: var(--color-white);
  color: var(--color-primary);
  cursor: pointer;
  box-shadow: var(--shadow);
}

.favorite-btn[aria-pressed='true'] {
  color: var(--color-accent);
}

.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.8rem 1rem 1rem;
}

.card-heading,
.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-heading h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--fs-card-title);
}

.location,
.description {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
}

.location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.category {
  color: var(--color-primary);
  font-size: var(--fs-small);
  font-weight: 600;
}

.price {
  color: var(--color-accent);
  font-size: var(--fs-small);
  font-weight: 700;
}

.description {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 0.35rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.details-link {
  align-self: flex-start;
  margin-top: auto;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: var(--fs-button);
  font-weight: 600;
}

.details-link:hover {
  background: var(--color-accent);
}
</style>