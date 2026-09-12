<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useBookings } from '../../composables/useBookings'
import { useFavorites } from '../../composables/useFavorites'
import { useMyTrips } from '../../composables/useMyTrips'
import { useTheme } from '../../composables/useTheme'
import { useSettings } from '../../composables/useSettings'
import {
  activityOptions,
  budgetOptions,
  currencyOptions,
  dateFormatOptions,
  languageOptions,
  locationPermissionOptions,
  transportOptions,
  travelStyleOptions,
} from '../../composables/useSettings'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'
import SettingsToggle from '../../components/settings/SettingsToggle.vue'

const router = useRouter()
const { user, updateProfile, logout } = useAuth()
const { theme, setTheme } = useTheme()
const { settings, toggleActivity, resetSettings } = useSettings()

/* ---------- 1. Account ---------- */
const isEditingProfile = ref(false)
const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
})

function startEditProfile() {
  profileForm.name = user.value?.name ?? ''
  profileForm.email = user.value?.email ?? ''
  profileForm.phone = user.value?.phone ?? ''
  isEditingProfile.value = true
}

function saveProfile() {
  updateProfile({
    name: profileForm.name.trim() || user.value?.name,
    email: profileForm.email.trim() || user.value?.email,
    phone: profileForm.phone.trim() || undefined,
  })
  isEditingProfile.value = false
}

/* ---------- 2. Appearance ---------- */
const themeOptions = [
  { value: 'light' as const, label: 'Light Mode', icon: 'sun' },
  { value: 'dark' as const, label: 'Dark Mode', icon: 'moon' },
]

/* ---------- 4. Language & Region ---------- */
const datePreview = computed(() => {
  const sample = new Date(2026, 8, 11)
  const y = sample.getFullYear()
  const m = String(sample.getMonth() + 1).padStart(2, '0')
  const d = String(sample.getDate()).padStart(2, '0')
  if (settings.value.dateFormat === 'mdy') return `${m}/${d}/${y}`
  if (settings.value.dateFormat === 'iso') return `${y}-${m}-${d}`
  return `${d}/${m}/${y}`
})

function formatBookingSample(value: string) {
  if (settings.value.currency === 'KHR') return `${Math.round(Number(value) * 4100).toLocaleString()} ៛`
  return `$${value}`
}

/* ---------- 7. Account Actions ---------- */
const { bookings } = useBookings()
const { favoriteIds } = useFavorites()
const { trips } = useMyTrips()

const showDeleteModal = ref(false)
const deleteConfirmText = ref('')

function closeDeleteModal() {
  deleteConfirmText.value = ''
  showDeleteModal.value = false
}

// Logging out must leave the app shell — otherwise the user stays on the
// Settings page with an active-looking session.
function handleLogout() {
  logout()
  router.push('/login')
}

// Deleting wipes every piece of local TravelGo data, matching the warning
// shown in the confirmation modal.
function confirmDelete() {
  bookings.value = []
  favoriteIds.value = []
  trips.value = []
  resetSettings()
  closeDeleteModal()
  logout()
  router.push('/login')
}
</script>

