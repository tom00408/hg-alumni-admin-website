import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../pages/Dashboard.vue'),
      meta: {
        title: 'Dashboard'
      }
    },
    {
      path: '/termine',
      name: 'termine',
      component: () => import('../pages/Termine.vue'),
      meta: {
        title: 'Termine'
      }
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('../pages/News.vue'),
      meta: {
        title: 'Neues im Verein'
      }
    },
    {
      path: '/galerie',
      name: 'galerie',
      component: () => import('../pages/Galerie.vue'),
      meta: {
        title: 'Galerie'
      }
    },
    {
      path: '/mitgliedsantraege',
      name: 'mitgliedsantraege',
      component: () => import('../pages/Mitgliedsantraege.vue'),
      meta: {
        title: 'Mitgliedsanträge'
      }
    },
    {
      path: '/mitglieder',
      name: 'mitglieder',
      component: () => import('../pages/Mitglieder.vue'),
      meta: {
        title: 'Mitglieder'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFound.vue'),
      meta: {
        title: 'Seite nicht gefunden'
      }
    }
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Meta-Title setzen
router.beforeEach((to) => {
  const baseTitle = 'Admin'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
})

export default router
