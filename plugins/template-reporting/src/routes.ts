import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'template-reporting',
});

export const singleReportPage = createRouteRef({
  id: 'single-report',
});
