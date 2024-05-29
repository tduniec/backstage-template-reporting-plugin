import { Logger } from 'winston';
import { PluginDatabaseManager } from '@backstage/backend-common';
import { Router } from 'express';
import { TrApi } from '../api/api';
import { TrDatabase } from '../database/trDatabase';
import { setupCommonRoutes } from './commonRouter';
import { TemplateReportObj } from '..';

interface PluginDependencies {
  router: Router;
  logger: Logger;
  database: PluginDatabaseManager;
  customReportTemplates?: TemplateReportObj[];
}

export class PluginInitializer {
  private logger!: Logger;
  private database!: PluginDatabaseManager;
  private apiHandler!: TrApi;
  private router!: Router;
  private customReportTemplates: TemplateReportObj[];

  private constructor(
    router: Router,
    logger: Logger,
    database: PluginDatabaseManager,
    customReportTemplates: TemplateReportObj[] = [],
  ) {
    this.router = router;
    this.logger = logger;
    this.database = database;
    this.customReportTemplates = customReportTemplates;
  }

  static async builder(
    router: Router,
    logger: Logger,
    database: PluginDatabaseManager,
    customReportTemplates: TemplateReportObj[] = [],
  ): Promise<PluginInitializer> {
    const instance = new PluginInitializer(
      router,
      logger,
      database,
      customReportTemplates,
    );
    await instance.initialize();
    return instance;
  }

  private async initialize() {
    // Initialize logger, database
    this.logger = this.dependencies.logger;
    this.database = this.dependencies.database;

    // Initialize TrDatabase and run migrations
    const trDatabaseInstance = TrDatabase.create(this.database);
    const kx = await trDatabaseInstance.get();
    await TrDatabase.runMigrations(kx);

    this.apiHandler = new TrApi(this.logger, kx, this.customReportTemplates);

    // registering routes
    this.router = setupCommonRoutes(this.router, this.logger, this.trApi);
  }

  private get dependencies(): PluginDependencies {
    if (!this.router || !this.logger || !this.database) {
      throw new Error('PluginInitializer not properly initialized');
    }
    return {
      router: this.router,
      logger: this.logger,
      database: this.database,
    };
  }

  get trApi(): TrApi {
    return this.apiHandler;
  }

  get templateReportingRouter(): Router {
    return this.router;
  }
}
