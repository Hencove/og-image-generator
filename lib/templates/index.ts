import { TemplateModule } from '../types';
import DefaultTemplate, { config as defaultConfig } from './default';
import CompliSolvTemplate, { config as compliSolvConfig } from './complisolv';

/**
 * Registry of all available templates
 * Add new templates here as they are created
 */
const templates: Record<string, TemplateModule> = {
  default: {
    default: DefaultTemplate,
    config: defaultConfig,
  },
  complisolv: {
    default: CompliSolvTemplate,
    config: compliSolvConfig,
  },
};

/**
 * Get a template by ID
 * Falls back to default template if the requested template doesn't exist
 *
 * @param templateId - The ID of the template to retrieve
 * @returns The template module (component + config)
 */
export function getTemplate(templateId?: string): TemplateModule {
  if (!templateId || !templates[templateId]) {
    return templates.default;
  }
  return templates[templateId];
}

/**
 * Get all available template IDs
 *
 * @returns Array of template IDs
 */
export function getTemplateIds(): string[] {
  return Object.keys(templates);
}

/**
 * Check if a template exists
 *
 * @param templateId - The ID of the template to check
 * @returns True if the template exists
 */
export function templateExists(templateId: string): boolean {
  return templateId in templates;
}

export { templates };
