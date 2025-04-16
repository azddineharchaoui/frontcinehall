import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/movies',
    name: 'Movies',
    component: () => import('../views/Movies.vue')
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: () => import('../views/MovieDetail.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Auth/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Auth/Register.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/User/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reservations',
    name: 'UserReservations',
    component: () => import('../views/User/Reservations.vue'),
    meta: { requiresAuth: true }
  },
  // {
  //   path: '/reservation/:id',
  //   name: 'ReservationDetail',
  //   component: () => import('../views/User/ReservationDetail.vue'),
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/payment/:reservationId',
  //   name: 'Payment',
  //   component: () => import('../views/User/Payment.vue'),
  //   meta: { requiresAuth: true }
  // },
  // // Admin routes
  // {
  //   path: '/admin',
  //   name: 'AdminDashboard',
  //   component: () => import('../views/Admin/Dashboard.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/movies',
  //   name: 'AdminMovies',
  //   component: () => import('@/views/Admin/Movies.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/movie/create',
  //   name: 'AdminCreateMovie',
  //   component: () => import('@/views/Admin/CreateMovie.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/movie/edit/:id',
  //   name: 'AdminEditMovie',
  //   component: () => import('@/views/Admin/EditMovie.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/sessions',
  //   name: 'AdminSessions',
  //   component: () => import('@/views/Admin/Sessions.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/session/create',
  //   name: 'AdminCreateSession',
  //   component: () => import('@/views/Admin/CreateSession.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/session/edit/:id',
  //   name: 'AdminEditSession',
  //   component: () => import('@/views/Admin/EditSession.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/theaters',
  //   name: 'AdminTheaters',
  //   component: () => import('@/views/Admin/Theaters.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/theater/create',
  //   name: 'AdminCreateTheater',
  //   component: () => import('@/views/Admin/CreateTheater.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/theater/edit/:id',
  //   name: 'AdminEditTheater',
  //   component: () => import('@/views/Admin/EditTheater.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/admin/users',
  //   name: 'AdminUsers',
  //   component: () => import('@/views/Admin/Users.vue'),
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const guestOnly = to.matched.some(record => record.meta.guestOnly);
  
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  const isAdmin = store.getters['auth/isAdmin'];
  
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresAdmin && !isAdmin) {
    next({ name: 'Home' });
  } else if (guestOnly && isAuthenticated) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;