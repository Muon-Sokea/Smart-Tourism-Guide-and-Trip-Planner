<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DestinationGrid from '../../components/explore/DestinationGrid.vue'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'
import { destinations } from '../../data/destinations'
import { categoryOptions } from '../../data/mockData/categories'

const router = useRouter()
const heroSearch = ref('')
const heroCategory = ref('All')

function submitHeroSearch() {
  const query: Record<string, string> = {}
  if (heroSearch.value.trim()) query.search = heroSearch.value.trim()
  if (heroCategory.value !== 'All') query.category = heroCategory.value
  router.push({ path: '/explore', query })
}

// Hero carousel — reuses images already in the destination data instead of
// pulling in separate hero-only assets.
const heroSlideNames = ['Angkor Wat', 'Bali', 'Tokyo', 'Eiffel Tower', 'Santorini']
const slides = heroSlideNames
  .map((name) => destinations.find((destination) => destination.name === name))
  .filter((destination): destination is (typeof destinations)[number] => Boolean(destination))

const AUTOPLAY_DELAY = 4500
const currentSlide = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | undefined

function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
}

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, AUTOPLAY_DELAY)
}

function goToSlide(index: number) {
  currentSlide.value = index
  startAutoplay()
}

function nextSlide() {
  goToSlide((currentSlide.value + 1) % slides.length)
}

function prevSlide() {
  goToSlide((currentSlide.value - 1 + slides.length) % slides.length)
}

onMounted(startAutoplay)
onUnmounted(stopAutoplay)

const popularDestinations = computed(() => destinations.slice(0, 9))

const categoryTiles = computed(() =>
  categoryOptions
    .map((category) => ({
      ...category,
      destination: destinations.find((item) => item.category === category.name),
    }))
    .filter((tile) => tile.destination)
)

const features = [
  {
    title: 'Discover',
    description: 'Find interesting destinations around the world.',
    icon: 'compass',
  },
  {
    title: 'Plan',
    description: 'Build a simple day-by-day trip itinerary.',
    icon: 'route',
  },
  {
    title: 'Explore',
    description: 'Search and filter destinations to find the right fit.',
    icon: 'map',
  },
]
</script>

<template>
  <div class="home">
    <!-- Hero Section: animated image carousel -->
    <section class="hero">
      <div class="hero-slides">
        <div
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="hero-slide"
          :class="{ active: index === currentSlide }"
          :style="{ backgroundImage: `url(${slide.image})` }"
        ></div>
        <div class="hero-overlay"></div>
      </div>

      <button
        type="button"
        class="hero-arrow hero-arrow-prev"
        aria-label="Previous slide"
        @click="prevSlide"
      >
        <Icon name="chevron-down" :size="20" />
      </button>
      <button
        type="button"
        class="hero-arrow hero-arrow-next"
        aria-label="Next slide"
        @click="nextSlide"
      >
        <Icon name="chevron-down" :size="20" />
      </button>

      <div class="container hero-inner">
        <h1>Discover Your Next Adventure</h1>
        <p>Explore amazing destinations and create your perfect trip.</p>

        <form class="hero-search" @submit.prevent="submitHeroSearch">
          <label class="hero-field">
            <Icon name="compass" :size="16" />
            <select v-model="heroCategory">
              <option value="All">All Categories</option>
              <option v-for="category in categoryOptions" :key="category.name" :value="category.name">
                {{ category.name }}
              </option>
            </select>
            <Icon name="chevron-down" :size="14" />
          </label>

          <label class="hero-field hero-field-grow">
            <Icon name="map-pin" :size="16" />
            <input v-model="heroSearch" type="text" placeholder="Where do you want to go?" />
          </label>

          <button type="submit" class="hero-search-btn" aria-label="Search destinations">
            <Icon name="search" :size="18" />
          </button>
        </form>

        <Button to="/explore" variant="accent" class="hero-explore-btn">
          <Icon name="compass" :size="16" />
          Explore Destinations
        </Button>
      </div>

      <div class="hero-dots">
        <button
          v-for="(slide, index) in slides"
          :key="`dot-${slide.id}`"
          type="button"
          class="hero-dot"
          :class="{ active: index === currentSlide }"
          :aria-current="index === currentSlide"
          :aria-label="`Go to slide ${index + 1}: ${slide.name}`"
          @click="goToSlide(index)"
        ></button>
      </div>
    </section>

    <!-- Tour Categories -->
    <section class="section">
      <div class="container">
        <p class="eyebrow">Find Your Perfect Experience</p>
        <h2 class="section-title">Tour Categories</h2>

        <div class="category-row">
          <router-link
            v-for="(tile, index) in categoryTiles"
            :key="tile.name"
            :to="{ path: '/explore', query: { category: tile.name } }"
            class="category-tile"
            :class="`tile-offset-${index % 3}`"
          >
            <img :src="tile.destination?.image" :alt="tile.name" />
            <span class="tile-caption">{{ tile.name }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Most Popular Tour -->
    <section class="section section-alt">
      <div class="container">
        <p class="eyebrow">Top places travelers love</p>
        <h2 class="section-title">Popular Destinations</h2>
        <DestinationGrid :destinations="popularDestinations" />
      </div>
    </section>

    <!-- Why TravelGo -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Why TravelGo?</h2>
        <div class="feature-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <span class="feature-icon"><Icon :name="feature.icon" :size="28" /></span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  color: var(--color-on-dark);
  padding: 5.5rem 0 4.5rem;
}

