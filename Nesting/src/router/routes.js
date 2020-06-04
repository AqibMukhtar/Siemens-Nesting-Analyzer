
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'SearchIndex',
        path: '/',
        component: () => import('pages/SearchIndex.vue')
      },
      {
        name: 'UploadIndex',
        path: '/Upload',
        component: () => import('pages/UploadIndex.vue')
      },
      {
        name: 'SearchTable',
        path: '/SearchTable',
        component: () => import('layouts/SearchLayout')
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
