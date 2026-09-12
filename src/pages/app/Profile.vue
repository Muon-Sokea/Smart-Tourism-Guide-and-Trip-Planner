<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useMyTrips } from '../../composables/useMyTrips'
import { useBookings } from '../../composables/useBookings'
import { useFavorites } from '../../composables/useFavorites'
import { destinations } from '../../data/destinations'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'
import type { Trip } from '../../types/trip'
import { t, dateLocale } from '../../composables/useLanguage'
import type { Booking } from '../../types/booking'

const router = useRouter()
const { user, updateProfile, logout } = useAuth()
const { trips } = useMyTrips()
const { bookings } = useBookings()
const { favoriteIds } = useFavorites()

/* ---------- Data ---------- */
const destMap = new Map(destinations.map((d) => [d.id, d]))

const recentTrips = computed(() => trips.value.slice(0, 2))
const recentBookings = computed(() => bookings.value.slice(0, 3))
const favoriteDestinations = computed(() =>
  favoriteIds.value
    .map((id) => destMap.get(id))
    .filter((d): d is (typeof destinations)[number] => Boolean(d))
    .slice(0, 3)
)

// Simple travel-focused stats derived from existing app state.
const stats = computed(() => [
  { label: t('Total Trips'), value: trips.value.length, icon: 'route' },
  { label: t('Total Bookings'), value: bookings.value.length, icon: 'bookmark' },
  { label: t('Places Visited'), value: favoriteIds.value.length, icon: 'map-pin' },
])

/* ---------- 1. Profile header + edit ---------- */
const isEditing = ref(false)
const form = reactive({ name: '', location: '', bio: '' })

function startEdit() {
  form.name = user.value?.name ?? ''
  form.location = user.value?.location ?? ''
  form.bio = user.value?.bio ?? ''
  isEditing.value = true
}

function saveProfile() {
  updateProfile({
    name: form.name.trim() || user.value?.name,
    location: form.location.trim(),
    bio: form.bio.trim(),
  })
  isEditing.value = false
}