<template>
  <div class="settings">
    <div class="container container--narrow">
      <header class="page-header">
        <p class="eyebrow">Your account</p>
        <h1>Settings</h1>
        <p class="page-subtitle">Manage your profile, appearance, notifications, and travel preferences.</p>
      </header>

      <!-- 1. Account -->
      <section class="settings-card">
        <div class="card-head">
          <span class="card-icon"><Icon name="user" :size="16" /></span>
          <h2>Account</h2>
        </div>

        <dl v-if="!isEditingProfile" class="info-list">
          <div>
            <dt>Profile</dt>
            <dd>{{ user?.name || 'Travel Explorer' }}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{{ user?.email || '—' }}</dd>
          </div>
          <div>
            <dt>Phone number</dt>
            <dd>{{ user?.phone || 'Not set' }}</dd>
          </div>
        </dl>
        <div v-else class="edit-grid">
          <label>
            Name
            <input v-model="profileForm.name" type="text" />
          </label>
          <label>
            Email
            <input v-model="profileForm.email" type="email" />
          </label>
          <label>
            Phone number
            <input v-model="profileForm.phone" type="tel" placeholder="+855 ..." />
          </label>
        </div>

        <div class="card-actions">
          <template v-if="!isEditingProfile">
            <Button variant="outline" @click="startEditProfile">
              <Icon name="edit" :size="15" />
              Edit Profile
            </Button>
          </template>
          <template v-else>
            <Button variant="primary" @click="saveProfile">
              <Icon name="check" :size="15" />
              Save Changes
            </Button>
            <Button variant="outline" @click="isEditingProfile = false">Cancel</Button>
          </template>
        </div>
      </section>

      <!-- 2. Appearance -->
      <section class="settings-card">
        <div class="card-head">
          <span class="card-icon"><Icon name="sun" :size="16" /></span>
          <h2>Appearance</h2>
        </div>
        <div class="theme-grid">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            type="button"
            class="theme-option"
            :class="{ active: theme === option.value }"
            :aria-pressed="theme === option.value"
            @click="setTheme(option.value)"
          >
            <Icon :name="option.icon" :size="18" />
            <span>{{ option.label }}</span>
            <Icon v-if="theme === option.value" name="check" :size="15" class="theme-check" />
          </button>
        </div>
        <p class="card-hint">
          The sun/moon button in the top navbar stays in sync as a quick toggle.
        </p>
      </section>

      <!-- 3. Notifications -->
      <section class="settings-card">
        <div class="card-head">
          <span class="card-icon"><Icon name="bell" :size="16" /></span>
          <h2>Notifications</h2>
        </div>
        <div class="toggle-list">
          <SettingsToggle
            v-model="settings.notifyBookings"
            label="Booking updates"
            description="Confirmations, changes, and cancellations for your bookings."
          />
          <SettingsToggle
            v-model="settings.notifyTripReminders"
            label="Trip reminders"
            description="Reminders before upcoming trips and saved itineraries."
          />
          <SettingsToggle
            v-model="settings.notifyServices"
            label="Service and activity updates"
            description="New hotels, restaurants, and activities near your destinations."
          />
        </div>
        <p class="card-hint">
          Manage these from the bell icon in the navbar at any time.
        </p>
      </section>

      <!-- 4. Language & Region -->
      <section class="settings-card">
        <div class="card-head">
          <span class="card-icon"><Icon name="globe" :size="16" /></span>
          <h2>Language &amp; Region</h2>
        </div>
        <div class="select-grid">
          <label>
            Language
            <select v-model="settings.language">
              <option v-for="option in languageOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label>
            Currency
            <select v-model="settings.currency">
              <option v-for="option in currencyOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label>
            Date format
            <select v-model="settings.dateFormat">
              <option v-for="option in dateFormatOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>
        <p class="card-hint">
          Preview — today is <strong>{{ datePreview }}</strong>, a $25 booking shows as
          <strong>{{ formatBookingSample('25') }}</strong>.
        </p>
      </section>

      <!-- 5. Travel Preferences -->
      <section class="settings-card">
        <div class="card-head">
          <span class="card-icon"><Icon name="compass" :size="16" /></span>
          <h2>Travel Preferences</h2>
        </div>

        <div class="pref-block">
          <p class="pref-label">Travel style</p>
          <div class="chip-row">
            <button
              v-for="style in travelStyleOptions"
              :key="style"
              type="button"
              class="chip"
              :class="{ active: settings.travelStyle === style }"
              @click="settings.travelStyle = style"
            >
              {{ style }}
            </button>
          </div>
        </div>

        <div class="pref-block">
          <p class="pref-label">Preferred activities</p>
          <div class="chip-row">
            <button
              v-for="activity in activityOptions"
              :key="activity"
              type="button"
              class="chip"
              :class="{ active: settings.preferredActivities.includes(activity) }"
              @click="toggleActivity(activity)"
            >
              {{ activity }}
            </button>
          </div>
        </div>

        <div class="select-grid">
          <label>
            Budget preference
            <select v-model="settings.budgetPreference">
              <option v-for="option in budgetOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
          <label>
            Transportation preference
            <select v-model="settings.transportation">
              <option v-for="option in transportOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
        </div>
      </section>

      <!-- 6. Privacy -->
      <section class="settings-card">
        <div class="card-head">
          <span class="card-icon"><Icon name="shield" :size="16" /></span>
          <h2>Privacy</h2>
        </div>
        <div class="select-grid select-grid--single">
          <label>
            Location permission
            <select v-model="settings.locationPermission">
              <option v-for="option in locationPermissionOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>
        <div class="toggle-list">
          <SettingsToggle
            v-model="settings.shareProfile"
            label="Share profile with travel companions"
            description="Let people you travel with see your name and avatar."
          />
          <SettingsToggle
            v-model="settings.personalizedRecommendations"
            label="Personalized recommendations"
            description="Use your favorites and trips to suggest places you may like."
          />
        </div>
      </section>

      <!-- 7. Account Actions -->
      <section class="settings-card account-actions">
        <div class="card-head">
          <span class="card-icon"><Icon name="lock" :size="16" /></span>
          <h2>Account Actions</h2>
        </div>
        <div class="action-row">
          <Button variant="outline" @click="handleLogout">
            <Icon name="log-out" :size="15" />
            Log Out
          </Button>
          <Button variant="outline" class="danger-btn" @click="showDeleteModal = true">
            <Icon name="trash" :size="15" />
            Delete Account
          </Button>
        </div>
        <p class="card-hint">Deleting removes your local profile, trips, bookings, and favorites.</p>
      </section>
    </div>

    <!-- Delete Account confirmation modal -->
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <header class="modal-header">
          <span class="modal-icon"><Icon name="alert" :size="20" /></span>
          <div class="modal-heading">
            <h2 id="delete-modal-title">Delete Account?</h2>
            <p>This action cannot be undone.</p>
          </div>
          <button type="button" class="modal-close" aria-label="Close dialog" @click="closeDeleteModal">
            <Icon name="x" :size="16" />
          </button>
        </header>

        <div class="modal-body">
          <p class="modal-warning">
            This permanently removes everything stored for your account on this device:
          </p>
          <ul class="modal-list">
            <li><Icon name="user" :size="14" /> Profile and account details</li>
            <li><Icon name="route" :size="14" /> Saved trips and itineraries</li>
            <li><Icon name="bookmark" :size="14" /> All bookings</li>
            <li><Icon name="heart" :size="14" /> Favorite places</li>
          </ul>
          <label class="modal-confirm">
            <span>Type <strong>DELETE</strong> to confirm</span>
            <input v-model="deleteConfirmText" type="text" placeholder="DELETE" autocomplete="off" />
          </label>
        </div>

        <footer class="modal-footer">
          <Button variant="outline" @click="closeDeleteModal">Cancel</Button>
          <button
            type="button"
            class="btn danger"
            :disabled="deleteConfirmText !== 'DELETE'"
            @click="confirmDelete"
          >
            <Icon name="trash" :size="15" />
            Delete Account
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings {
  padding: 2.25rem 0 3.25rem;
}

