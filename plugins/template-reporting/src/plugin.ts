import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef, singleReportPage } from './routes';

export const templateReportsPlugin = createPlugin({
  id: 'template-reporting',
  routes: {
    root: rootRouteRef,
  },
});

export const TemplateReportsPage = templateReportsPlugin.provide(
  createRoutableExtension({
    name: 'TemplateReportsPage',
    component: () => import('./components/MainPage').then(m => m.MainPage),
    mountPoint: rootRouteRef,
  }),
);

export const TemplateReportPage = templateReportsPlugin.provide(
  createRoutableExtension({
    name: 'TemplateReportPage',
    component: () =>
      import('./components/SingleReportComponent').then(
        m => m.SingleReportPage,
      ),
    mountPoint: singleReportPage,
  }),
);