.hero-slides {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
}

.hero-slide.active {
  opacity: 1;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(var(--scrim-rgb), 0.55), rgba(var(--scrim-rgb), 0.82));
}

.hero-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  color: var(--color-primary);
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s;
}

.hero-arrow:hover {
  background: var(--color-white);
}

.hero-arrow-prev {
  left: 1rem;
}

.hero-arrow-prev :deep(svg) {
  transform: rotate(90deg);
}

.hero-arrow-next {
  right: 1rem;
}

.hero-arrow-next :deep(svg) {
  transform: rotate(-90deg);
}

.hero-dots {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.hero-dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

.hero-dot.active {
  background: var(--color-accent);
  transform: scale(1.3);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.hero-inner h1 {
  font-size: clamp(28px, 3.8vw, 46px);
  margin: 0 0 1rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-inner p {
  max-width: 560px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 auto 2rem;
}

.hero-search {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  max-width: 640px;
  background: var(--color-white);
  border-radius: 999px;
  padding: 0.5rem;
  margin: 0 auto;
  flex-wrap: wrap;
  box-shadow: var(--shadow);
}

.hero-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-muted);
  padding: 0.4rem 0.75rem;
  border-right: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.hero-field-grow {
  flex: 1;
  min-width: 160px;
  border-right: none;
}

.hero-field select,
.hero-field input {
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text);
  font-size: var(--fs-body);
  width: 100%;
}

.hero-field select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 0.25rem;
  cursor: pointer;
}

.hero-search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--color-accent);
  color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.hero-search-btn:hover {
  opacity: 0.85;
}

.hero-inner :deep(.hero-explore-btn) {
  margin-top: 1.5rem;
}

.section {
  padding: 2.75rem 0;
}

.section-alt {
  background: rgba(var(--color-primary-rgb), 0.04);
}

.eyebrow {
  text-align: center;
  color: var(--color-accent);
  font-style: italic;
  font-weight: 500;
  margin: 0 0 0.35rem;
}

.section-title {
  text-align: center;
  color: var(--color-primary);
  margin: 0 0 2.5rem;
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 1.5rem 1.25rem;
}

.category-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  width: 150px;
  text-align: center;
}

.category-tile img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.tile-caption {
  font-size: var(--fs-label);
  font-weight: 600;
  color: var(--color-primary);
}

.tile-offset-1 {
  margin-top: 2.5rem;
}

.tile-offset-2 {
  margin-top: 1.25rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  text-align: center;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem 1.25rem;
}

.feature-icon {
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

.feature-card h3 {
  color: var(--color-primary);
  margin: 0 0 0.5rem;
}

.feature-card p {
  color: var(--color-muted);
  margin: 0;
  font-size: var(--fs-card-desc);
}

@media (max-width: 640px) {
  .hero {
    padding: 4.5rem 0 3.75rem;
  }

  .hero-arrow {
    width: 34px;
    height: 34px;
  }

  .hero-arrow-prev {
    left: 0.5rem;
  }

  .hero-arrow-next {
    right: 0.5rem;
  }

  .hero-search {
    border-radius: var(--radius);
    flex-direction: column;
    align-items: stretch;
  }

  .hero-field {
    border-right: none;
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
  }

  .hero-search-btn {
    width: 100%;
    border-radius: 999px;
  }

  .tile-offset-1,
  .tile-offset-2 {
    margin-top: 0;
  }
}
</style>
