import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/views/Index'
import User from '@/views/User'
import Manager from '@/views/Manager'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/user',
      name: 'User',
      component: User
    },
    {
      path: '/manager',
      name: 'Manager',
      component: Manager
    }
  ]
})
