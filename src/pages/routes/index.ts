import { createRouter, createWebHashHistory } from 'vue-router'
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
import Notifications from '../app/Notifications.vue'
import Settings from '../app/Settings.vue'
import ServiceDetails from '../app/ServiceDetails.vue'
import Booking from '../app/Booking.vue'
import MyTrips from '../app/MyTrips.vue'
import MyBookings from '../app/MyBookings.vue'
import { useAuth } from '../../composables/useAuth'
import { recordNavigation, setNavHistoryRouter } from '../../composables/useNavHistory'

/* Hash history is the deployment-correct choice for this project: vite is
   built with base './' and deployed as static files (gh-pages), where HTML5
   history mode 404s on every refresh/deep link (no server rewrites) and
   relative assets break from nested paths. Hash URLs (#/explore) work on any
   static host and in dev; the route paths themselves are unchanged. */
const router = createRouter({
  history: createWebHashHistory(),
  /* Every navigation starts at the top like a real page change — otherwise a
     long detail page hands its scroll offset to the next page, which reads as
     "the button did nothing". Back/forward keeps the browser's saved position. */
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0, left: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/home', name: 'home-alias', redirect: '/' },
    { path: '/about', name: 'about', component: About },
    { path: '/services', name: 'services', component: Services },
    { path: '/service', name: 'service', redirect: '/services' },
    { path: '/contact', name: 'contact', component: Contact },
    { path: '/login', name: 'login', component: Login, meta: { shell: 'auth' } },
    { path: '/signup', name: 'signup', component: Signup, meta: { shell: 'auth' } },
    { path: '/dashboard', name: 'dashboard', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Dashboard' } },
    { path: '/explore', name: 'explore', component: Explore, meta: { shell: 'app' } },
    { path: '/destinations', name: 'destinations', component: Explore, meta: { shell: 'app' } },
    { path: '/explore/:id', name: 'destination-details', component: DestinationDetails, meta: { shell: 'app' } },
    { path: '/destination/:id', name: 'legacy-destination-details', redirect: (to) => `/explore/${to.params.id}` },
    { path: '/services/:type/:id', name: 'service-details', component: ServiceDetails, meta: { shell: 'app' } },
    { path: '/service/:type/:id', name: 'legacy-service-details', redirect: (to) => `/services/${to.params.type}/${to.params.id}` },
    { path: '/book/:type/:id', name: 'booking', component: Booking, meta: { shell: 'app' } },
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
    { path: '/trips', name: 'trips', component: MyTrips, meta: { shell: 'app' } },
    { path: '/bookings', name: 'bookings', component: MyBookings, meta: { shell: 'app' } },
    { path: '/favorites', name: 'favorites', component: Favorites, meta: { shell: 'app' } },
    { path: '/notifications', name: 'notifications', component: Notifications, meta: { shell: 'app' } },
    { path: '/map', name: 'map', component: MapNavigation, meta: { shell: 'app' } },
    { path: '/profile', name: 'profile', component: Profile, meta: { shell: 'app' } },
    { path: '/settings', name: 'settings', component: Settings, meta: { shell: 'app' } },
    // Anything unknown (typo, stale bookmark, removed page) lands on the
    // same "coming soon" placeholder instead of a blank app shell.
    { path: '/:pathMatch(.*)*', name: 'not-found', component: FeaturePlaceholder, meta: { shell: 'app', title: 'Page Not Found' } },
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

// Record the visit trail so in-page Back buttons can step back through each
// page the user actually went through. recordNavigation reconciles entries by
// vue-router's history position, so browser back/forward, redirects, and
// query changes all keep the trail in sync without duplicate entries.
router.afterEach((to) => {
  recordNavigation(to.fullPath)
})

setNavHistoryRouter(router)

export default router
