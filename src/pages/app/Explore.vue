<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import SearchBar from '../../components/common/SearchBar.vue'
import DestinationGrid from '../../components/explore/DestinationGrid.vue'
import ExploreContentCard from '../../components/explore/ExploreContentCard.vue'
import Button from '../../components/common/Button.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import Icon from '../../components/common/Icon.vue'
import { destinations } from '../../data/destinations'
import { hotels } from '../../data/hotels'
import { restaurants } from '../../data/restaurants'
import { activities } from '../../data/activities'
import type { ExploreContent } from '../../types/explore'

const route = useRoute()

const categories = [
  { label: 'All', value: 'all', icon: 'compass' },
  { label: 'Destinations', value: 'destinations', icon: 'landmark' },
  { label: 'Hotels', value: 'hotels', icon: 'building' },
  { label: 'Restaurants', value: 'restaurants', icon: 'utensils' },
  { label: 'Activities', value: 'activities', icon: 'flag' },
] as const

const contentItems = [...hotels, ...restaurants, ...activities]
const destinationCategories = ['Culture', 'Beach', 'Nature', 'City', 'Adventure', 'Food']
const locations = Array.from(
  new Set([
    ...destinations.map((destination) => destination.country),
    ...contentItems.map((item) => item.location),
  ])
).sort()

const ratingOptions = [
  { label: 'All Ratings', value: 0 },
  { label: '4.5+', value: 4.5 },
  { label: '4.7+', value: 4.7 },
  { label: '4.9+', value: 4.9 },
]

const sortOptions = [
  { label: 'Popular', value: 'popular' },
  { label: 'Rating', value: 'rating' },
  { label: 'Price', value: 'price' },
] as const

const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '')
const selectedCategory = ref<(typeof categories)[number]['value']>('all')
const destinationCategory = ref(
  typeof route.query.category === 'string' && destinationCategories.includes(route.query.category)
    ? route.query.category
    : 'All'
)
const selectedLocation = ref('All')
const selectedPrice = ref('all')
const minRating = ref(0)
const sortBy = ref<'popular' | 'rating' | 'price'>('popular')
const isFiltersOpen = ref(false)

const destinationMatches = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return destinations.filter((destination) => {
    const matchesSearch =
      !query ||
      destination.name.toLowerCase().includes(query) ||
      destination.country.toLowerCase().includes(query) ||
      destination.category.toLowerCase().includes(query) ||
      destination.description.toLowerCase().includes(query)

    const matchesCategory = destinationCategory.value === 'All' || destination.category === destinationCategory.value
    const matchesLocation = selectedLocation.value === 'All' || destination.country === selectedLocation.value

    const matchesRating = destination.rating >= minRating.value
    const value = priceValue(destination.estimatedCost)
    const matchesPrice =
      selectedPrice.value === 'all' ||
      (selectedPrice.value === 'budget' && value <= 70) ||
      (selectedPrice.value === 'standard' && value > 70 && value <= 120) ||
      (selectedPrice.value === 'premium' && value > 120)

    return matchesSearch && matchesCategory && matchesLocation && matchesRating && matchesPrice
  })
})

const filteredDestinations = computed(() => {
  if (selectedCategory.value !== 'all' && selectedCategory.value !== 'destinations') return []
  const results = [...destinationMatches.value]

  if (sortBy.value === 'rating') {
    return [...results].sort((a, b) => b.rating - a.rating)
  }

  if (sortBy.value === 'price') {
    return [...results].sort((a, b) => priceValue(a.estimatedCost) - priceValue(b.estimatedCost))
  }

  return results
})

function priceValue(value: string) {
  const match = value.match(/\d+/)
  if (match) return Number(match[0])
  const dollarCount = value.match(/\$/g)?.length ?? 0
  return dollarCount * 50
}

function contentMatches(item: ExploreContent) {
  const query = searchQuery.value.trim().toLowerCase()
  const matchesSearch =
    !query ||
    [item.name, item.location, item.category, item.description].some((value) =>
      value.toLowerCase().includes(query)
    )
  const matchesLocation = selectedLocation.value === 'All' || item.location === selectedLocation.value
  const matchesRating = item.rating >= minRating.value
  const value = priceValue(item.price)
  const matchesPrice =
    selectedPrice.value === 'all' ||
    (selectedPrice.value === 'budget' && value <= 70) ||
    (selectedPrice.value === 'standard' && value > 70 && value <= 120) ||
    (selectedPrice.value === 'premium' && value > 120)

  return matchesSearch && matchesLocation && matchesRating && matchesPrice
}

const filteredContent = computed(() => {
  const results = contentItems.filter((item) => {
    const contentCategory = item.type === 'activity' ? 'activities' : `${item.type}s`
    const matchesType = selectedCategory.value === 'all' || selectedCategory.value === contentCategory
    return matchesType && contentMatches(item)
  })

  if (sortBy.value === 'rating') return [...results].sort((a, b) => b.rating - a.rating)
  if (sortBy.value === 'price') return [...results].sort((a, b) => priceValue(a.price) - priceValue(b.price))
  return results
})

const featuredDestinations = computed(() => destinations.slice(0, 4))
const featuredContent = computed(() => contentItems.slice(0, 3))

const isDefaultBrowse = computed(
  () =>
    selectedCategory.value === 'all' &&
    !searchQuery.value &&
    destinationCategory.value === 'All' &&
    selectedLocation.value === 'All' &&
    selectedPrice.value === 'all' &&
    minRating.value === 0 &&
    sortBy.value === 'popular'
)

