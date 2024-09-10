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
import { Logger } from 'winston';
import { Knex } from 'knex';
import { DatabaseOperations } from '../database/databaseOperations';
import nunjucks from 'nunjucks';
import { defaultTemplate } from '../reportTemplates/reportTemplates';
import MarkdownIt from 'markdown-it';
import { TemplateReport, TemplateReportObj } from '..';

export class TrApi {
  constructor(
    private readonly logger: Logger,
    knex: Knex,
    private readonly customReportTemplates: TemplateReportObj[] = [],
  ) {
    this.db = new DatabaseOperations(knex, logger);
  }
  private readonly db: DatabaseOperations;
  private readonly trTableName = 'tr_template_reports';

  // TODO:
  // prepare custom action to collect yaml as input

  public async getTemplateReportsById(id: string) {
    this.logger.debug(`Collecting Template Report object for id: ${id}`);
    const obj = (await this.db.select(this.trTableName, '*', { id: id }))[0];
    return obj;
  }

  public async getTemplateReportsByUser(user: string) {
    this.logger.debug(`Collecting Template Report object for user: ${user}`);
    const obj = await this.db.select(this.trTableName, '*', {
      created_by: user,
    });
    return obj;
  }

  public async getTemplateReports() {
    this.logger.debug(`Collecting Template Report - all`);
    const obj = await this.db.selectAll(this.trTableName, '*');
    return obj;
  }

  public async generateReportForTask(
    templateReportBody: TemplateReport,
    dryRun: boolean = false,
  ) {
    this.logger.info(
      `Generating report for templateTask: ${templateReportBody.templateExecutionId}`,
    );

    templateReportBody.templateInputs.templateExecutionId =
      templateReportBody.templateExecutionId;
    templateReportBody.templateInputs.templateName =
      templateReportBody.templateName;
    this.renderDefaultValues(templateReportBody.templateInputs);

    const templateReportToRender = await this.selectTemplateToRender(
      this.customReportTemplates,
      templateReportBody.templateReportTemplateName,
    );

    const redneredTemplate = nunjucks.renderString(
      templateReportToRender.content,
      templateReportBody.templateInputs,
    );
    this.logger.info(redneredTemplate);
    const markdowned = JSON.stringify(
      new MarkdownIt().parse(redneredTemplate, undefined),
    );
    this.logger.info(redneredTemplate);

    if (dryRun) {
      this.logger.info('Using dry-run mode here:');
      return { id: undefined, report_rendered_content: markdowned };
    }

    return (
      await this.db.insert(this.trTableName, {
        template_task_id: templateReportBody.templateExecutionId,
        template_name: templateReportBody.templateName,
        template_report_template_name: templateReportToRender.name,
        template_report_input_body: templateReportBody.templateInputs,
        report_rendered_content: markdowned,
        created_by: templateReportBody.createdBy,
      })
    )[0];
  }

  private renderDefaultValues(templateValuesObject: any) {
    const getCurrentUTCTime = (): string => {
      const now = new Date();
      return now.toDateString();
    };

    templateValuesObject.time = getCurrentUTCTime();
  }

  private async selectTemplateToRender(
    objects: TemplateReportObj[],
    name: string | undefined,
  ): Promise<TemplateReportObj> {
    const foundObject = objects.find(obj => obj.name === name);
    if (foundObject) {
      return foundObject;
    }
    return defaultTemplate;
  }
}
