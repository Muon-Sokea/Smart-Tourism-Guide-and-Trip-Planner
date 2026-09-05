<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTripPlanner } from '../../composables/useTripPlanner'
import { destinations } from '../../data/destinations'
import DaySelector from '../../components/planner/DaySelector.vue'
import ItineraryItemRow from '../../components/planner/ItineraryItem.vue'
import TripSummary from '../../components/planner/TripSummary.vue'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'
import type { BudgetCategory } from '../../types/trip'

const {
  trip,
  destinationById,
  itemsForDay,
  addDestination,
  removeItem,
  updateItem,
  setTripInfo,
  addExpense,
  updateExpense,
  removeExpense,
  addChecklistItem,
  toggleChecklistItem,
  removeChecklistItem,
  budgetTotal,
  completedChecklist,
  summary,
} = useTripPlanner()

const activeDay = ref(1)
const isAdding = ref(false)
const addSearch = ref('')
const saveMessage = ref('')
const formError = ref('')
const tripForm = ref({
  name: trip.value.name === 'My Trip' ? '' : trip.value.name,
  destination: trip.value.destination,
  startDate: trip.value.startDate,
  endDate: trip.value.endDate,
})
const expenseForm = ref<{ category: BudgetCategory; description: string; amount: number | null }>({
  category: 'Transportation',
  description: '',
  amount: null,
})
const checklistDraft = ref('')

const activeDayItems = computed(() => itemsForDay(activeDay.value))
const addableDestinations = computed(() => {
  const query = addSearch.value.trim().toLowerCase()
  return destinations.filter(
    (destination) =>
      !query ||
      destination.name.toLowerCase().includes(query) ||
      destination.country.toLowerCase().includes(query)
  )
})
const checklistProgress = computed(() =>
  trip.value.checklist.length ? `${completedChecklist.value} / ${trip.value.checklist.length}` : '0 / 0'
)

function saveTrip() {
  if (!tripForm.value.name.trim() || !tripForm.value.destination || !tripForm.value.startDate || !tripForm.value.endDate) {
    formError.value = 'Add a trip name, destination, and both dates before saving.'
    return
  }
  if (tripForm.value.startDate > tripForm.value.endDate) {
    formError.value = 'The end date must be on or after the start date.'
    return
  }
  formError.value = ''
  setTripInfo({ ...tripForm.value, name: tripForm.value.name.trim() })
  saveMessage.value = 'Trip saved locally.'
  window.setTimeout(() => (saveMessage.value = ''), 2500)
}

function addBudgetExpense() {
  if (!expenseForm.value.description.trim() || !expenseForm.value.amount || expenseForm.value.amount <= 0) return
  addExpense(expenseForm.value.category, expenseForm.value.description.trim(), expenseForm.value.amount)
  expenseForm.value = { category: 'Transportation', description: '', amount: null }
}

function addChecklist() {
  if (!checklistDraft.value.trim()) return
  addChecklistItem(checklistDraft.value.trim())
  checklistDraft.value = ''
}
</script>

