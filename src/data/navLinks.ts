export interface NavLink {
  label: string
  to: string
}

// Public navigation is intentionally separate from application navigation.
export const navLinks: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/service' },
  { label: 'Contact', to: '/contact' },
]
