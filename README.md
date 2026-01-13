# OG Image Generator

Automated social share/OG image generation service for Hencove's client websites. This service dynamically generates properly-sized Open Graph images (1200x630px) using client-specific design templates.

## Features

- Dynamic OG image generation from blog post titles and metadata
- Support for multiple client templates (each with unique branding/design)
- Built with Next.js 16 and `@vercel/og`
- Edge runtime for fast, global image generation
- Automatic CDN caching via Vercel
- Easy integration with WordPress, Webflow, and static site generators
- Web-based preview interface for testing templates

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the preview interface.

### Production Build

```bash
npm run build
npm start
```

## Usage

### API Endpoint

The main image generation endpoint is available at:

```
GET /api/og
```

#### Query Parameters

- `template` (required): Template identifier (e.g., "default")
- `title` (required): Blog post title
- `subtitle` (optional): Subtitle or excerpt
- `author` (optional): Author name
- `date` (optional): Publication date
- `category` (optional): Post category/tag

#### Example Request

```
http://localhost:3000/api/og?template=default&title=How+to+Build+Better+Websites&subtitle=A+comprehensive+guide&author=John+Doe
```

### Integration

Add these meta tags to your HTML `<head>`:

```html
<meta property="og:image" content="YOUR_IMAGE_URL" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="YOUR_IMAGE_URL" />
```

Replace `YOUR_IMAGE_URL` with the full URL to the API endpoint with your parameters.

## Project Structure

```
og-image-generator/
├── app/
│   ├── api/
│   │   └── og/
│   │       └── route.tsx          # Main OG generation endpoint
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Preview UI
├── lib/
│   ├── templates/
│   │   ├── index.ts              # Template registry
│   │   └── default.tsx           # Default template
│   └── types.ts                  # TypeScript types
├── public/
│   ├── fonts/                    # Custom font files
│   └── logos/                    # Client logos
└── package.json
```

## Adding New Templates

1. Create a new template file in `lib/templates/` (e.g., `client-name.tsx`)
2. Export a `config` object with template metadata
3. Export a default React component that accepts `TemplateProps`
4. Use inline styles only (requirement of `@vercel/og`)
5. Add the template to the registry in `lib/templates/index.ts`

### Example Template

```tsx
import { TemplateConfig, TemplateProps } from '../types';

export const config: TemplateConfig = {
  id: 'my-template',
  name: 'My Template',
  colors: {
    primary: '#2563eb',
    background: '#ffffff',
    text: '#0f172a',
  },
};

export default function MyTemplate({ title, subtitle }: TemplateProps) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: config.colors.background,
      }}
    >
      <h1 style={{ color: config.colors.text }}>{title}</h1>
    </div>
  );
}
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-detects Next.js and deploys
4. Configure custom domain if needed (e.g., `og.hencove.com`)

Every push to main branch will automatically deploy.

### Cost Estimates

- **Vercel Free Tier**: 100GB bandwidth/month, ~100k generations/month
- **Vercel Pro**: $20/month for higher usage

For most Hencove client sites, the free tier should be sufficient.

## Performance

- **First request**: ~500ms to generate
- **Cached requests**: <50ms (served from CDN)
- **Cache duration**: 1 year (immutable)
- Images are automatically cached globally via Vercel CDN

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Image Generation**: `@vercel/og` library
- **Runtime**: Edge runtime
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

## Documentation

For detailed implementation information, see [og-image-service-implementation-guide.md](./og-image-service-implementation-guide.md).

## License

Private - Hencove internal use only
