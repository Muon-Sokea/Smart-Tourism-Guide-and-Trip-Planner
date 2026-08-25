import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Explore from '../views/Explore.vue'
import DestinationDetails from '../views/DestinationDetails.vue'
import Favorites from '../views/Favorites.vue'
import TripPlanner from '../views/TripPlanner.vue'
import MapNavigation from '../views/MapNavigation.vue'
import About from '../views/About.vue'
import Service from '../views/Service.vue'
import Contact from '../views/Contact.vue'
import Profile from '../views/Profile.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/explore', name: 'explore', component: Explore },
    { path: '/destination/:id', name: 'destination-details', component: DestinationDetails },
    { path: '/favorites', name: 'favorites', component: Favorites },
    { path: '/trip-planner', name: 'trip-planner', component: TripPlanner },
    { path: '/map', name: 'map', component: MapNavigation },
    { path: '/about', name: 'about', component: About },
    { path: '/service', name: 'service', component: Service },
    { path: '/contact', name: 'contact', component: Contact },
    { path: '/profile', name: 'profile', component: Profile },
    { path: '/login', name: 'login', component: Login },
    { path: '/signup', name: 'signup', component: Signup },
  ],
})


// This project has no backend — "auth" is a mock, local-only session. Visitors
// who haven't logged in or signed up only ever see the Login/Sign Up pages.
router.beforeEach((to) => {
  const { isLoggedIn } = useAuth()
  const isAuthPage = to.path === '/login' || to.path === '/signup'

  if (!isLoggedIn.value && !isAuthPage) {
    return '/login'
  }

  if (isLoggedIn.value && isAuthPage) {
    return '/'
  }
})

export default router
