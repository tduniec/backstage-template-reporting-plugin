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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import * as inputProps from './inputProperties';
import * as outputProps from './outputProperties';
import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import * as yaml from 'yaml';
import { TemplateReport } from '../..';
import { Logger } from 'winston';
import { AuthService } from '@backstage/backend-plugin-api';
import MarkdownIt from 'markdown-it';

function _interopDefaultLegacy(e: any) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}
const yaml__default = /* #__PURE__*/ _interopDefaultLegacy(yaml);

/**
 *
 * @remarks
 *
 *
 * @public
 *
 */

const actionId = 'template:report:generate'; // here is action id used later in the file
const exampleUsage = [
  {
    description: 'Generate report for template',
    example: yaml__default.default.stringify({
      steps: [
        {
          id: 'generate-report',
          action: actionId,
          name: 'Generate report for template',
          input: {
            reportInputs: {
              hello: 'World!',
            },
            reportTemplateName: 'dummyTemplate',
          },
        },
      ],
    }),
  },
  {
    description: 'Generate report for template',
    example: yaml__default.default.stringify({
      steps: [
        {
          id: 'generate-report',
          action: actionId,
          name: 'Generate report for template',
          input: {
            reportInputs: {
              hello: 'World!',
            },
          },
        },
      ],
    }),
  },
];

export async function generateTemplateReport(
  config: Config,
  auth?: AuthService,
) {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions

  return createTemplateAction<{
    reportInputs: object;
    reportTemplateName?: string;
  }>({
    id: actionId,
    examples: exampleUsage,
    description: 'Http call retruning response',
    schema: {
      input: {
        type: 'object',
        required: ['reportInputs'],
        properties: inputProps,
      },
      output: {
        type: 'object',
        properties: outputProps,
      },
    },
    async handler(ctx) {
      const logger = ctx.logger;
      const { reportTemplateName, reportInputs } = ctx.input;
      const taskId = ctx.workspacePath.split('/').pop();

      const body: TemplateReport = {
        templateName: ctx.templateInfo?.entity?.metadata.name as string,
        templateExecutionId: taskId as string,
        templateReportTemplateName: reportTemplateName,
        createdBy: ctx.user?.ref as string,
        templateInputs: reportInputs,
      };
      logger.info(`Publishing report for template execution: ${taskId}`);
      const token =
        (await collectAuthToken(logger, auth)) ?? ctx.secrets?.backstageToken;
      try {
        const response = await fetch(
          `http://127.0.0.1:7007/api/template-reporting/report`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          },
        );
        if (response.ok) {
          console.log(response);
          let responseJson = null;
          try {
            responseJson = await response.json();
          } catch (error) {
            return;
          }
          console.log(responseJson);
          ctx.output(
            'reportUrl',
            `${config.getString('app.baseUrl')}/template-reporting/${
              responseJson.id
            }`,
          );
          const renered = new MarkdownIt().renderer.render(
            JSON.parse(responseJson.report_rendered_content as string),
            {},
            undefined,
          );
          ctx.output('content', renered);
        } else {
          ctx.logger.error(
            `problem retriving proper response: ${JSON.stringify(
              response.status,
            )}: ${response.statusText}`,
          );
        }
      } catch (error) {
        ctx.logger.error(`problem retriving proper response`);
      }
    },
  });
}

async function collectAuthToken(logger: Logger, auth?: AuthService) {
  try {
    const token =
      (await auth?.getPluginRequestToken({
        onBehalfOf: await auth?.getOwnServiceCredentials(),
        targetPluginId: 'template-reporting',
      })) ?? undefined;
    return token?.token;
  } catch (error) {
    const message = `Problem collecting token for new backend system`;
    logger.warn(message);
    return undefined;
  }
}
