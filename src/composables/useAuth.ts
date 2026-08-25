import { computed, ref, watch } from 'vue'
import type { User } from '../types/user'

const STORAGE_KEY = 'travelgo-user'

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

// Module-level state so every component sharing this composable sees the same user.
const user = ref<User | null>(loadUser())

watch(user, (value) => {
  if (value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
})

export function useAuth() {
  const isLoggedIn = computed(() => user.value !== null)

  // This project has no backend, so there is no real password check —
  // signing up or logging in just stores a mock profile locally.
  function signup(name: string, email: string) {
    user.value = { name, email }
  }

  function login(email: string) {
    user.value = { name: user.value?.name ?? email.split('@')[0], email }
  }

  function logout() {
    user.value = null
  }

  return { user, isLoggedIn, signup, login, logout }
}
