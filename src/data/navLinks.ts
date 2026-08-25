export interface NavLink {
  label: string
  to: string
}

// Single source of truth for site-wide navigation — used by the top navbar,
// its mobile drawer, and the footer, so they can never drift out of sync.
export const navLinks: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'Trip Planner', to: '/trip-planner' },
  { label: 'About Us', to: '/about' },
  { label: 'Service', to: '/service' },
  { label: 'Contact', to: '/contact' },
]