function initials(name?: string): string {
  if (!name) return 'TG'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/* ---------- Formatting helpers (same conventions as MyTrips/MyBookings) ---------- */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat(dateLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${dateStr}T00:00:00`)
  )
}

function tripStatus(tripData: Trip): string {
  const today = new Date().toISOString().slice(0, 10)
  if (!tripData.startDate) return t('Planned')
  if (tripData.endDate && tripData.endDate < today) return t('Completed')
  if (tripData.startDate > today) return t('Upcoming')
  return t('In Progress')
}

function statusClass(tripData: Trip): string {
  const status = tripStatus(tripData)
  if (status === 'Completed') return 'status-completed'
  if (status === 'In Progress') return 'status-active'
  return 'status-upcoming'
}

function statusClassForBooking(booking: Booking): string {
  return `booking-${booking.status.toLowerCase()}`
}

/* ---------- 6. Account actions ---------- */
function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="profile">
    <div class="container container--wide">
      <!-- 1. Profile Header -->
      <section class="profile-card">
        <div v-if="!isEditing" class="profile-main">
          <div class="profile-avatar">
            <span>{{ initials(user?.name) }}</span>
          </div>
          <div class="profile-info">
            <h1>{{ user?.name || t('Travel Explorer') }}</h1>
            <p class="profile-meta">
              <span><Icon name="mail" :size="14" /> {{ user?.email || '—' }}</span>
              <span v-if="user?.location"><Icon name="map-pin" :size="14" /> {{ user.location }}</span>
            </p>
            <p class="profile-bio">{{ user?.bio || t('No bio yet — tell us about your travel style.') }}</p>
          </div>
          <div class="profile-actions">
            <Button variant="outline" @click="startEdit">
              <Icon name="edit" :size="15" />
              {{ t('Edit Profile') }}
            </Button>
          </div>
        </div>

        <form v-else class="profile-edit" @submit.prevent="saveProfile">
          <label>
            {{ t('Name') }}
            <input v-model="form.name" type="text" required />
          </label>
          <label>
            {{ t('Location') }}
            <input v-model="form.location" type="text" :placeholder="t('e.g. Phnom Penh, Cambodia')" />
          </label>
          <label class="bio-field">
            {{ t('Short bio') }}
            <textarea v-model="form.bio" rows="2" :placeholder="t('A line or two about your travel style')"></textarea>
          </label>
          <div class="edit-actions">
            <Button variant="primary" type="submit">
              <Icon name="check" :size="15" />
              {{ t('Save Changes') }}
            </Button>
            <Button variant="outline" @click="isEditing = false">{{ t('Cancel') }}</Button>
          </div>
        </form>
      </section>

      <!-- 2. Travel Statistics -->
      <section class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <span class="stat-icon"><Icon :name="stat.icon" :size="18" /></span>
          <div class="stat-text">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <!-- 3. My Trips preview -->
      <section class="preview-section">
        <div class="section-head">
          <h2>{{ t('My Trips') }}</h2>
          <Button to="/trips" variant="outline">
            {{ t('View All Trips') }}
            <Icon name="arrow-right" :size="14" />
          </Button>
        </div>

        <div v-if="recentTrips.length" class="trips-grid">
          <div v-for="tripItem in recentTrips" :key="tripItem.id" class="trip-card">
            <div class="trip-top">
              <h3>{{ tripItem.name }}</h3>
              <span class="status-badge" :class="statusClass(tripItem)">{{ tripStatus(tripItem) }}</span>
            </div>
            <p class="trip-destination">
              <Icon name="map-pin" :size="14" />
              {{ tripItem.destination || t('No destination set') }}
            </p>
            <div class="trip-meta">
              <span><Icon name="calendar" :size="14" /> {{ formatDate(tripItem.startDate) }}</span>
              <span><Icon name="clock" :size="14" /> {{ t('{n} days', { n: tripItem.days }) }}</span>
              <span><Icon name="map-pin" :size="14" /> {{ t('{n} places', { n: tripItem.items.length }) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="mini-empty">
          <Icon name="route" :size="28" />
          <div>
            <p class="mini-empty-title">{{ t('No trips yet') }}</p>
            <p class="mini-empty-sub">{{ t('Plan your first journey with the Trip Planner.') }}</p>
          </div>
          <Button to="/trip-planner" variant="accent">{{ t('Plan a Trip') }}</Button>
        </div>
      </section>

      <!-- 4. Recent Bookings preview -->
      <section class="preview-section">
        <div class="section-head">
          <h2>{{ t('Recent Bookings') }}</h2>
          <Button to="/bookings" variant="outline">
            {{ t('View All Bookings') }}
            <Icon name="arrow-right" :size="14" />
          </Button>
        </div>

        <div v-if="recentBookings.length" class="bookings-card">
          <div v-for="booking in recentBookings" :key="booking.id" class="booking-row">
            <div class="booking-info">
              <strong>{{ booking.serviceName }}</strong>
              <span>{{ booking.id }} · {{ formatDate(booking.startDate || booking.date) }}</span>
            </div>
            <div class="booking-meta">
              <span class="booking-price">${{ booking.totalPrice }}</span>
              <span class="status-badge" :class="statusClassForBooking(booking)">{{ t(booking.status) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="mini-empty">
          <Icon name="bookmark" :size="28" />
          <div>
            <p class="mini-empty-title">{{ t('No bookings yet') }}</p>
            <p class="mini-empty-sub">{{ t('Book hotels, restaurants, and activities in Explore.') }}</p>
          </div>
          <Button to="/explore" variant="accent">{{ t('Explore Services') }}</Button>
        </div>
      </section>

      <!-- 5. Saved Places preview -->
      <section class="preview-section">
        <div class="section-head">
          <h2>{{ t('Saved Places') }}</h2>
          <Button to="/favorites" variant="outline">
            {{ t('View All') }}
            <Icon name="arrow-right" :size="14" />
          </Button>
        </div>

        <div v-if="favoriteDestinations.length" class="places-grid">
          <router-link
            v-for="destination in favoriteDestinations"
            :key="destination.id"
            :to="`/explore/${destination.id}`"
            class="place-card"
          >
            <div class="place-image">
              <img :src="destination.image" :alt="destination.name" />
              <span class="place-rating"><Icon name="star" :size="12" /> {{ destination.rating.toFixed(1) }}</span>
            </div>
            <div class="place-body">
              <h3>{{ destination.name }}</h3>
              <p><Icon name="map-pin" :size="13" /> {{ destination.country }}</p>
            </div>
          </router-link>
        </div>
        <div v-else class="mini-empty">
          <Icon name="heart" :size="28" />
          <div>
            <p class="mini-empty-title">{{ t('No saved places yet') }}</p>
            <p class="mini-empty-sub">{{ t('Tap the heart on destinations to save them here.') }}</p>
          </div>
          <Button to="/explore" variant="accent">{{ t('Explore Destinations') }}</Button>
        </div>
      </section>

      <!-- 6. Account -->
      <section class="account-card">
        <h2>{{ t('Account') }}</h2>
        <div class="account-actions">
          <Button to="/settings" variant="outline">
            <Icon name="settings" :size="15" />
            {{ t('Settings') }}
          </Button>
          <Button variant="outline" @click="handleLogout">
            <Icon name="log-out" :size="15" />
            {{ t('Log Out') }}
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile {
  padding: 2.25rem 0 3.25rem;
}

.container--wide {
  max-width: 1100px;
}

/* ---------- 1. Profile header ---------- */
.profile-card {
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.35rem 1.5rem;
  margin-bottom: 1rem;
}

.profile-main {
  display: flex;
  align-items: flex-start;
  gap: 1.1rem;
}

.profile-avatar {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-info h1 {
  font-size: var(--fs-section-title);
  margin-bottom: 0.35rem;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.25rem;
  color: var(--color-muted);
  font-size: var(--fs-small);
  margin-bottom: 0.5rem;
}

.profile-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.profile-bio {
  color: var(--color-text);
  font-size: var(--fs-body);
  max-width: 640px;
}

.profile-actions {
  flex-shrink: 0;
}

/* Edit form */
.profile-edit {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.profile-edit label {
  display: grid;
  gap: 0.3rem;
  color: var(--color-primary);
  font-weight: 600;
}

.profile-edit .bio-field {
  grid-column: 1 / -1;
}

.profile-edit input,
.profile-edit textarea {
  width: 100%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 8px;
  padding: 0.55rem 0.65rem;
  background: var(--color-white);
  color: var(--color-text);
  font: inherit;
  font-size: var(--fs-body);
}

.profile-edit textarea {
  resize: vertical;
}

.edit-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

/* ---------- 2. Stats ---------- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1rem 1.15rem;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  flex-shrink: 0;
}

.stat-text {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--fs-stat);
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.15;
}

.stat-label {
  color: var(--color-muted);
  font-size: var(--fs-label);
}

/* ---------- Section scaffolding ---------- */
.preview-section {
  margin-bottom: 1.5rem;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.section-head h2 {
  font-size: var(--fs-section-title);
}

/* ---------- 3. Trips ---------- */
.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.trip-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.1rem 1.2rem;
  border-radius: var(--radius);
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  box-shadow: var(--shadow);
}

.trip-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.trip-top h3 {
  color: var(--color-primary);
}

.trip-destination {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
}

.trip-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-muted);
  font-size: var(--fs-small);
}

.trip-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

/* Status badges — same palette as MyTrips/MyBookings */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: var(--fs-small);
  font-weight: 600;
  white-space: nowrap;
}

.status-upcoming {
  background: rgba(var(--color-accent-rgb), 0.15);
  color: var(--color-accent);
}

.status-active {
  background: rgba(45, 106, 79, 0.12);
  color: var(--color-primary-light);
}

.status-completed {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-muted);
}

.booking-confirmed {
  background: rgba(45, 106, 79, 0.12);
  color: var(--color-primary-light);
}

.booking-pending {
  background: rgba(var(--color-accent-rgb), 0.15);
  color: var(--color-accent);
}

.booking-cancelled {
  background: rgba(180, 60, 50, 0.1);
  color: #a33a2b;
}

.booking-completed {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-muted);
}

/* ---------- 4. Bookings ---------- */
.bookings-card {
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 0.35rem 1.15rem;
}

.booking-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.booking-row:last-child {
  border-bottom: 0;
}

.booking-info {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.booking-info strong {
  color: var(--color-primary);
  font-size: var(--fs-card-desc);
}

.booking-info span {
  color: var(--color-muted);
  font-size: var(--fs-small);
}

.booking-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.booking-price {
  color: var(--color-primary);
  font-weight: 700;
  font-size: var(--fs-card-desc);
}

/* ---------- 5. Saved places ---------- */
.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.place-card {
  border-radius: var(--radius);
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}

.place-card:hover {
  box-shadow: 0 6px 20px rgba(27, 67, 50, 0.16);
  transform: translateY(-2px);
}

.place-image {
  position: relative;
}

.place-image img {
  display: block;
  width: 100%;
  height: 130px;
  object-fit: cover;
}

.place-rating {
  position: absolute;
  left: 0.6rem;
  bottom: 0.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(var(--scrim-rgb), 0.8);
  color: var(--color-on-dark);
  font-size: var(--fs-small);
  font-weight: 600;
}

.place-rating svg {
  color: var(--color-accent);
}

.place-body {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem 0.85rem 0.85rem;
}

.place-body h3 {
  color: var(--color-primary);
  font-size: var(--fs-card-title);
}

.place-body p {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-muted);
  font-size: var(--fs-small);
}

/* ---------- Compact empty states ---------- */
.mini-empty {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.9rem;
  padding: 1.1rem 1.25rem;
  background: var(--color-white);
  border: 1px dashed rgba(var(--color-primary-rgb), 0.25);
  border-radius: var(--radius);
  color: var(--color-primary);
}

.mini-empty > svg {
  flex-shrink: 0;
}

.mini-empty > div {
  flex: 1;
  min-width: 180px;
}

.mini-empty-title {
  font-weight: 600;
}

.mini-empty-sub {
  color: var(--color-muted);
  font-size: var(--fs-small);
}

/* ---------- 6. Account ---------- */
.account-card {
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.15rem 1.5rem;
}

.account-card h2 {
  font-size: var(--fs-section-title);
  margin-bottom: 0.85rem;
}

.account-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

/* ---------- Responsive ---------- */
@media (max-width: 760px) {
  .profile-main {
    flex-direction: column;
  }

  .profile-actions {
    width: 100%;
  }

  .profile-actions :deep(.btn) {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-head :deep(.btn) {
    width: 100%;
  }

  .trips-grid,
  .places-grid {
    grid-template-columns: 1fr;
  }

  .booking-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }

  .edit-actions :deep(.btn) {
    flex: 1 1 100%;
  }

  .account-actions :deep(.btn) {
    flex: 1 1 100%;
  }
}
</style>