const exploreMoreDestinations = computed(() =>
  isDefaultBrowse.value
    ? filteredDestinations.value.filter(
        (destination) => !featuredDestinations.value.some((featured) => featured.id === destination.id)
      )
    : filteredDestinations.value
)

const exploreMoreContent = computed(() =>
  isDefaultBrowse.value
    ? filteredContent.value.filter(
        (item) => !featuredContent.value.some((featured) => featured.id === item.id)
      )
    : filteredContent.value
)

const hasResults = computed(
  () => exploreMoreDestinations.value.length > 0 || exploreMoreContent.value.length > 0
)

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  destinationCategory.value = 'All'
  selectedLocation.value = 'All'
  selectedPrice.value = 'all'
  minRating.value = 0
  sortBy.value = 'popular'
}
</script>

<template>
  <div class="explore">
    <div class="container">
      <header class="explore-header">
        <p class="eyebrow">Discover more of the world</p>
        <h1>Explore TravelGo</h1>
        <p>Find destinations, stays, food, and experiences for your next journey.</p>
      </header>

      <div class="explore-controls">
        <SearchBar
          v-model="searchQuery"
          size="large"
          placeholder="Search destinations, hotels, food, or activities..."
        />

        <nav class="category-nav" aria-label="Explore categories">
          <button
            v-for="category in categories"
            :key="category.value"
            type="button"
            class="category-tab"
            :class="{ active: selectedCategory === category.value }"
            @click="selectedCategory = category.value"
          >
            <Icon :name="category.icon" :size="16" />
            {{ category.label }}
          </button>
        </nav>

        <button
          class="filters-toggle"
          type="button"
          :aria-expanded="isFiltersOpen"
          @click="isFiltersOpen = !isFiltersOpen"
        >
          <Icon name="filter" :size="16" />
          Filters
          <Icon name="chevron-down" :size="16" />
        </button>

        <div class="filter-panel" :class="{ open: isFiltersOpen }">
          <div class="filter-group">
            <label for="location-filter">Location</label>
            <select id="location-filter" v-model="selectedLocation">
              <option value="All">All locations</option>
              <option v-for="location in locations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="type-filter">Destination type</label>
            <select id="type-filter" v-model="destinationCategory">
              <option value="All">All types</option>
              <option v-for="category in destinationCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="rating-filter">Rating</label>
            <select id="rating-filter" v-model.number="minRating">
              <option v-for="option in ratingOptions" :key="option.label" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="price-filter">Price</label>
            <select id="price-filter" v-model="selectedPrice">
              <option value="all">All prices</option>
              <option value="budget">Budget</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sort-filter">Sort by</label>
            <select id="sort-filter" v-model="sortBy">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <section v-if="isDefaultBrowse" class="featured-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Popular right now</p>
            <h2>Featured Destinations</h2>
          </div>
          <span class="result-count">{{ featuredDestinations.length }} highlights</span>
        </div>
        <DestinationGrid :destinations="featuredDestinations" />
      </section>

      <section class="results-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Explore more</p>
            <h2>{{ selectedCategory === 'all' ? 'All Travel Finds' : categories.find((category) => category.value === selectedCategory)?.label }}</h2>
          </div>
          <span v-if="hasResults" class="result-count">{{ exploreMoreDestinations.length + exploreMoreContent.length }} results</span>
        </div>

        <DestinationGrid v-if="exploreMoreDestinations.length" :destinations="exploreMoreDestinations">
          <template #empty-action>
            <Button variant="accent" @click="clearFilters">Clear Filters</Button>
          </template>
        </DestinationGrid>

        <div v-if="exploreMoreContent.length" class="content-grid">
          <ExploreContentCard v-for="item in exploreMoreContent" :key="item.id" :item="item" />
        </div>

        <EmptyState v-if="!hasResults" message="No travel finds match your search.">
          <Button variant="accent" @click="clearFilters">Clear Filters</Button>
        </EmptyState>
      </section>

      <section v-if="isDefaultBrowse" class="featured-section content-featured">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Stay, taste, do</p>
            <h2>More to Discover</h2>
          </div>
        </div>
        <div class="content-grid">
          <ExploreContentCard v-for="item in featuredContent" :key="item.id" :item="item" />
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.explore {
  padding: 2rem 0 3rem;
}

.explore-header {
  text-align: center;
  margin-bottom: 1.25rem;
}

.explore-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.35rem;
}

.explore-header p {
  color: var(--color-muted);
  margin: 0;
}

.explore-controls {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-width: 900px;
  margin: 0 auto 1.75rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--color-accent);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.category-nav {
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  overflow-x: auto;
  padding: 0.1rem 0 0.2rem;
}

.category-tab {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.35rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 999px;
  background: var(--color-white);
  color: var(--color-primary);
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
}

.category-tab.active,
.category-tab:hover {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-white);
}

.filters-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  align-self: center;
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  color: var(--color-primary);
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.filter-panel {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem 1rem;
  background: rgba(var(--color-primary-rgb), 0.04);
  border-radius: var(--radius);
  padding: 1rem;
}

.filter-panel.open {
  display: flex;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.filter-group label {
  color: var(--color-primary);
}

.filter-group select {
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  background: var(--color-white);
  color: var(--color-text);
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  font-size: var(--fs-label);
}

.featured-section,
.results-section {
  margin-bottom: 2.25rem;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.section-heading h2 {
  color: var(--color-primary);
}

.result-count {
  color: var(--color-muted);
  font-size: var(--fs-small);
  white-space: nowrap;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.1rem;
}

.content-featured {
  padding-top: 0.5rem;
}

@media (min-width: 768px) {
  .filters-toggle {
    display: none;
  }

  .filter-panel {
    display: flex !important;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .category-nav {
    justify-content: flex-start;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
