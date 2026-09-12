/** What kind of place an itinerary item points at. */
export type PlaceKind = 'destination' | 'hotel' | 'restaurant' | 'activity'

export interface ItineraryItem {
  id: string
  destinationId: number
  day: number
  time: string
  durationLabel: string
  /** Legacy trips (and default-added stops) are destinations; omitted for brevity. */
  kind?: PlaceKind
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
