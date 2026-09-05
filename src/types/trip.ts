export interface ItineraryItem {
  id: string
  destinationId: number
  day: number
  time: string
  durationLabel: string
}

export type BudgetCategory = 'Transportation' | 'Accommodation' | 'Food' | 'Activities' | 'Other'

export interface BudgetExpense {
  id: string
  category: BudgetCategory
  description: string
  amount: number
}

export interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  days: number
  items: ItineraryItem[]
  budget: BudgetExpense[]
  checklist: ChecklistItem[]
}
