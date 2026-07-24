export class RenderTemplateQuery {
  execute(templateName: string, templates: Record<string, Function>, params: Record<string, any>) {
    if (!Object.prototype.hasOwnProperty.call(templates, templateName) || typeof templates[templateName] !== 'function') {
      throw new Error(`Template '${templateName}' not found`);
    }
    return templates[templateName](params);
  }
}
export const renderTemplateQuery = new RenderTemplateQuery();
