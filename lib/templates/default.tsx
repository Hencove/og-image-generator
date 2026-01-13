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
        padding: '80px',
        fontFamily: 'Inter, sans-serif',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 700,
              lineHeight: '1.1',
              color: config.colors.text,
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                fontSize: '32px',
                fontWeight: 400,
                lineHeight: '1.4',
                color: config.colors.secondary,
                margin: 0,
                maxWidth: '800px',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Footer section with author and date */}
        {(author || date) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `4px solid ${config.colors.primary}`,
              paddingTop: '32px',
            }}
          >
            {author && (
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: config.colors.text,
                }}
              >
                {author}
              </div>
            )}

            {date && (
              <div
                style={{
                  fontSize: '24px',
                  color: config.colors.secondary,
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
