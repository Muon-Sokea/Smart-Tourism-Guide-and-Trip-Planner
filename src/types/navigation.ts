export type AppNavigationSection = 'Discover' | 'Plan Your Trip' | 'Travel Services' | 'Account'

export interface AppNavigationItem {
  label: string
  to: string
  icon: string
}

export interface AppNavigationGroup {
  label: AppNavigationSection
  items: AppNavigationItem[]
}