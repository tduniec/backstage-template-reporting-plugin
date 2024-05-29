import { PluginDatabaseManager } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { TrDatabase } from '../database/trDatabase';
import { TrApi } from '../api/api';
import { TemplateReportObj } from '..';

export interface RouterOptions {
  logger: Logger;
  database: PluginDatabaseManager;
  customReportTemplates?: TemplateReportObj[]
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database, customReportTemplates} = options;

  const trDatabaseInstance = TrDatabase.create(database);
  const kx = await trDatabaseInstance.get();
  await TrDatabase.runMigrations(kx);

  const apiHandler = new TrApi(logger,kx, customReportTemplates)

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/report', async (request, response) => {
    const user = request.query.user
    var obj
    if (user) {
      obj = await apiHandler.getTemplateReportsByUser(user as string)
    } else {
      obj = await apiHandler.getTemplateReports()
    }
    response.json(obj).status(200);
  });

  router.get('/report/:id', async (request, response) => {
    const reportId : string = request.params.id as string
    const obj = await apiHandler.getTemplateReportsById(reportId)
    response.json(obj).status(200);
  });

  router.get('/report/:user', async (request, response) => {
    const username : string = request.params.user as string
    const obj = await apiHandler.getTemplateReportsByUser(username)
    response.json(obj).status(200);
  });

  router.post('/report', async (request, response) => {
    const res = await apiHandler.generateReportForTask(request.body)
    response.json(res).status(201);
  });

  return router;
}

