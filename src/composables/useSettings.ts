import { ref, watch } from 'vue'

export type Currency = 'USD' | 'KHR'
export type DateFormat = 'dmy' | 'mdy' | 'iso'
export type LocationPermission = 'always' | 'while-using' | 'never'

export interface AppSettings {
  // Notifications
  notifyBookings: boolean
  notifyTripReminders: boolean
  notifyServices: boolean
  // Language & region (language itself lives in useLanguage — one global state)
  currency: Currency
  dateFormat: DateFormat
  // Travel preferences
  travelStyle: string
  preferredActivities: string[]
  budgetPreference: string
  transportation: string
  // Privacy
  locationPermission: LocationPermission
  shareProfile: boolean
  personalizedRecommendations: boolean
}

const STORAGE_KEY = 'travelgo-settings'

const defaultSettings: AppSettings = {
  notifyBookings: true,
  notifyTripReminders: true,
  notifyServices: false,
  currency: 'USD',
  dateFormat: 'dmy',
  travelStyle: 'Balanced',
  preferredActivities: ['Culture'],
  budgetPreference: 'Mid-range',
  transportation: 'Flight',
  locationPermission: 'while-using',
  shareProfile: false,
  personalizedRecommendations: true,
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) } : { ...defaultSettings }
  } catch {
    return { ...defaultSettings }
  }
}

// Module-level state so every component sharing this composable sees the same settings.
const settings = ref<AppSettings>(loadSettings())

watch(
  settings,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true }
)

// Options — derived from the existing TravelGo data categories (destinations,
// activities) so preference labels match what users see across the app.
export const travelStyleOptions = ['Relaxed', 'Balanced', 'Adventurous']
export const activityOptions = ['Culture', 'Beach', 'Nature', 'Adventure', 'Food', 'City', 'Wellness', 'Wildlife']
export const budgetOptions = ['Budget', 'Mid-range', 'Luxury']
export const transportOptions = ['Flight', 'Bus', 'Car Rental', 'Boat', 'Train']
// languageOptions lives in useLanguage so the navbar button and this page
// always share one global language state.
export const currencyOptions: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD · US Dollar ($)' },
  { value: 'KHR', label: 'KHR · Cambodian Riel (៛)' },
]
export const dateFormatOptions: { value: DateFormat; label: string }[] = [
  { value: 'dmy', label: 'DD/MM/YYYY' },
  { value: 'mdy', label: 'MM/DD/YYYY' },
  { value: 'iso', label: 'YYYY-MM-DD' },
]
export const locationPermissionOptions: { value: LocationPermission; label: string }[] = [
  { value: 'always', label: 'Always allowed' },
  { value: 'while-using', label: 'While using the app' },
  { value: 'never', label: 'Never' },
]

export function useSettings() {
  function toggleActivity(activity: string) {
    settings.value.preferredActivities = settings.value.preferredActivities.includes(activity)
      ? settings.value.preferredActivities.filter((item) => item !== activity)
      : [...settings.value.preferredActivities, activity]
  }

  function resetSettings() {
    settings.value = { ...defaultSettings }
  }

  return { settings, toggleActivity, resetSettings }
}
