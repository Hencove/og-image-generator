import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getTemplate } from '@/lib/templates';

// Use edge runtime for faster, global execution
export const runtime = 'edge';

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

    // Generate image using ImageResponse
    // Note: @vercel/og automatically handles Google Fonts when used in JSX
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
