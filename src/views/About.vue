<script setup lang="ts">
const goals = [
  'Make destination discovery simple',
  'Provide useful destination information',
  'Create an easy-to-use interface',
]
</script>

<template>
  <div class="about">
    <div class="container">
      <h1>About TravelGo</h1>
      <p class="intro">
        TravelGo is a simple tourism discovery website designed to help users
        explore interesting destinations around the world.
      </p>

      <section class="about-section">
        <h2>Our Goal</h2>
        <ul class="goal-list">
          <li v-for="goal in goals" :key="goal">{{ goal }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding: 3rem 0 4rem;
  max-width: 720px;
  margin: 0 auto;
}

.about h1 {
  color: var(--color-primary);
  margin: 0 0 1rem;
}

.intro {
  color: var(--color-text);
  line-height: 1.6;
  margin: 0 0 2.5rem;
}

.about-section {
  margin-bottom: 2.5rem;
}

.about-section h2 {
  color: var(--color-primary);
  margin: 0 0 1rem;
}

.goal-list {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--color-text);
  font-size: var(--fs-body);
  line-height: 1.8;
}
</style>
