import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: () => import('@/views/login/login')
    },
    {
      path: '/main',
      name: 'Main',
      component: () => import('@/views/main/index')
    },
    // {
    //   path: '/',
    //   name: 'HelloWorld',
    //   component: () => import('@/components/HelloWorld')
    // },
  ]
})
