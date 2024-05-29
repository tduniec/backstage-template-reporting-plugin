import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { templateReportsPlugin, TemplateReportsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(templateReportsPlugin)
  .addPage({
    element: <TemplateReportsPage />,
    title: 'Root Page',
    path: '/template-reporting',
  })
  .render();
