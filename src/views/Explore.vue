<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import SearchBar from '../components/destination/SearchBar.vue'
import CategoryFilter from '../components/destination/CategoryFilter.vue'
import DestinationGrid from '../components/destination/DestinationGrid.vue'
import Button from '../components/common/Button.vue'
import Icon from '../components/common/Icon.vue'
import { destinations } from '../data/destinations'
import { categoryOptions } from '../data/categories'

const route = useRoute()

const categories = ['All', ...categoryOptions.map((option) => option.name)]

const ratingOptions = [
  { label: 'All Ratings', value: 0 },
  { label: '4.5+', value: 4.5 },
  { label: '4.7+', value: 4.7 },
  { label: '4.9+', value: 4.9 },
]

const sortOptions = [
  { label: 'Popular', value: 'popular' },
  { label: 'Rating', value: 'rating' },
  { label: 'Name', value: 'name' },
] as const

const searchQuery = ref(typeof route.query.search === 'string' ? route.query.search : '')
const selectedCategory = ref(
  typeof route.query.category === 'string' && categories.includes(route.query.category)
    ? route.query.category
    : 'All'
)
const minRating = ref(0)
const sortBy = ref<'popular' | 'rating' | 'name'>('popular')
const isFiltersOpen = ref(false)

const filteredDestinations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const results = destinations.filter((destination) => {
    const matchesSearch =
      !query ||
      destination.name.toLowerCase().includes(query) ||
      destination.country.toLowerCase().includes(query)

    const matchesCategory =
      selectedCategory.value === 'All' || destination.category === selectedCategory.value

    const matchesRating = destination.rating >= minRating.value

    return matchesSearch && matchesCategory && matchesRating
  })

  if (sortBy.value === 'rating') {
    return [...results].sort((a, b) => b.rating - a.rating)
  }

  if (sortBy.value === 'name') {
    return [...results].sort((a, b) => a.name.localeCompare(b.name))
  }

  return results
})

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'All'
  minRating.value = 0
  sortBy.value = 'popular'
}
</script>

<template>
  <div class="explore">
    <div class="container">
      <header class="explore-header">
        <h1>Explore Destinations</h1>
        <p>Find your next place to visit.</p>
      </header>

      <div class="explore-controls">
        <SearchBar
          v-model="searchQuery"
          size="large"
          placeholder="Search destinations or countries..."
        />

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
          <CategoryFilter v-model="selectedCategory" :categories="categories" />

          <div class="filter-group">
            <label for="rating-filter">Rating</label>
            <select id="rating-filter" v-model.number="minRating">
              <option v-for="option in ratingOptions" :key="option.label" :value="option.value">
                {{ option.label }}
              </option>
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

      <DestinationGrid :destinations="filteredDestinations">
        <template #empty-action>
          <Button variant="accent" @click="clearFilters">Clear Filters</Button>
        </template>
      </DestinationGrid>
    </div>
  </div>
</template>

<style scoped>
.explore {
  padding: 2.5rem 0 4rem;
}

.explore-header {
  text-align: center;
  margin-bottom: 2rem;
}

.explore-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.5rem;
}

.explore-header p {
  color: var(--color-muted);
  margin: 0;
}

.explore-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto 2.5rem;
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
  gap: 1.25rem;
  background: rgba(var(--color-primary-rgb), 0.04);
  border-radius: var(--radius);
  padding: 1.25rem;
}

.filter-panel.open {
  display: flex;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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
</style>
