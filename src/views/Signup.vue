<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AuthCard from '../components/common/AuthCard.vue'
import Button from '../components/common/Button.vue'
import Icon from '../components/common/Icon.vue'

const router = useRouter()
const { signup } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

function handleSubmit() {
  if (!name.value.trim() || !email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Please fill in every field.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  errorMessage.value = ''
  signup(name.value.trim(), email.value.trim())
  router.push('/')
}
</script>

<template>
  <AuthCard title="Create Your Account" subtitle="Sign up to save favorites and plan your trips.">
    <form class="auth-form" @submit.prevent="handleSubmit">
      <label class="field">
        <span>Name</span>
        <div class="input-wrap">
          <Icon name="user" :size="18" />
          <input v-model="name" type="text" placeholder="Your name" autocomplete="name" />
        </div>
      </label>

      <label class="field">
        <span>Email</span>
        <div class="input-wrap">
          <Icon name="mail" :size="18" />
          <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" />
        </div>
      </label>

      <label class="field">
        <span>Password</span>
        <div class="input-wrap">
          <Icon name="lock" :size="18" />
          <input
            v-model="password"
            type="password"
            placeholder="Create a password"
            autocomplete="new-password"
          />
        </div>
      </label>

      <label class="field">
        <span>Confirm Password</span>
        <div class="input-wrap">
          <Icon name="lock" :size="18" />
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            autocomplete="new-password"
          />
        </div>
      </label>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <Button variant="primary" type="submit">Sign Up</Button>
    </form>

    <template #switch>
      Already have an account? <router-link to="/login">Log In</router-link>
    </template>
  </AuthCard>
</template>
