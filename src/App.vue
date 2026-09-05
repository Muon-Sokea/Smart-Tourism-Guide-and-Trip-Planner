<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
import Navbar from './components/layout/Navbar.vue'

const route = useRoute()
const shell = computed(() => route.meta.shell ?? 'public')
const isAuthPage = computed(() => shell.value === 'auth')
</script>

<template>
  <template v-if="isAuthPage">
    <Navbar />
    <main class="auth-main">
      <router-view />
    </main>
  </template>

  <AppLayout v-else>
    <router-view />
  </AppLayout>
</template>

<style scoped>
main.auth-main {
  padding-top: var(--navbar-height);
}
</style>
