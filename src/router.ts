import { createRouter, createWebHistory } from 'vue-router';
import { useLoginStore, useSettingStore } from './stores';
import { CRouterView } from './components';
import { delay } from './utils';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('./views/Login.vue'),
    },
    {
      path: '/manage',
      component: CRouterView,
      children: [
        {
          path: '',
          component: () => import('./views/manage/Controller.vue'),
        },
        {
          path: 'person',
          component: CRouterView,
          children: [
            {
              path: '',
              component: () => import('./views/manage/user/Controller.vue'),
            },
            {
              path: 'list',
              component: () => import('./views/manage/user/List.vue'),
            },
            {
              path: 'insert',
              component: () => import('./views/manage/user/Insert.vue'),
            },
          ],
        },
        {
          path: 'item',
          component: CRouterView,
          children: [
            {
              path: '',
              component: () => import('./views/manage/item/Controller.vue'),
            },
            {
              path: 'list',
              component: () => import('./views/manage/item/List.vue'),
            },
            {
              path: 'insert',
              component: () => import('./views/manage/item/Insert.vue'),
            },
          ],
        },
        {
          path: 'lend-item',
          component: CRouterView,
          children: [
            {
              path: '',
              component: () => import('./views/manage/lenditem/Controller.vue'),
            },
            {
              path: 'list',
              component: () => import('./views/manage/lenditem/List.vue'),
            },
            {
              path: 'insert',
              component: () => import('./views/manage/lenditem/Insert.vue'),
            },
          ],
        },
        {
          path: 'maintenance-item',
          component: CRouterView,
          children: [
            {
              path: '',
              component: () => import('./views/manage/maintenance/Controller.vue'),
            },
            {
              path: 'list',
              component: () => import('./views/manage/maintenance/List.vue'),
            },
            {
              path: 'insert',
              component: () => import('./views/manage/maintenance/Insert.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/export',
      children: [{ path: 'lend_history', component: () => import('./views/export/lend_history_export.vue') }],
    },
  ],
});

router.beforeEach(async (to, _, next) => {
  switch (to.fullPath) {
    case '/login':
      const login = useLoginStore();
      if (login.hasData()) {
        const race = await Promise.race([login.send(), delay(2000)]);
        if (!race) break;

        await login.send();
      }
      break;

    default:
      const setting = useSettingStore();
      setting.value.router = to.fullPath;
      break;
  }

  next();
});

export default router;
