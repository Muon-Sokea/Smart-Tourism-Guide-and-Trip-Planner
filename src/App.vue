<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'

const route = useRoute()
const isAuthPage = computed(() => route.path === '/login' || route.path === '/signup')
</script>

<template>
  <Navbar />
  <main>
    <router-view />
  </main>
  <Footer v-if="!isAuthPage" />
</template>

<style scoped></style>
