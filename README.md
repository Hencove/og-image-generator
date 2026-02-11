# OG Image Generator

Automated social share/OG image generation service for Hencove's client websites. This service dynamically generates properly-sized Open Graph images (1200x630px) using client-specific design templates.

## Features

- Dynamic OG image generation from blog post titles and metadata
- Support for multiple client templates (each with unique branding/design)
- Built with Cloudflare Workers and `@cloudflare/pages-plugin-vercel-og`
- Edge runtime for fast, global image generation
- Automatic CDN caching via Cloudflare
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

Open [http://localhost:8787](http://localhost:8787) to access the preview interface.

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Usage

### API Endpoint

The main image generation endpoint is available at:

```
GET /api/og
```

or

```
GET /og
```

#### Query Parameters

- `template` (optional): Template identifier (e.g., "default", "complisolv"). Defaults to "default"
- `title` (required): Blog post title
- `subtitle` (optional): Subtitle or excerpt
- `author` (optional): Author name
- `date` (optional): Publication date
- `category` (optional): Post category/tag

#### Example Request

```
http://localhost:8787/api/og?template=default&title=How+to+Build+Better+Websites&subtitle=A+comprehensive+guide&author=John+Doe
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
├── src/
│   ├── index.tsx                    # Main Cloudflare Worker entry point
│   └── lib/
│       ├── templates/
│       │   ├── index.ts             # Template registry
│       │   ├── default.tsx          # Default template
│       │   └── [client].tsx         # Client-specific templates
│       └── types.ts                 # TypeScript types
├── public/                          # Static assets
├── wrangler.jsonc                   # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## Adding New Templates

1. Create a new template file in `src/lib/templates/` (e.g., `client-name.tsx`)
2. Export a `config` object with template metadata
3. Export a default React component that accepts `TemplateProps`
4. Use inline styles only (requirement of the image generation library)
5. Add the template to the registry in `src/lib/templates/index.ts`

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

## Environment Variables

Configure these via Cloudflare Workers secrets or `.dev.vars` for local development:

- `DEMO_PASSWORD` (optional): Password to protect the demo page with HTTP Basic Auth
- `ALLOWED_DOMAINS` (optional): Comma-separated list of domains allowed to use the API

## Performance

- **First request**: ~500ms to generate
- **Cached requests**: <50ms (served from CDN)
- **Cache duration**: 1 year (immutable)
- Images are automatically cached globally via Cloudflare CDN

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Image Generation**: `@cloudflare/pages-plugin-vercel-og`
- **Language**: TypeScript
- **UI Library**: React (for template components)

## License

Private - Hencove internal use only
