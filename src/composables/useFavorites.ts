import { ref, watch } from 'vue'

const STORAGE_KEY = 'travelgo-favorites'

function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Module-level state so every component sharing this composable sees the same list.
const favoriteIds = ref<number[]>(loadFavorites())

watch(
  favoriteIds,
  (ids) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  },
  { deep: true }
)

export function useFavorites() {
  function isFavorite(id: number) {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id: number) {
    favoriteIds.value = isFavorite(id)
      ? favoriteIds.value.filter((favoriteId) => favoriteId !== id)
      : [...favoriteIds.value, id]
  }

  return { favoriteIds, isFavorite, toggleFavorite }
}