/* Wide container so cards use the available content width without dead side space */
.container--narrow {
  max-width: 1100px;
}

.page-header {
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.3rem;
  color: var(--color-accent);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2 {
  color: var(--color-primary);
}

.page-subtitle {
  margin-top: 0.4rem;
  color: var(--color-muted);
  max-width: 520px;
}

/* Cards */
.settings-card {
  background: var(--color-white);
  border: 1px solid rgba(var(--color-primary-rgb), 0.08);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.15rem 1.25rem;
  margin-bottom: 1rem;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.9rem;
}

.card-head h2 {
  font-size: var(--fs-card-title);
}

.card-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  flex-shrink: 0;
}

.card-hint {
  margin-top: 0.75rem;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-muted);
  font-size: var(--fs-small);
}

.card-hint strong {
  color: var(--color-primary);
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.9rem;
}

/* Account info list */
.info-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
}

.info-list div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.info-list div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.info-list dt {
  color: var(--color-muted);
}

.info-list dd {
  margin: 0;
  color: var(--color-primary);
  font-weight: 600;
  text-align: right;
}

/* Edit profile form */
.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.edit-grid label {
  display: grid;
  gap: 0.3rem;
  color: var(--color-primary);
  font-weight: 600;
}

.edit-grid label:first-child {
  grid-column: 1 / -1;
}

