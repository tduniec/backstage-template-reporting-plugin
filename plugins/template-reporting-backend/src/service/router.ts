/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  PluginDatabaseManager,
  errorHandler,
  loggerToWinstonLogger,
} from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { TemplateReportObj } from '..';
import { PluginInitializer } from './pluginInitializer';
import {
  coreServices,
  createBackendPlugin,
  createExtensionPoint,
} from '@backstage/backend-plugin-api';

export interface RouterOptions {
  logger: Logger;
  database: PluginDatabaseManager;
  customReportTemplates?: TemplateReportObj[];
}

function registerRouter() {
  const router = Router();
  router.use(express.json());
  return router;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database, customReportTemplates } = options;
  const baseRouter = registerRouter();
  const plugin = await PluginInitializer.builder(
    baseRouter,
    logger,
    database,
    customReportTemplates,
  );
  const router = plugin.templateReportingRouter;
  router.use(errorHandler());
  return router;
}

export interface TemplateReportingReportsExtensionPoint {
  addReports(...templateReports: TemplateReportObj[]): void;
}

export const templateReportinReportsExtensionPoint =
  createExtensionPoint<TemplateReportingReportsExtensionPoint>({
    id: 'templateReporting.reportTemplates',
  });

export const templateReportingPlugin = createBackendPlugin({
  pluginId: 'template-reporting',
  register(env) {
    const addedReportTemplates = new Array<TemplateReportObj>();
    env.registerExtensionPoint(templateReportinReportsExtensionPoint, {
      addReports(...newTemplateReports: TemplateReportObj[]) {
        addedReportTemplates.push(...newTemplateReports);
      },
    });

    env.registerInit({
      deps: {
        logger: coreServices.logger,
        database: coreServices.database,
        http: coreServices.httpRouter,
      },
      async init({ logger, database, http }) {
        const baseRouter = registerRouter();
        const winstonLogger = loggerToWinstonLogger(logger);
        const customTemplateReports = [...addedReportTemplates];
        const plugin = await PluginInitializer.builder(
          baseRouter,
          winstonLogger,
          database,
          customTemplateReports,
        );
        const router = plugin.templateReportingRouter;
        http.use(router);
      },
    });
  },
});
