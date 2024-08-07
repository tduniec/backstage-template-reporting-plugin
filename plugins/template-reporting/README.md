# Template Reporting

The Backstage Template-Reporting Plugin is designed to generate reports from template executions within Backstage. It offers high customization, allowing any template to be used with the Nunjucks templating engine. The plugin renders the final reports in a visually appealing format using Markdown, making it versatile for various reporting needs. This part of plugin `frontend` is responsible of providing views from dara coming of `backend` part of plugin.

## Dependencies

- [template-reporting-backend](https://github.com/tduniec/backstage-template-reporting-plugin/tree/main/plugins/template-reporting-backend)

## Code

https://github.com/tduniec/backstage-template-reporting-plugin.git

## Screens

![Screenshot of the SingleReportPage](https://raw.githubusercontent.com/tduniec/backstage-template-reporting-plugin/main/plugins/template-reporting/docs/SingleReportView.png)
![Screenshot of TemplateOutputs](https://raw.githubusercontent.com/tduniec/backstage-template-reporting-plugin/main/plugins/template-reporting/docs/TemplateOutput.png)
![Screenshot of ReportListPage](https://raw.githubusercontent.com/tduniec/backstage-template-reporting-plugin/main/plugins/template-reporting/docs/ReportListPageAll.png)

## Installation

1. Install the plugin package in your Backstage app:

```sh
# From your Backstage root directory
yarn add --cwd packages/app @tduniec/backstage-plugin-template-reporting
```

2. Now open the `packages/app/src/App.tsx` file
3. Then after all the import statements add the following line:

   ```ts
   import {
     TemplateReportsPage,
     TemplateReportPage,
   } from '@tduniec/backstage-plugin-template-reporting';
   ```

4. In this same file just before the closing `</ FlatRoutes>`, this will be near the bottom of the file, add this line:

   ```ts
      <Route path="/template-reporting" element={<TemplateReportsPage />} />
      <Route path="/template-reporting/:id" element={<TemplateReportPage />} />
   ```

5. Next open the `packages/app/src/components/Root/Root.tsx` file
6. We want to add this icon import after all the existing import statements:

   ```ts
   import Pages from '@material-ui/icons/Pages';
   ```

7. Then add this line just after the `<SidebarSettings />` line:

   ```ts
   <SidebarItem icon={Pages} to="template-reporting" text="templateReporting" />
   ```

8. Now run `yarn dev` from the root of your project and you should see the DevTools option show up just below Settings in your sidebar and clicking on it will get you to the [Info tab](#info)
9. Install [template-reporting-backend](../template-reporting-backend/README.md) part if not installed already
