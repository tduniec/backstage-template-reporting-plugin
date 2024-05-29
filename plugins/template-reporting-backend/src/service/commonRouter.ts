import express from 'express';
import { Logger } from 'winston';
import { TrApi } from '../api/api';

export function setupCommonRoutes(
  router: express.Router,
  logger: Logger,
  apiHandler: TrApi,
) {
  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/report', async (request, response) => {
    const user = request.query.user;
    let obj;
    if (user) {
      obj = await apiHandler.getTemplateReportsByUser(user as string);
    } else {
      obj = await apiHandler.getTemplateReports();
    }
    response.json(obj).status(200);
  });

  router.get('/report/:id', async (request, response) => {
    const reportId: string = request.params.id as string;
    const obj = await apiHandler.getTemplateReportsById(reportId);
    response.json(obj).status(200);
  });

  router.get('/report/:user', async (request, response) => {
    const username: string = request.params.user as string;
    const obj = await apiHandler.getTemplateReportsByUser(username);
    response.json(obj).status(200);
  });

  router.post('/report', async (request, response) => {
    const res = await apiHandler.generateReportForTask(request.body);
    response.json(res).status(201);
  });

  return router;
}
