import { TemplateReportObj } from "..";

export const defaultTemplate: TemplateReportObj = {
    name: 'defaultTemplate',
    content: `
## Generated report for template: '{{ templateName }}'
#### Generated on **{{ time }}**
---
Template Execution Id:  **{{ templateExecutionId }}**

This report provides an overview of the execution of template actions in Backstage Scaffolder.

| Step Name | Step Output | Next Steps |
| :-------|:--------:|--------:|
{% for item in outputs -%}
| {{ item.stepName }} | [Link]({{ item.stepOutput }}) | {{ item.nextStep }} |
{% endfor %}
### Further Actions
---
After the successful execution, the following steps need to be done as these steps are not done in the template execution
{% for item in furtherActions %}
{{ item }}
{% endfor %}`
}
