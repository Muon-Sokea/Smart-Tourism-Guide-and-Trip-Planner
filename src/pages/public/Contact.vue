<script setup lang="ts">
import { ref } from 'vue'
import Icon from '../../components/common/Icon.vue'
import Button from '../../components/common/Button.vue'

const contactDetails = [
  { label: 'Email', value: 'hello@travelgo.example', icon: 'mail' },
  { label: 'Phone', value: '+1 (555) 010-2024', icon: 'user' },
  { label: 'Office', value: '123 Journey Street, Phnom Penh, Cambodia', icon: 'map-pin' },
]

const name = ref('')
const email = ref('')
const message = ref('')
const errorMessage = ref('')
const isSubmitted = ref(false)

function handleSubmit() {
  if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
    errorMessage.value = 'Please fill in every field.'
    return
  }

  // No backend — this just confirms locally, matching the rest of the project.
  errorMessage.value = ''
  isSubmitted.value = true
  name.value = ''
  email.value = ''
  message.value = ''
}
</script>

<template>
  <div class="contact">
    <div class="container">
      <header class="page-header">
        <h1>Contact Us</h1>
        <p>Questions about a trip or destination? Send us a message.</p>
      </header>

      <div class="contact-layout">
        <div class="contact-info">
          <div v-for="detail in contactDetails" :key="detail.label" class="info-card">
            <span class="info-icon"><Icon :name="detail.icon" :size="20" /></span>
            <div>
              <span class="info-label">{{ detail.label }}</span>
              <span class="info-value">{{ detail.value }}</span>
            </div>
          </div>
        </div>

        <form class="contact-form" @submit.prevent="handleSubmit">
          <p v-if="isSubmitted" class="success-message">
            <Icon name="check" :size="16" />
            Thanks! Your message has been sent.
          </p>

          <label class="field">
            <span>Name</span>
            <input v-model="name" type="text" placeholder="Your name" />
          </label>

          <label class="field">
            <span>Email</span>
            <input v-model="email" type="email" placeholder="you@example.com" />
          </label>

          <label class="field">
            <span>Message</span>
            <textarea v-model="message" rows="5" placeholder="How can we help?"></textarea>
          </label>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <Button variant="primary" type="submit">Send Message</Button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact {
  padding: 2rem 0 3rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: var(--color-primary);
  margin: 0 0 0.5rem;
}

.page-header p {
  color: var(--color-muted);
  margin: 0;
}

.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1.5rem;
  align-items: start;
  max-width: 900px;
  margin: 0 auto;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.1rem 1.25rem;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(var(--color-primary-rgb), 0.08);
  color: var(--color-primary);
  flex-shrink: 0;
}

.info-card > div {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: var(--fs-label);
  color: var(--color-muted);
}

.info-value {
  font-weight: 600;
  color: var(--color-primary);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background: var(--color-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field span {
  font-size: var(--fs-label);
  font-weight: 500;
  color: var(--color-primary);
}

.field input,
.field textarea {
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-size: var(--fs-body);
  color: var(--color-text);
  resize: vertical;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.error-message {
  color: var(--color-accent);
  font-size: var(--fs-label);
  margin: 0;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.08);
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-weight: 600;
  font-size: var(--fs-label);
  margin: 0;
}

.contact-form :deep(.btn) {
  align-self: flex-start;
}

@media (max-width: 720px) {
  .contact-layout {
    grid-template-columns: 1fr;
  }

  .contact-form :deep(.btn) {
    width: 100%;
  }
}
</style>
