<script setup lang="ts">
import { ref } from 'vue'
import Footer from './Footer.vue'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="app-layout">
    <Navbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="layout-body">
      <Sidebar :open="isSidebarOpen" @close="isSidebarOpen = false" />
      <button
        v-if="isSidebarOpen"
        type="button"
        class="sidebar-backdrop"
        aria-label="Close navigation"
        @click="isSidebarOpen = false"
      ></button>

      <main class="layout-content" @click="isSidebarOpen = false">
        <slot />
        <Footer />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.layout-body {
  min-height: 100vh;
}

.layout-content {
  width: auto;
  min-width: 0;
  min-height: 100vh;
  margin-left: var(--sidebar-width);
  padding-top: var(--navbar-height);
}

.sidebar-backdrop {
  display: none;
}

@media (max-width: 800px) {
  .layout-content {
    margin-left: 0;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: var(--navbar-height) 0 0;
    z-index: 35;
    border: 0;
    background: rgba(0, 0, 0, 0.28);
  }
}
</style>