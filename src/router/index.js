import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import MoviesPage from '../views/MoviesPage.vue'
import MovieDetailPage from '../views/MovieDetailPage.vue'
import BookingPage from '../views/BookingPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/films',
    name: 'Movies',
    component: MoviesPage
  },
  {
    path: '/films/:id',
    name: 'MovieDetail',
    component: MovieDetailPage,
    props: true
  },
  {
    path: '/reservation/:id',
    name: 'Booking',
    component: BookingPage,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/profil',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/connexion',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/inscription',
    name: 'Register',
    component: RegisterPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router