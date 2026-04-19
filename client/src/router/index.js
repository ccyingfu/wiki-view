import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: '仪表盘' }
  },
  {
    path: '/explore',
    name: 'explore',
    component: () => import('../views/ExplorerView.vue'),
    meta: { title: '目录浏览' }
  },
  {
    path: '/page',
    name: 'page',
    component: () => import('../views/PageView.vue'),
    meta: { title: '页面详情' }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/ingest',
    name: 'ingest',
    component: () => import('../views/IngestView.vue'),
    meta: { title: '导入资料' }
  },
  {
    path: '/lint',
    name: 'lint',
    component: () => import('../views/LintView.vue'),
    meta: { title: 'Lint 检查' }
  },
  {
    path: '/log',
    name: 'log',
    component: () => import('../views/LogView.vue'),
    meta: { title: '操作日志' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || 'Wiki-View'} - Wiki-View`
})

export default router