/* Appearance */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.theme-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid rgba(var(--color-primary-rgb), 0.18);
  border-radius: 10px;
  background: transparent;
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.theme-option:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.theme-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-white);
}

.theme-check {
  margin-left: auto;
}

/* Notifications / privacy toggles */
.toggle-list {
  display: grid;
}

.toggle-list > * + * {
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

/* Selects */
.select-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.select-grid--single {
  grid-template-columns: minmax(0, 320px);
}

.select-grid label,
.select-grid--single label {
  display: grid;
  gap: 0.3rem;
  color: var(--color-primary);
  font-weight: 600;
}

input,
select {
  width: 100%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 8px;
  padding: 0.55rem 0.65rem;
  background: var(--color-white);
  color: var(--color-text);
  font: inherit;
  font-size: var(--fs-body);
}

/* Travel preference chips */
.pref-block {
  margin-bottom: 0.9rem;
}

.pref-block:last-of-type {
  margin-bottom: 0;
}

.pref-label {
  margin-bottom: 0.45rem;
  color: var(--color-muted);
  font-size: var(--fs-small);
  font-weight: 600;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.chip {
  padding: 0.4rem 0.85rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text);
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}

.chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.chip.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-white);
}

/* Account actions */
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.danger-btn {
  color: #a33a2b;
  border-color: rgba(163, 58, 43, 0.45);
}

.danger-btn:hover {
  background: #a33a2b;
  border-color: #a33a2b;
  color: var(--color-white);
}

/* Delete modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(var(--scrim-rgb), 0.55);
}

.modal {
  width: min(440px, 100%);
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.08);
}

.modal-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(163, 58, 43, 0.12);
  color: #a33a2b;
  flex-shrink: 0;
}

.modal-heading {
  flex: 1;
  min-width: 0;
}

.modal-heading h2 {
  font-size: var(--fs-card-title);
}

.modal-heading p {
  margin-top: 0.1rem;
  color: var(--color-muted);
  font-size: var(--fs-small);
}

.modal-close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.modal-close:hover {
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
}

.modal-body {
  display: grid;
  gap: 0.85rem;
  padding: 1.15rem 1.25rem;
}

.modal-warning {
  color: var(--color-muted);
  font-size: var(--fs-body);
}

.modal-list {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0.75rem 0.9rem;
  list-style: none;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: 10px;
  background: rgba(var(--color-primary-rgb), 0.03);
}

.modal-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: var(--fs-body);
}

.modal-list svg {
  color: var(--color-accent);
  flex-shrink: 0;
}

.modal-confirm {
  display: grid;
  gap: 0.35rem;
}

.modal-confirm > span {
  color: var(--color-primary);
  font-size: var(--fs-body);
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.08);
  background: rgba(var(--color-primary-rgb), 0.03);
  border-radius: 0 0 var(--radius) var(--radius);
}

.btn.danger {
  background: #a33a2b;
  color: var(--color-white);
}

.btn.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.danger:not(:disabled):hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 700px) {
  .edit-grid,
  .theme-grid {
    grid-template-columns: 1fr;
  }

  .select-grid {
    grid-template-columns: 1fr;
  }

  .select-grid--single {
    grid-template-columns: 1fr;
  }

  .info-list div {
    flex-direction: column;
    gap: 0.15rem;
  }

  .info-list dd {
    text-align: left;
  }

  .action-row :deep(.btn),
  .modal-footer :deep(.btn),
  .modal-footer .btn {
    flex: 1 1 100%;
  }
}
</style>
