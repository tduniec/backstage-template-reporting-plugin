# Template Reporting - backend

The Backstage Template-Reporting Plugin is designed to generate reports from template executions within Backstage. It offers high customization, allowing any template to be used with the Nunjucks templating engine. The plugin renders the final reports in a visually appealing format using Markdown, making it versatile for various reporting needs. This part of plugin is `backend` part.

## Dependencies

- [template-reporting](https://github.com/tduniec/backstage-template-reporting-plugin/tree/main/plugins/template-reporting)

## Code

https://github.com/tduniec/backstage-template-reporting-plugin.git

## Installation

1. Install the plugin package in your Backstage app:

```sh
# From your Backstage root directory
yarn add --cwd packages/backend @tduniec/backstage-plugin-template-reporting-backend
```

2. Wire up the API implementation to your App in `templateReporting.ts` file in `packages/backend/src/plugins/`:

```ts
import { createRouter } from '@tduniec/backstage-plugin-template-reporting-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    database: env.database,
  });
}
```

in `packages/backend/src/index.ts`

```ts

import templateReporting from './plugins/templateReporting';

...

const templateReportingEnv = useHotMemoize(module, () => createEnv('template-reporting'));

...

apiRouter.use('/template-reporting', await templateReporting(templateReportingEnv)); // you should use authMiddleware if you are using it for backend

```

3. Install [template-reporting](../template-reporting/README.md) part if not installed already

## Adding Custom Report Template

Modify plugin configuration in `templateReporting.ts` file in `packages/backend/src/plugins/`:

```diff

export default async function createPlugin(env: PluginEnvironment,): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    database: env.database,
+   customReportTemplates: reportTemplates
  });
}

+ const reportTemplateAdded: TemplateReportObj = {
+ name: 'dummyTemplate',
+  content: `
+ ### This is dummy template for {{ templateExecutionId }} and template name : {{ templateName }}
+ | Step Name | Step Output | Next Steps |
+ | :-------|:--------:|--------:|
+ {% for item in outputs -%}
+ | {{ item.stepName }} | [{{item.stepOutput}}]({{ item.stepOutput }}) | {{ item.nextStep }} |
+ {% endfor %}
+ `}
+
+ const reportTemplates: TemplateReportObj[] = [
+   reportTemplateAdded
+ ]

```

## Custom Action

Wire up the Custom Action to your Scaffolder actions list in file in `packages/backend/src/plugins/scaffolder.ts`:

```diff
+ import { generateTemplateReport } from '@tduniec/plugin-template-reporting-backend';

...

  const actions = [
    ...builtInActions,
+   generateTemplateReport(env.config)
  ];
```

### Custom action usage in template

```yaml
---
steps:
  - id: generate-report
    action: template:report:generate
    name: Generate report for template
    input:
      reportInputs:
        outputs:
          - stepName: Step1
            stepOutput: https://google.com
            nextStep: Step2
          - stepName: Step2
            stepOutput: https://amazon.com
            nextStep: verify report
      reportTemplateName: 'dummyTemplate' #optional -> if you want to use your custom report template, if not specified the default report template will be taken

output:
  links:
    - title: Template Report
      icon: catalog
      url: ${{ steps['generate-report'].output.reportUrl }}
```

### Default Report Template

It comes with build in report Template

```md
## Generated report for template: '{{ templateName }}'

#### Generated on **{{ time }}**

---

Template Execution Id: **{{ templateExecutionId }}**

This report provides an overview of the execution of template actions in Backstage Scaffolder.

| Step Name | Step Output | Next Steps |
| :-------- | :---------: | ---------: |

{% for item in outputs -%}
| {{ item.stepName }} | [{{ item.stepOutput }}]({{ item.stepOutput }}) | {{ item.nextStep }} |
{% endfor %}

### Further Actions

---

After the successful execution, the following steps need to be done as these steps are not done in the template execution
{% for item in furtherActions %}
{{ item }}
{% endfor %}`
```

This one can be used with this action:

```yaml
---
steps:
  - id: generate-report
    action: template:report:generate
    name: Generate report for template
    input:
      reportInputs:
        outputs:
          - stepName: My Dummy Step1
            stepOutput: https://google.com
            nextStep: todo1
          - stepName: My Dummy Step2
            stepOutput: https://amazon.com
            nextStep: todo2
        furtherActions:
          - 1. Upload the image to ECR production
          - 2. Prepare release
output:
  links:
    - title: Template Report
      icon: catalog
      url: ${{ steps['generate-report'].output.reportUrl }}
```

### New Backend - instalation

2. Wire up the plugin in Backstage new backend system

in `packages/backend/src/index.ts`

```ts
backend.add(import('@tduniec/backstage-plugin-template-reporting-backend'));
```

## register custom Report Templates

```ts
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  TemplateReportObj,
  templateReportingReportsExtensionPoint,
} from '@tduniec/backstage-plugin-template-reporting-backend';
```

...

```ts
const reportTemplateAdded: TemplateReportObj = {
  name: 'dummyTemplate',
  content: `
 ### This is dummy template for {{ templateExecutionId }} and template name : {{ templateName }}
 | Step Name | Step Output | Next Steps |
 | :-------|:--------:|--------:|
 {% for item in outputs -%}
 | {{ item.stepName }} | [{{item.stepOutput}}]({{ item.stepOutput }}) | {{ item.nextStep }} |
 {% endfor %}
 `,
};

const templateReportingCustomExtensions = createBackendModule({
  pluginId: 'template-reporting',
  moduleId: 'custom-template-report',
  register(env) {
    env.registerInit({
      deps: {
        templateReporting: templateReportingReportsExtensionPoint,
      },
      async init({ templateReporting }) {
        templateReporting.addReports(reportTemplateAdded); // just an example
      },
    });
  },
});
backend.add(templateReportingCustomExtensions());
```

## register custom action in New Backend Scaffolder

```ts
import {
  TemplateReportObj,
  templateReportingReportsExtensionPoint,
  generateTemplateReport,
} from '@tduniec/backstage-plugin-template-reporting-backend';
import { coreServices } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
```

...

```ts
const scaffolderModuleCustomExtensions = createBackendModule({
  pluginId: 'scaffolder', // name of the plugin that the module is targeting
  moduleId: 'custom-extensions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        auth: coreServices.auth,
        // ... and other dependencies as needed
      },
      async init({ scaffolder, config, auth /* ..., other dependencies */ }) {
        // Here you have the opportunity to interact with the extension
        // point before the plugin itself gets instantiated
        scaffolder.addActions(await generateTemplateReport(config, auth)); // just an example
      },
    });
  },
});
backend.add(scaffolderModuleCustomExtensions());
```
