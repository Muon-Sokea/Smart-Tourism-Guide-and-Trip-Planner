<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { t } from '../../composables/useLanguage'
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
    errorMessage.value = t('Please enter your email and password.')
    return
  }

  errorMessage.value = ''
  login(email.value.trim())
  // Replace, not push: the login page should not stay in history, so Back
  // never returns to it (which the auth guard would immediately bounce back).
  router.replace('/')
}
</script>

<template>
  <AuthCard :title="t('Welcome Back')" :subtitle="t('Log in to access your saved trips and favorites.')">
    <form class="auth-form" @submit.prevent="handleSubmit">
      <label class="field">
        <span>{{ t('Email') }}</span>
        <div class="input-wrap">
          <Icon name="mail" :size="18" />
          <input v-model="email" type="email" placeholder="you@example.com" autocomplete="email" />
        </div>
      </label>

      <label class="field">
        <span>{{ t('Password') }}</span>
        <div class="input-wrap">
          <Icon name="lock" :size="18" />
          <input
            v-model="password"
            type="password"
            :placeholder="t('Your password')"
            autocomplete="current-password"
          />
        </div>
      </label>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <Button variant="primary" type="submit">{{ t('Log In') }}</Button>
    </form>

    <template #switch>
      {{ t("Don't have an account?") }} <router-link to="/signup">{{ t('Sign Up') }}</router-link>
    </template>
  </AuthCard>
</template>
