<script setup lang="ts">
import { computed } from 'vue'
import { useFavorites } from '../../composables/useFavorites'
import { useTripPlanner } from '../../composables/useTripPlanner'
import { useAuth } from '../../composables/useAuth'
import TripCard from '../../components/planner/TripCard.vue'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'

const { favoriteIds } = useFavorites()
const { trip } = useTripPlanner()
const { user, isLoggedIn, logout } = useAuth()

const stats = computed(() => [
  { label: 'Saved Places', value: favoriteIds.value.length },
  { label: 'Trip Days', value: trip.value.days },
  { label: 'Planned Destinations', value: trip.value.items.length },
])
</script>

<template>
  <div class="profile">
    <div class="container">
      <header class="profile-header">
        <div class="profile-avatar">
          <Icon name="user" :size="36" />
        </div>
        <h1>{{ user ? user.name : 'Travel Explorer' }}</h1>
        <p>{{ user ? user.email : 'Discovering the world one destination at a time.' }}</p>

        <div class="profile-auth">
          <Button v-if="isLoggedIn" variant="outline" @click="logout">
            <Icon name="log-out" :size="16" />
            Log Out
          </Button>
          <template v-else>
            <Button to="/login" variant="outline">Log In</Button>
            <Button to="/signup" variant="accent">Sign Up</Button>
          </template>
        </div>
      </header>

      <section class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </section>

      <section class="profile-section">
        <h2>My Trips</h2>
        <TripCard :trip="trip" />
      </section>

      <section class="profile-section">
        <h2>Quick Actions</h2>
        <div class="quick-actions">
          <Button to="/favorites" variant="outline">
            <Icon name="heart" :size="16" />
            My Favorites
          </Button>
          <Button to="/trip-planner" variant="outline">
            <Icon name="route" :size="16" />
            My Trips
          </Button>
          <Button to="/map" variant="outline">
            <Icon name="map" :size="16" />
            View Map
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile {
  padding: 2rem 0 3rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.profile-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.4rem;
}

.profile-header p {
  color: var(--color-muted);
  margin: 0 0 1.25rem;
}

.profile-auth {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  text-align: center;
}

.stat-value {
  font-size: var(--fs-stat);
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--fs-label);
  color: var(--color-muted);
}

.profile-section {
  margin-bottom: 2.5rem;
}

.profile-section h2 {
  color: var(--color-primary);
  margin: 0 0 1.25rem;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-actions :deep(.btn) {
    width: 100%;
  }
}
</style>
