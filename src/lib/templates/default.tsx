import { TemplateConfig, TemplateProps } from '../types';

export const config: TemplateConfig = {
  id: 'default',
  name: 'Default Template',
  description: 'A clean, professional template that works for any client',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#0f172a',
    accent: '#3b82f6',
  },
  fonts: [
    {
      name: 'Inter',
      weights: [400, 600, 700],
    },
  ],
};

export default function DefaultTemplate({
  title,
  subtitle,
  author,
  date,
}: TemplateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: config.colors.background,
        padding: 80,
      }}
    >
      {/* Main content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        {/* Title and subtitle section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              color: config.colors.text,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                display: 'flex',
                fontSize: 32,
                fontWeight: 400,
                lineHeight: 1.4,
                color: config.colors.secondary,
                marginTop: 24,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Footer section with author and date */}
        {(author || date) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `4px solid ${config.colors.primary}`,
              paddingTop: 32,
            }}
          >
            {author && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  fontWeight: 600,
                  color: config.colors.text,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {author}
              </div>
            )}

            {date && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: config.colors.secondary,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {date}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
