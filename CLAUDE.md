# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an automated OG (Open Graph) image generation service for Hencove's client websites. It dynamically generates 1200x630px social share images using `@vercel/og` and client-specific templates.

**Target deployment**: Vercel (free tier sufficient for most usage)

## Essential Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
npm run prettier # Check prettier formatting
npm run prettier:fix # Write/Fix prettier formatting
npm run check    # Check both prettier and linting
```

The preview UI at `http://localhost:3000` lets you test templates interactively.

## Architecture

### Template System (Core Concept)

The service uses a **template registry pattern** where each client gets a custom template:

1. **Template files** (`lib/templates/*.tsx`) - Each template exports:
   - `config: TemplateConfig` - Metadata (id, colors, fonts, etc.)
   - `default: React.ComponentType<TemplateProps>` - The rendering component

2. **Template registry** (`lib/templates/index.ts`) - Central registry mapping template IDs to modules:
   - `getTemplate(id)` - Returns template or falls back to default
   - `getTemplateIds()` - Lists all available templates
   - `templateExists(id)` - Checks if template exists

3. **Type contracts** (`lib/types.ts`) - All templates must implement:
   - `TemplateProps` - Required props (title, subtitle, author, date, category)
   - `TemplateConfig` - Configuration structure
   - `TemplateModule` - Module export structure

### Data Flow

```
Client request → /api/og route → getTemplate(id) → ImageResponse → PNG (cached)
```

The API route (`app/api/og/route.tsx`):

- Uses **edge runtime** for fast global execution
- Validates and sanitizes inputs (200 char title limit)
- Returns 1200x630px PNG with immutable cache headers (1 year)
- Falls back to error image on failure

### Critical @vercel/og Constraints

Templates **must use inline styles only**. The `@vercel/og` library does not support:

- CSS classes or modules
- Tailwind classes in JSX
- External stylesheets
- Most advanced CSS (only flexbox + basic properties)

Images must be:

- Absolute URLs, or
- Base64 encoded, or
- Loaded as ArrayBuffer

#### Google Fonts Requirements

**IMPORTANT**: Google Fonts are **NOT automatically loaded** by `@vercel/og`. You must explicitly fetch and load them:

1. **Add fonts to template config** (`lib/templates/your-template.tsx`):

   ```tsx
   export const config: TemplateConfig = {
     fonts: [
       {
         name: 'Font Name',
         weights: [300, 400, 600, 700],
       },
     ],
   };
   ```

2. **The API route automatically loads fonts** specified in template config via the `loadGoogleFont()` function in `app/api/og/route.tsx`. This function:
   - Fetches font CSS from Google Fonts API
   - Extracts the font file URL
   - Downloads the font as ArrayBuffer
   - Passes it to `ImageResponse` in the `fonts` option

3. **Use the font in your template** with `fontFamily` in inline styles:
   ```tsx
   <div style={{ fontFamily: 'Font Name' }}>
   ```

**Note**: Every text element that needs the custom font must have `fontFamily` explicitly set in its inline styles. Setting it on a parent div does not reliably cascade in the edge runtime.

## Adding New Client Templates

**Process**:

1. Create `lib/templates/client-name.tsx`:

```tsx
import { TemplateConfig, TemplateProps } from '../types';

export const config: TemplateConfig = {
  id: 'client-name',
  name: 'Client Display Name',
  colors: { primary: '#...', background: '#...', text: '#...' },
  // Optional: fonts, logoPath
};

export default function ClientTemplate({
  title,
  subtitle,
  author,
}: TemplateProps) {
  return (
    <div
      style={
        {
          /* inline styles only */
        }
      }
    >
      {/* JSX with inline styles */}
    </div>
  );
}
```

2. Register in `lib/templates/index.ts`:

```tsx
import ClientTemplate, { config as clientConfig } from './client-name';

const templates: Record<string, TemplateModule> = {
  // ...existing
  'client-name': {
    default: ClientTemplate,
    config: clientConfig,
  },
};
```

3. Test via preview UI or direct API call:

```
/api/og?template=client-name&title=Test+Title
```

**Design guidelines**:

- Test with both short (3-5 words) and long (15-20 words) titles
- Ensure text wraps properly and doesn't overflow
- Use safe zones with 60-80px padding minimum
- Verify contrast for readability

## Path Aliases

The project uses `@/*` to reference root files:

```tsx
import { getTemplate } from '@/lib/templates';
import { TemplateProps } from '@/lib/types';
```

## Caching Strategy

Images are cached with `Cache-Control: public, max-age=31536000, immutable`:

- First request: ~500ms generation
- Cached requests: <50ms (CDN serve)
- Cache invalidation: Change query param (e.g., add `&v=2`)

## Security Configuration

### 1. Password-Protected Demo Page

The demo page at the root URL can be password-protected using HTTP Basic Authentication.

**Setup on Vercel**:

1. Go to your Vercel project settings → Environment Variables
2. Add: `DEMO_PASSWORD` with your desired password value
3. Redeploy the application

When enabled, users will be prompted for credentials when accessing the demo page. Any username is accepted; only the password is validated.

**To disable**: Remove the `DEMO_PASSWORD` environment variable or leave it empty.

### 2. Domain Allowlist for API

The `/api/og` endpoint can be restricted to only serve requests from specific domains. This prevents unauthorized usage of your image generation service.

**Setup on Vercel**:

1. Go to your Vercel project settings → Environment Variables
2. Add: `ALLOWED_DOMAINS` with comma-separated domain list (e.g., `example.com,anotherdomain.com`)
3. Redeploy the application

**How it works**:

- Checks both `Referer` and `Origin` headers
- Supports exact domain matches and subdomains (e.g., `example.com` allows `www.example.com`, `blog.example.com`)
- Returns `403 Forbidden` for requests from non-allowed domains
- If `ALLOWED_DOMAINS` is not set or empty, all domains are allowed

**Local development**:

Create a `.env.local` file (not committed to git):

```bash
# Optional: Password protect demo page
DEMO_PASSWORD=your-secure-password

# Optional: Restrict API to specific domains
ALLOWED_DOMAINS=localhost,yourdomain.com
```

## Client Integration

Clients add these meta tags to their `<head>`:

```html
<meta
  property="og:image"
  content="https://domain.com/api/og?template=client-id&title=..."
/>
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta
  name="twitter:image"
  content="https://domain.com/api/og?template=client-id&title=..."
/>
```

**Note**: Make sure to add the client's domain to `ALLOWED_DOMAINS` if domain restrictions are enabled.

## Reference Documentation

See [og-image-service-implementation-guide.md](./og-image-service-implementation-guide.md) for comprehensive implementation details and troubleshooting.

## IMPORTANT NOTES

Always run prettier on the files you've edited or created when you are done using `prettier --write file1 file2 file3`