<template>
  <div class="trip-planner">
    <div class="container">
      <header class="planner-header">
        <div>
          <p class="eyebrow">Plan your journey</p>
          <h1>Trip Planner</h1>
          <p class="planner-intro">Shape an idea into an itinerary, budget, and checklist you can take with you.</p>
        </div>
        <div class="save-area">
          <span v-if="saveMessage" class="save-message">{{ saveMessage }}</span>
          <Button variant="accent" @click="saveTrip"><Icon name="check" :size="16" /> Save Trip</Button>
        </div>
      </header>

      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

      <section class="planner-section trip-info-section">
        <div class="section-heading"><p class="eyebrow">Step 1</p><h2>Create your trip</h2></div>
        <form class="trip-form" @submit.prevent="saveTrip">
          <label><span>Trip name</span><input v-model="tripForm.name" type="text" placeholder="My Siem Reap Adventure" /></label>
          <label><span>Destination</span><select v-model="tripForm.destination"><option value="" disabled>Select a destination</option><option v-for="destination in destinations" :key="destination.id" :value="`${destination.name}, ${destination.country}`">{{ destination.name }}, {{ destination.country }}</option></select></label>
          <label><span>Start date</span><input v-model="tripForm.startDate" type="date" /></label>
          <label><span>End date</span><input v-model="tripForm.endDate" type="date" :min="tripForm.startDate" /></label>
          <Button variant="primary" type="submit">Create / Update Trip</Button>
        </form>
      </section>

      <div class="planner-layout">
        <main class="planner-main">
          <section class="planner-section">
            <div class="section-heading section-heading-row"><div><p class="eyebrow">Step 2</p><h2>Itinerary</h2></div><span class="section-count">{{ trip.items.length }} activities</span></div>
            <DaySelector v-model="activeDay" :total-days="trip.days" />
            <div class="itinerary">
              <ItineraryItemRow v-for="(item, index) in activeDayItems" :key="item.id" :item="item" :destination="destinationById.get(item.destinationId)" :is-last="index === activeDayItems.length - 1" @remove="removeItem" @update="(changes) => updateItem(item.id, changes)" />
              <p v-if="!activeDayItems.length" class="empty-day">No plans on Day {{ activeDay }} yet. Add a place below.</p>
            </div>
            <Button variant="accent" @click="isAdding = !isAdding"><Icon name="plus" :size="16" /> Add Place or Activity</Button>
            <div v-if="isAdding" class="add-panel">
              <input v-model="addSearch" class="add-search" type="search" placeholder="Search destinations..." />
              <ul class="add-list"><li v-for="destination in addableDestinations" :key="destination.id"><span><strong>{{ destination.name }}</strong><em>{{ destination.country }} · {{ destination.category }}</em></span><button type="button" @click="addDestination(destination.id, activeDay); isAdding = false"><Icon name="plus" :size="14" /> Add</button></li></ul>
            </div>
          </section>

          <section class="planner-section">
            <div class="section-heading section-heading-row"><div><p class="eyebrow">Step 3</p><h2>Budget</h2></div><strong class="total-amount">${{ budgetTotal.toFixed(0) }}</strong></div>
            <form class="expense-form" @submit.prevent="addBudgetExpense"><select v-model="expenseForm.category" aria-label="Expense category"><option>Transportation</option><option>Accommodation</option><option>Food</option><option>Activities</option><option>Other</option></select><input v-model="expenseForm.description" type="text" placeholder="Expense description" aria-label="Expense description" /><input v-model.number="expenseForm.amount" type="number" min="0.01" step="0.01" placeholder="Amount" aria-label="Expense amount" /><button type="submit" class="icon-action" aria-label="Add expense"><Icon name="plus" :size="17" /></button></form>
            <div v-if="trip.budget.length" class="expense-list"><div v-for="expense in trip.budget" :key="expense.id" class="expense-row"><select :value="expense.category" @change="updateExpense(expense.id, { category: ($event.target as HTMLSelectElement).value as BudgetCategory })"><option>Transportation</option><option>Accommodation</option><option>Food</option><option>Activities</option><option>Other</option></select><input :value="expense.description" aria-label="Edit expense description" @change="updateExpense(expense.id, { description: ($event.target as HTMLInputElement).value })" /><input :value="expense.amount" type="number" min="0" step="0.01" aria-label="Edit expense amount" @change="updateExpense(expense.id, { amount: Number(($event.target as HTMLInputElement).value) || 0 })" /><button type="button" class="icon-action muted" aria-label="Delete expense" @click="removeExpense(expense.id)"><Icon name="trash" :size="16" /></button></div></div>
            <p v-else class="empty-inline">Add estimated expenses to track your trip total.</p>
          </section>

          <section class="planner-section">
            <div class="section-heading section-heading-row"><div><p class="eyebrow">Step 4</p><h2>Checklist</h2></div><span class="section-count">{{ checklistProgress }} complete</span></div>
            <form class="checklist-form" @submit.prevent="addChecklist"><input v-model="checklistDraft" type="text" placeholder="Add a checklist item" /><button type="submit" class="icon-action" aria-label="Add checklist item"><Icon name="plus" :size="17" /></button></form>
            <ul class="checklist"><li v-for="item in trip.checklist" :key="item.id" :class="{ completed: item.completed }"><button type="button" class="check-toggle" :aria-label="item.completed ? 'Mark incomplete' : 'Mark complete'" @click="toggleChecklistItem(item.id)"><Icon :name="item.completed ? 'check' : 'plus'" :size="14" /></button><span>{{ item.label }}</span><button type="button" class="icon-action muted" aria-label="Remove checklist item" @click="removeChecklistItem(item.id)"><Icon name="trash" :size="15" /></button></li></ul>
          </section>
        </main>

        <aside class="planner-sidebar"><TripSummary :summary="summary" /><section class="summary-card"><p class="eyebrow">Your trip</p><h2>{{ trip.name }}</h2><p>{{ trip.destination || 'Choose a destination above' }}</p><div class="summary-stats"><span><strong>{{ trip.days }}</strong> days</span><span><strong>{{ trip.items.length }}</strong> activities</span><span><strong>${{ budgetTotal.toFixed(0) }}</strong> budget</span><span><strong>{{ checklistProgress }}</strong> checklist</span></div></section><Button to="/map" variant="outline"><Icon name="route" :size="16" /> View Route</Button></aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trip-planner { padding: 2.25rem 0 3.25rem; }
