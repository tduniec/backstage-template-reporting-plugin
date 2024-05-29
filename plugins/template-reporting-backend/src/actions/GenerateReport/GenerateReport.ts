import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import * as inputProps from './inputProperties';
import * as outputProps from './outputProperties';
import fetch from 'node-fetch';
import { Config } from '@backstage/config';
import * as yaml from 'yaml';
function _interopDefaultLegacy(e: any) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}
var yaml__default = /*#__PURE__*/ _interopDefaultLegacy(yaml);

/**
 *
 * @remarks
 *
 *
 * @public
 *
 */

const actionId = 'template:report:generate'; //here is action id used later in the file
const exampleUsage = [
  {
    description: 'Generate report for template',
    example: yaml__default['default'].stringify({
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
    example: yaml__default['default'].stringify({
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

export function generateTemplateReport(config: Config) {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions

  return createTemplateAction<{
    reportInputs: any;
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

      const body: any = {
        templateName: ctx.templateInfo?.entity?.metadata.name,
        templateExecutionId: taskId,
        templateReportTemplateName: reportTemplateName,
        createdBy: ctx.user?.ref,
        templateInputs: reportInputs,
      };
      logger.info(`Publishing report for template execution: ${taskId}`);

      try {
        const response = await fetch(
          `http://127.0.0.1:7007/api/template-reporting/report`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ctx.secrets?.backstageToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          },
        );
        if (response.ok) {
          console.log(response);
          var responseJson = null;
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
