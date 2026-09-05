import { createRouter, createWebHistory } from 'vue-router'
import Home from '../public/Home.vue'
import Explore from '../app/Explore.vue'
import DestinationDetails from '../app/DestinationDetails.vue'
import Favorites from '../app/Favorites.vue'
import TripPlanner from '../app/TripPlanner.vue'
import MapNavigation from '../app/MapNavigation.vue'
import About from '../public/About.vue'
import Services from '../public/Services.vue'
import Contact from '../public/Contact.vue'
import Profile from '../app/Profile.vue'
import Login from '../auth/Login.vue'
import Signup from '../auth/Signup.vue'
import FeaturePlaceholder from '../app/FeaturePlaceholder.vue'
import { useAuth } from '../../composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/home', name: 'home-alias', redirect: '/' },
    { path: '/about', name: 'about', component: About },
    { path: '/service', name: 'service', component: Services },
    { path: '/services', name: 'services', redirect: '/service' },
    { path: '/contact', name: 'contact', component: Contact },
    { path: '/login', name: 'login', component: Login, meta: { shell: 'auth' } },
    { path: '/signup', name: 'signup', component: Signup, meta: { shell: 'auth' } },
    { path: '/dashboard', name: 'dashboard', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Dashboard' } },
    { path: '/explore', name: 'explore', component: Explore, meta: { shell: 'app' } },
    { path: '/destinations', name: 'destinations', component: Explore, meta: { shell: 'app' } },
    { path: '/explore/:id', name: 'destination-details', component: DestinationDetails, meta: { shell: 'app' } },
    { path: '/destination/:id', name: 'legacy-destination-details', redirect: (to) => `/explore/${to.params.id}` },
    { path: '/hotels', name: 'hotels', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Hotels' } },
    { path: '/restaurants', name: 'restaurants', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Restaurants' } },
    { path: '/activities', name: 'activities', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Activities' } },
    { path: '/trip-planner', name: 'trip-planner', component: TripPlanner, meta: { shell: 'app' } },
    { path: '/itineraries', name: 'itineraries', component: FeaturePlaceholder, meta: { shell: 'app', title: 'My Itineraries' } },
    { path: '/budget', name: 'budget', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Trip Budget' } },
    { path: '/booking/flights', name: 'booking-flights', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Flights' } },
    { path: '/booking/hotels', name: 'booking-hotels', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Hotel Booking' } },
    { path: '/booking/activities', name: 'booking-activities', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Activity Booking' } },
    { path: '/booking/transportation', name: 'booking-transportation', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Transportation' } },
    { path: '/trips', name: 'trips', component: FeaturePlaceholder, meta: { shell: 'app', title: 'My Trips' } },
    { path: '/bookings', name: 'bookings', component: FeaturePlaceholder, meta: { shell: 'app', title: 'My Bookings' } },
    { path: '/favorites', name: 'favorites', component: Favorites, meta: { shell: 'app' } },
    { path: '/notifications', name: 'notifications', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Notifications' } },
    { path: '/map', name: 'map', component: MapNavigation, meta: { shell: 'app' } },
    { path: '/profile', name: 'profile', component: Profile, meta: { shell: 'app' } },
    { path: '/settings', name: 'settings', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Settings' } },
  ],
})


// This project has no backend — "auth" is a mock, local-only session. Visitors
// who haven't logged in or signed up only ever see the Login/Sign Up pages.
router.beforeEach((to) => {
  const { isLoggedIn } = useAuth()
  const isAuthPage = to.meta.shell === 'auth'

  if (!isLoggedIn.value && !isAuthPage) {
    return '/login'
  }

  if (isLoggedIn.value && isAuthPage) {
    return '/'
  }
})

export default router