.planner-header, .section-heading-row { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.planner-header { margin-bottom: 1.75rem; }
.planner-header h1, .planner-section h2, .summary-card h2 { color: var(--color-primary); margin: 0; }
.planner-intro { max-width: 620px; margin-top: 0.4rem; color: var(--color-muted); }
.eyebrow { margin: 0 0 0.3rem; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.save-area { display: flex; align-items: center; gap: 0.75rem; }
.save-message { color: var(--color-primary); font-size: var(--fs-small); }
.form-error { margin: 0 0 1rem; padding: 0.7rem 0.9rem; border-radius: 8px; background: rgba(var(--color-accent-rgb), 0.12); color: var(--color-primary); font-size: var(--fs-card-desc); }
.planner-section, .summary-card { background: var(--color-white); border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.25rem; }
.trip-info-section { margin-bottom: 1.5rem; }
.trip-form { display: grid; grid-template-columns: 1.3fr 1.3fr 1fr 1fr auto; gap: 0.75rem; align-items: end; margin-top: 1rem; }
.trip-form label, .checklist-form { display: flex; flex-direction: column; gap: 0.35rem; }
.trip-form label span { color: var(--color-primary); font-size: var(--fs-label); font-weight: 600; }
input, select { min-width: 0; border: 1px solid rgba(var(--color-primary-rgb), 0.2); border-radius: 8px; background: var(--color-white); color: var(--color-text); padding: 0.58rem 0.65rem; font: inherit; font-size: var(--fs-card-desc); }
.planner-layout { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(260px, 0.75fr); gap: 1.25rem; align-items: start; }
.planner-main { display: grid; gap: 1.25rem; min-width: 0; }
.planner-sidebar { display: grid; gap: 1rem; position: sticky; top: calc(var(--navbar-height) + 1rem); }
.section-heading { margin-bottom: 1rem; }
.section-count { color: var(--color-muted); font-size: var(--fs-small); white-space: nowrap; }
.itinerary { margin: 1rem 0; }
.empty-day, .empty-inline { margin: 1rem 0 0; color: var(--color-muted); font-size: var(--fs-card-desc); }
.add-panel { margin-top: 1rem; padding: 0.9rem; border-radius: 8px; background: rgba(var(--color-primary-rgb), 0.04); }
.add-search { width: 100%; margin-bottom: 0.75rem; }
.add-list, .checklist { display: grid; gap: 0.45rem; margin: 0; padding: 0; list-style: none; }
.add-list { max-height: 240px; overflow-y: auto; }
.add-list li, .expense-row, .checklist li { display: flex; align-items: center; gap: 0.55rem; min-width: 0; }
.add-list li { justify-content: space-between; padding: 0.5rem 0.6rem; border-radius: 7px; background: var(--color-white); }
.add-list span { display: grid; gap: 0.1rem; min-width: 0; }
.add-list em { color: var(--color-muted); font-size: var(--fs-small); font-style: normal; }
.add-list button { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.35rem 0.6rem; border: 0; border-radius: 999px; background: var(--color-primary); color: var(--color-white); font-size: var(--fs-small); cursor: pointer; }
.expense-form { display: grid; grid-template-columns: 1fr 1.4fr 0.7fr auto; gap: 0.55rem; margin-bottom: 0.75rem; }
.expense-row { display: grid; grid-template-columns: 1fr 1.4fr 0.7fr auto; gap: 0.55rem; }
.icon-action, .check-toggle { display: inline-grid; place-items: center; flex: 0 0 auto; border: 0; cursor: pointer; }
.icon-action { width: 32px; height: 32px; border-radius: 8px; background: var(--color-primary); color: var(--color-white); }
.icon-action.muted { background: transparent; color: var(--color-muted); }
.total-amount { color: var(--color-primary); font-size: var(--fs-section-title); }
.checklist-form { display: grid; grid-template-columns: 1fr auto; gap: 0.55rem; margin-bottom: 0.75rem; }
.checklist li { padding: 0.35rem 0; color: var(--color-text); font-size: var(--fs-card-desc); }
.checklist li span { flex: 1; }
.checklist li.completed span { color: var(--color-muted); text-decoration: line-through; }
.check-toggle { width: 24px; height: 24px; border: 1px solid rgba(var(--color-primary-rgb), 0.28); border-radius: 6px; background: transparent; color: var(--color-primary); }
.checklist li.completed .check-toggle { border-color: var(--color-primary); background: var(--color-primary); color: var(--color-white); }
.summary-card h2 { font-size: var(--fs-section-title); }
.summary-card > p:not(.eyebrow) { margin-top: 0.3rem; color: var(--color-muted); font-size: var(--fs-card-desc); }
.summary-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(var(--color-primary-rgb), 0.12); color: var(--color-muted); font-size: var(--fs-small); }
.summary-stats strong { display: block; color: var(--color-primary); font-size: var(--fs-card-title); }
@media (max-width: 1000px) { .trip-form { grid-template-columns: repeat(2, minmax(0, 1fr)); } .trip-form :deep(.btn) { grid-column: 1 / -1; justify-self: start; } }
@media (max-width: 820px) { .planner-layout { grid-template-columns: 1fr; } .planner-sidebar { position: static; } }
@media (max-width: 600px) { .planner-header, .section-heading-row { align-items: flex-start; flex-direction: column; } .save-area, .save-area :deep(.btn) { width: 100%; } .trip-form, .expense-form, .expense-row { grid-template-columns: 1fr; } .expense-row { align-items: stretch; } .expense-row .icon-action { justify-self: end; } }
</style>
