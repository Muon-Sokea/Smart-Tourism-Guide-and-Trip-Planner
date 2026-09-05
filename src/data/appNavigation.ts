import type { AppNavigationGroup } from '../types/navigation'

export const appNavigation: AppNavigationGroup[] = [
  {
    label: 'Discover',
    items: [
      { label: 'Explore', to: '/explore', icon: 'compass' },
    ],
  },
  {
    label: 'Plan Your Trip',
    items: [
      { label: 'Trip Planner', to: '/trip-planner', icon: 'route' },
      { label: 'My Trips', to: '/trips', icon: 'calendar' },
    ],
  },
  {
    label: 'Travel Services',
    items: [
      { label: 'My Bookings', to: '/bookings', icon: 'bookmark' },
      { label: 'Favorites', to: '/favorites', icon: 'heart' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', to: '/settings', icon: 'edit' },
    ],
  },
]