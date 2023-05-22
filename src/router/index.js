import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: "is-active",
  linkExactActiveClass: "is-active",
  routes: [
    {
      path: '/',
      redirect: '/jp'
    },
    {
      path: '/jp',
      name: 'story-jp',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HomeJPView.vue')
    },
    {
      path: '/en',
      name: 'story',
      component: HomeView
    },
  ]
})

export default router
