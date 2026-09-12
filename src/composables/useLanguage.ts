import { computed, ref, watch } from 'vue'
import { khmer } from '../locales/km'

export type Language = 'en' | 'km'

const STORAGE_KEY = 'travelgo-language'

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'km' || stored === 'en') return stored
    // Honor a Khmer choice saved before this dedicated key existed.
    const raw = localStorage.getItem('travelgo-settings')
    if (raw && (JSON.parse(raw) as { language?: Language }).language === 'km') return 'km'
  } catch {
    // Storage unavailable — fall through to the default.
  }
  return 'en'
}

// Module-level state so the navbar button, Settings select, and every page
// share one language — exactly like useTheme/useSettings do.
const language = ref<Language>(loadLanguage())

function applyLanguage(value: Language) {
  document.documentElement.lang = value === 'km' ? 'km' : 'en'
}

applyLanguage(language.value)

watch(language, (value) => {
  applyLanguage(value)
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Storage unavailable — the in-memory choice still covers this session.
  }
})

/**
 * Translate an English UI string. Keys are the English source text, so any
 * string without a Khmer entry (service names, destination names, user
 * content) automatically falls back to English instead of breaking.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  let text = language.value === 'km' ? khmer[key] ?? key : key
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(String(value))
    }
  }
  return text
}

/** Locale tag for Intl date formatting that follows the active language. */
export function dateLocale(): string {
  return language.value === 'km' ? 'km-KH' : 'en'
}

export const languageOptions: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'km', label: 'ខ្មែរ · ភាសាខ្មែរ' },
]

export function useLanguage() {
  function setLanguage(value: Language) {
    language.value = value
  }

  function toggleLanguage() {
    language.value = language.value === 'en' ? 'km' : 'en'
  }

  const isKhmer = computed(() => language.value === 'km')
  /** Compact badge text for the navbar button: [ EN ] / [ ខ្មែរ ]. */
  const languageLabel = computed(() => (language.value === 'en' ? 'EN' : 'ខ្មែរ'))

  return { language, isKhmer, languageLabel, setLanguage, toggleLanguage, t }
}
