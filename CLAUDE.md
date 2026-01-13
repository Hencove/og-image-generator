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

Images and fonts must be:

- Absolute URLs, or
- Base64 encoded, or
- Loaded as ArrayBuffer

Google Fonts work automatically when referenced in inline styles via `fontFamily`.

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

## Reference Documentation

See [og-image-service-implementation-guide.md](./og-image-service-implementation-guide.md) for comprehensive implementation details and troubleshooting.

## IMPORTANT NOTES

Always run prettier on the files you've edited or created when you are done using `prettier files-here --write`
