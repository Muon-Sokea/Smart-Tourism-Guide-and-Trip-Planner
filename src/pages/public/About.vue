<script setup lang="ts">
import Icon from '../../components/common/Icon.vue'

const goals = [
  { title: 'Simple discovery', text: 'Find places worth visiting without digging through cluttered travel pages.', icon: 'compass' },
  { title: 'Useful context', text: 'Compare ratings, categories, timing, cost, and highlights before you plan.', icon: 'map' },
  { title: 'Clear planning', text: 'Move naturally from an inspiring idea to a trip you can organize.', icon: 'route' },
]

const highlights = [
  'Curated destinations from around the world',
  'Searchable categories and practical travel details',
  'A calm workspace for building your next journey',
]
</script>

<template>
  <div class="about">
    <div class="container">
      <header class="about-hero">
        <p class="eyebrow">Your travel companion</p>
        <h1>About TravelGo</h1>
        <p class="intro">
          TravelGo is a simple tourism discovery platform designed to help you explore interesting destinations,
          collect inspiration, and shape it into a journey that feels like yours.
        </p>
      </header>

      <section class="mission-panel">
        <div>
          <p class="eyebrow">Who we are</p>
          <h2>Travel planning, made more human.</h2>
        </div>
        <p class="section-copy">
          We bring discovery and planning into one focused place. TravelGo keeps the first step of a trip enjoyable
          while giving every destination enough detail to make the next step feel easy.
        </p>
      </section>

      <section class="mission-panel">
        <div>
          <p class="eyebrow">Our mission</p>
          <h2>Make every journey easier to begin.</h2>
        </div>
        <p>From a quick search to a day-by-day plan, TravelGo helps turn curiosity into a clear, personal travel idea.</p>
      </section>

      <section class="about-section">
        <div class="section-heading">
          <p class="eyebrow">Why choose TravelGo</p>
          <h2>Designed around the way people explore</h2>
        </div>
        <div class="goal-grid">
          <article v-for="goal in goals" :key="goal.title" class="goal-card">
            <span class="goal-icon"><Icon :name="goal.icon" :size="20" /></span>
            <h3>{{ goal.title }}</h3>
            <p>{{ goal.text }}</p>
          </article>
        </div>
      </section>

      <section class="highlights-section">
        <div>
          <p class="eyebrow">TravelGo highlights</p>
          <h2>Everything you need for a confident first step</h2>
        </div>
        <ul class="highlight-list">
          <li v-for="highlight in highlights" :key="highlight">
            <Icon name="check" :size="17" />
            <span>{{ highlight }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding: 2.5rem 0 3.25rem;
}

.about-hero {
  max-width: 760px;
  margin: 0 auto 2.5rem;
  text-align: center;
}

.about h1,
.about h2,
.about h3 {
  color: var(--color-primary);
}

.about h1 {
  margin: 0 0 0.6rem;
}

.intro {
  max-width: 680px;
  margin: 0 auto;
  color: var(--color-muted);
  line-height: 1.6;
}

.about-section {
  max-width: 1040px;
  margin: 0 auto 2.25rem;
}

.eyebrow {
  margin: 0 0 0.3rem;
  color: var(--color-accent);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.about h2 {
  margin: 0;
  font-size: var(--fs-section-title);
}

.who-we-are,
.mission-panel,
.highlights-section {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 2rem;
  align-items: start;
  max-width: 1040px;
  margin-left: auto;
  margin-right: auto;
}

.who-we-are {
  padding: 1.5rem 0;
  border-top: 1px solid rgba(var(--color-primary-rgb), 0.12);
  border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
}

.section-copy,
.mission-panel p {
  color: var(--color-muted);
  line-height: 1.6;
}

.mission-panel {
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem 1.75rem;
  border-radius: var(--radius);
  background: rgba(var(--color-primary-rgb), 0.06);
}

.section-heading {
  margin-bottom: 1rem;
}

.goal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.goal-card {
  min-width: 0;
  padding: 1.1rem;
  border-radius: var(--radius);
  background: var(--color-white);
  box-shadow: var(--shadow);
}

.goal-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin-bottom: 0.8rem;
  border-radius: 10px;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
}

.goal-card h3 {
  margin: 0 0 0.35rem;
}

.goal-card p {
  color: var(--color-muted);
  font-size: var(--fs-card-desc);
  line-height: 1.5;
}

.highlights-section {
  margin-top: 0.25rem;
}

.highlight-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.highlight-list li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-text);
  font-size: var(--fs-card-desc);
}

.highlight-list svg {
  flex: 0 0 auto;
  color: var(--color-accent);
}

@media (max-width: 720px) {
  .who-we-are,
  .mission-panel,
  .highlights-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .goal-grid {
    grid-template-columns: 1fr;
  }

  .mission-panel {
    padding: 1.25rem;
  }
}
</style>
