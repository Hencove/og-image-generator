/**
 * Props that all OG image templates must accept
 */
export interface TemplateProps {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  category?: string;
  imageUrl?: string;
}

/**
 * Configuration for template fonts
 */
export interface FontConfig {
  name: string;
  data: ArrayBuffer;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: 'normal' | 'italic';
}

/**
 * Template configuration object
 */
export interface TemplateConfig {
  id: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary?: string;
    background: string;
    text: string;
    accent?: string;
  };
  fonts?: {
    name: string;
    url?: string; // For custom fonts
    weights?: number[];
  }[];
  logoPath?: string;
}

/**
 * Template component type
 */
export type TemplateComponent = React.ComponentType<TemplateProps>;

/**
 * Template module structure
 */
export interface TemplateModule {
  default: TemplateComponent;
  config: TemplateConfig;
}
