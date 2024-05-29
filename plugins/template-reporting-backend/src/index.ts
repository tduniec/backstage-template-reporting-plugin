export * from './service/router';

export type ErrorRepresentation = {
  error: string;
  errorMessage: string;
};

export type TemplateReport = {
  templateInputs: any;
  templateReportTemplateName?: string;
  templateName: string;
  createdBy: string;
  templateExecutionId: string;
};

export type TemplateReportObj = {
  name: string;
  content: string;
};

export { generateTemplateReport } from './actions/GenerateReport/GenerateReport';
