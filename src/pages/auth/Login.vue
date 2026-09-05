<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import AuthCard from '../../components/common/AuthCard.vue'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

function handleSubmit() {
  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }

  errorMessage.value = ''
  login(email.value.trim())
  router.push('/')
}
</script>

<template>
  <AuthCard title="Welcome Back" subtitle="Log in to access your saved trips and favorites.">
    <form class="auth-form" @submit.prevent="handleSubmit">
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
            placeholder="Your password"
            autocomplete="current-password"
          />
        </div>
      </label>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <Button variant="primary" type="submit">Log In</Button>
    </form>

    <template #switch>
      Don't have an account? <router-link to="/signup">Sign Up</router-link>
    </template>
  </AuthCard>
</template>
