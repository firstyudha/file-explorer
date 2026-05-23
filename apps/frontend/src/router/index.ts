import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/folder'
    },
    {
      path: '/folder/:id?',
      name: 'explorer',
      component: HomeView,
      props: true
    }
  ]
});
export default router;
