import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getTemplate } from '@/lib/templates';

// Use edge runtime for faster, global execution
export const runtime = 'edge';

/**
 * Load a Google Font for use in OG image generation
 */
async function loadGoogleFont(
  font: string,
  text: string,
  weight: number = 400,
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error(`Failed to load font data for ${font}`);
}

/**
 * Main OG image generation endpoint
 * GET /api/og?template=default&title=Your+Title&subtitle=Optional+Subtitle
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Extract query parameters
    const templateId = searchParams.get('template') || 'default';
    const title = searchParams.get('title');
    const subtitle = searchParams.get('subtitle') || undefined;
    const author = searchParams.get('author') || undefined;
    const date = searchParams.get('date') || undefined;
    const category = searchParams.get('category') || undefined;

    // Validate required parameters
    if (!title) {
      return new Response('Missing required parameter: title', {
        status: 400,
      });
    }

    // Limit title length to prevent memory issues
    const maxTitleLength = 200;
    const sanitizedTitle =
      title.length > maxTitleLength
        ? title.substring(0, maxTitleLength) + '...'
        : title;

    // Get the template
    const template = getTemplate(templateId);
    const TemplateComponent = template.default;

    // Load fonts if template specifies them
    const fonts = [];
    if (template.config.fonts) {
      for (const fontConfig of template.config.fonts) {
        // For CompliSolv and other templates using Darker Grotesque
        // Load multiple weights
        const weights = fontConfig.weights || [400];
        for (const weight of weights) {
          try {
            const fontData = await loadGoogleFont(
              fontConfig.name,
              sanitizedTitle + (category || ''),
              weight,
            );
            fonts.push({
              name: fontConfig.name,
              data: fontData,
              weight,
              style: 'normal',
            });
          } catch (error) {
            console.error(
              `Failed to load font ${fontConfig.name} weight ${weight}:`,
              error,
            );
          }
        }
      }
    }

    // Generate image using ImageResponse
    return new ImageResponse(
      <TemplateComponent
        title={sanitizedTitle}
        subtitle={subtitle}
        author={author}
        date={date}
        category={category}
      />,
      {
        width: 1200,
        height: 630,
        fonts: fonts.length > 0 ? fonts : undefined,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
    );
  } catch (error) {
    console.error('Error generating OG image:', error);

    // Return a simple error image
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f1f5f9',
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#ef4444',
        }}
      >
        Error generating image
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
