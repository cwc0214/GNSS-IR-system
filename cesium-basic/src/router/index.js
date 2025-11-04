import { createRouter, createWebHistory } from 'vue-router'

// 引入页面组件
import Home from '@/views/Home.vue'
import Observation from '@/views/Observation.vue'
import CesiumPage from '@/views/CesiumPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/observation',
    name: 'Observation',
    component: Observation
  },
  {
    path: '/cesium',
    name: 'CesiumPage',
    component: CesiumPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
