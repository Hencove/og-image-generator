# OG Image Generation Service - Implementation Guide for Claude Code

> **Note**: This document was the original implementation guide for a Vercel/Next.js deployment. The project has since been migrated to **Cloudflare Workers**. For current architecture and instructions, see [CLAUDE.md](./CLAUDE.md) and [README.md](./README.md). This document is retained for historical reference.

## Project Overview

This is an automated social share/OG image generation service for Hencove's client websites. The service accepts a template ID and post metadata, then dynamically generates properly-sized OG images (1200x630px) using client-specific design templates.

## What This Document Is For

This guide explains the **architecture and plan** for Claude Code to implement. Claude Code will write all the actual code - this document just explains what needs to be built and how it should work.

## Core Requirements

### Technical Goals

- Generate OG images dynamically from blog post titles and metadata
- Support multiple client templates (each with unique branding/design)
- Keep operational costs minimal (target: free tier or <$10/month)
- Easy integration with WordPress, Webflow, and static site generators
- Fast generation with CDN caching for repeat requests

### Design Workflow

1. Designers create templates in Figma/Illustrator
2. Developer translates design to HTML/CSS/JSX template
3. Template stored in service with client identifier
4. Client sites call API with template ID + content
5. Service generates and returns image

## Recommended Tech Stack

### Primary Stack: Vercel + @vercel/og

- **Framework**: Next.js 14+ (App Router) (Use Context7 to ensure you're using the newest version, should be at least 16)
- **Image Generation**: `@vercel/og` library (React-based)
- **Deployment**: Vercel (free tier sufficient for most usage)
- **Template Storage**: JSON config files in repo
- **Fonts**: Google Fonts or custom fonts via Vercel

### Why This Stack?

- `@vercel/og` is purpose-built for this exact use case
- Supports JSX/React for flexible layouts (easier than canvas)
- Automatic edge caching via Vercel CDN
- Simple deployment (git push to deploy)
- Free tier covers ~100k generations/month
- Handles custom fonts seamlessly

## Project Structure

The project should be organized as follows:

```
og-image-service/
├── app/
│   ├── api/
│   │   └── og/
│   │       └── route.tsx          # Main OG generation endpoint
│   ├── layout.tsx
│   └── page.tsx                    # Optional: template preview UI
├── lib/
│   ├── templates/
│   │   ├── index.ts               # Template registry
│   │   ├── default.tsx            # Fallback template
│   │   ├── client-a.tsx           # Example client template
│   │   └── ...                     # Additional client templates
│   ├── types.ts                   # TypeScript types
│   └── utils.ts                   # Helper functions (if needed)
├── public/
│   ├── fonts/                     # Custom font files (if needed)
│   └── logos/                     # Client logos
├── .env.local                     # Environment variables
├── next.config.js
├── package.json
└── README.md
```

## API Endpoint Specification

### Primary Endpoint: `/api/og`

**Method**: GET

**Query Parameters**:

- `template` (required): Template identifier (e.g., "client-a", "hencove", "complisolv")
- `title` (required): Blog post title
- `subtitle` (optional): Subtitle or excerpt
- `author` (optional): Author name
- `date` (optional): Publication date
- `category` (optional): Post category/tag

**Response**: PNG image (1200x630px)

**Example Request**:

```
https://og.hencove.com/api/og?template=acme-corp&title=How+to+Build+Better+Websites&subtitle=A+comprehensive+guide
```

**Response Headers**:

```
Content-Type: image/png
Cache-Control: public, max-age=31536000, immutable
```

## Template System Architecture

### How Templates Work

Each template should be:

1. A separate TypeScript/JSX file in `lib/templates/`
2. Export a config object with template metadata (colors, fonts, logo path, etc.)
3. Export a default React component that receives props and renders the OG image layout
4. Use inline styles (not CSS modules or Tailwind - `@vercel/og` requires inline styles)

### Template Props Interface

All templates should accept these props:

- `title` (string, required)
- `subtitle` (string, optional)
- `author` (string, optional)
- `date` (string, optional)
- `category` (string, optional)

### Template Registry

The `lib/templates/index.ts` file should:

- Import all template modules
- Export an object mapping template IDs to their components and configs
- Export a `getTemplate(id)` function that returns the requested template or falls back to default

### Important Constraints for @vercel/og

- Must use inline styles only (no CSS classes or Tailwind)
- Limited CSS properties supported (mostly flexbox, basic typography, backgrounds)
- No external stylesheets
- Images must be absolute URLs or base64
- Fonts can be Google Fonts (automatic) or custom fonts loaded as ArrayBuffer

## Main API Route Implementation

The `app/api/og/route.tsx` file should:

1. **Export `runtime = 'edge'`** for edge runtime (faster, global)
2. **Handle GET requests** with the following logic:
   - Extract query parameters (template, title, subtitle, etc.)
   - Call `getTemplate(templateId)` to get the template component and config
   - If template has custom fonts, load them as ArrayBuffer
   - Use `ImageResponse` from `@vercel/og` to render the template component
   - Return the image with appropriate headers
3. **Error handling**: Catch errors and return a simple error image
4. **TypeScript**: Properly type all parameters and return values

## Setup Process

### Initial Setup Steps

1. **Initialize Next.js project**:
   - Use `create-next-app` with TypeScript, App Router, ESLint
   - Install `@vercel/og` package
2. **Create directory structure**:
   - Create `lib/templates` folder
   - Create `public/logos` and `public/fonts` folders
3. **Create type definitions** in `lib/types.ts`:
   - `TemplateProps` interface
   - `TemplateConfig` interface
   - `FontConfig` interface

4. **Create default template** (`lib/templates/default.tsx`):
   - Simple, professional design that works for any client
   - Uses only Google Fonts (no custom fonts needed)
   - Clean layout with title, optional subtitle, optional author

5. **Create template registry** (`lib/templates/index.ts`):
   - Import default template
   - Export templates object
   - Export getTemplate function

6. **Create API route** (`app/api/og/route.tsx`):
   - Implement the logic described above
   - Handle all query parameters
   - Support custom fonts
   - Include error handling

7. **Optional: Create preview page** (`app/page.tsx`):
   - Simple UI to test templates
   - Form inputs for template ID and parameters
   - Display generated image

### Environment Configuration

Create `.env.local` for any environment-specific values (though likely not needed initially).

Configure `next.config.js` if there are external image domains to allow.

### Testing

After implementation, test with:

```
http://localhost:3000/api/og?template=default&title=Test+Post
```

## Client Integration Examples

Once deployed, clients integrate by adding OG meta tags with URLs pointing to the service:

### WordPress

Add function to generate OG image URL based on post title and client template ID, then output appropriate meta tags in `<head>`.

### Webflow

Use Page Settings > Custom Code to add meta tags with Webflow's template variables.

### Static Sites

Generate OG image URLs at build time using the post title and client template.

## Adding New Client Templates

### Workflow for Each New Client

1. **Receive design assets** from designer (Figma/Illustrator)
2. **Extract specifications**:
   - Colors (primary, secondary, backgrounds)
   - Fonts (names, weights, Google or custom) - Logo placement and size
   - Layout structure (centered, left-aligned, split-screen, etc.)
   - Text sizes and spacing
3. **Create new template file**: `lib/templates/client-name.tsx`
4. **Implement the design** as a React component with inline styles
5. **Add to template registry** in `lib/templates/index.ts`
6. **Test** with various title lengths and optional fields
7. **Deploy** (automatic if using Vercel + GitHub)
8. **Document** the template ID and usage for the client

### Template Design Tips

- **Title length**: Test with both short (3-5 words) and long (15-20 words) titles
- **Text wrapping**: Ensure long titles wrap properly and don't overflow
- **Contrast**: Verify text is readable on all background colors/gradients
- **Logo size**: Keep logos proportional (usually 80-150px wide)
- **Safe zones**: Leave adequate padding (60-80px minimum)
- **Font loading**: Google Fonts work automatically, custom fonts need to be fetched
- **Color consistency**: Store brand colors in the config object for easy reference

## Deployment

### Vercel Deployment (Recommended)

1. **Push code to GitHub** repository
2. **Connect to Vercel**:
   - Go to vercel.com
   - Import GitHub repository
   - Vercel auto-detects Next.js and configures build settings
3. **Configure domain** (optional):
   - Add custom domain like `og.hencove.com`
   - Update DNS to point to Vercel
4. **Automatic deployments**: Every push to main branch auto-deploys

### Alternative: Self-Hosted

If you prefer not to use Vercel:

- Deploy to Railway, Render, or DigitalOcean
- Ensure Node.js environment supports edge functions or use standard Node runtime
- May need to adjust caching strategy manually

## Performance & Caching

### How Caching Works

- **Vercel CDN**: Caches generated images globally
- **Cache headers**: Images cache for 1 year (immutable)
- **First request**: ~500ms to generate
- **Subsequent requests**: <50ms (served from CDN)
- **Cost**: Only charged for unique image generations, not cached serves

### Cache Invalidation

If you need to update a template:

1. Update the template code
2. Deploy changes
3. Images with identical URLs will serve cached version
4. To force regeneration, change a query parameter (e.g., add `&v=2`)

## Cost Estimates

### Vercel Free Tier

- **Bandwidth**: 100GB/month
- **Function executions**: 100GB-hrs/month
- **Typical usage**: 50,000-100,000 image generations/month
- **Cost**: $0

### Beyond Free Tier

- **Pro plan**: $20/month (1TB bandwidth, 1,000 GB-hrs)
- **Typical usage**: 500,000+ image generations/month
- **Alternative**: Self-host on $5-10/month server if needed

For Hencove's client sites, free tier should be more than sufficient unless you have a viral post or extremely high traffic client.

## Maintenance & Operations

### Monitoring

- Check Vercel dashboard for usage stats
- Monitor function error rates
- Set up alerts for failures (optional)

### Updates

- **New templates**: Add template file, update registry, deploy
- **Template changes**: Edit template file, deploy (old images remain cached)
- **Bug fixes**: Fix code, deploy (may need cache invalidation for affected images)

### Backup Strategy

- Code is in Git (primary backup)
- Template configs can be exported to JSON if needed
- No database or state to back up

## Troubleshooting Common Issues

### Template Not Rendering

- Check template ID matches registry key exactly
- Verify template exports both config and default component
- Check for TypeScript errors

### Fonts Not Loading

- Google Fonts: Verify font name is correct (case-sensitive)
- Custom fonts: Ensure font file is in `public/fonts/` and URL is absolute
- Check font is loaded as ArrayBuffer in API route

### Image Too Large/Small

- Verify width/height are 1200x630 in ImageResponse options
- Check element styles don't force different dimensions
- Test with various content lengths

### CORS Errors

- Ensure logos/images are served from same domain or have CORS headers
- Consider base64 encoding small images instead of external URLs

### Performance Issues

- Optimize image assets (compress logos)
- Use Google Fonts when possible (faster than custom)
- Check Vercel function logs for slow operations

## Security Considerations

### Input Validation

The API route should:

- Sanitize title/subtitle to prevent XSS (React does this automatically)
- Limit title length to prevent memory issues (suggested max: 200 characters)
- Validate template ID exists before rendering

### Rate Limiting

Vercel automatically rate limits edge functions, but consider:

- Adding custom rate limiting if abuse occurs
- Monitoring for unusual traffic patterns
- Blocking specific template IDs if needed

### Access Control

Currently public API (no authentication):

- Acceptable for this use case (just generates images)
- No sensitive data in requests or responses
- Could add API key requirement later if needed

## Future Enhancements

### Potential Features to Add Later

1. **Template editor UI**: Web interface to preview/test templates
2. **Dynamic image variations**: Support for A/B testing different designs
3. **Analytics**: Track which images get generated most
4. **Localization**: Support for multiple languages in templates
5. **Advanced layouts**: More complex template options (grids, multiple images)
6. **Image optimization**: Automatic compression for even faster loading

### Scalability Considerations

Current design scales well, but if you hit limits:

- Move to dedicated image generation service (e.g., Cloudinary, Imgix)
- Implement background job queue for batch generation
- Add Redis cache layer for frequently requested images
- Consider pre-generating common variations

## Documentation for Team

### For Designers

When creating new OG image templates:

1. Design at 1200x630px (2:1 aspect ratio)
2. Use web-safe fonts or provide font files
3. Keep text large and readable (min 32px for body text)
4. Consider how design adapts to short vs. long titles
5. Provide color hex codes and exact spacing measurements

### For Developers

When implementing new templates:

1. Follow existing template structure in `lib/templates/`
2. Test with various content combinations
3. Use TypeScript types for all props
4. Add template to registry before deploying
5. Document template ID and usage in team docs

### For Project Managers

When onboarding new clients:

1. Request design assets from creative team
2. Developer implements template (1-2 hours)
3. Test template with sample blog posts
4. Add template ID to client's site configuration
5. Verify OG images render correctly when shared on social media

## Success Metrics

Track these to measure success:

- **Cost**: Should stay on free tier for most clients
- **Performance**: Sub-second generation time
- **Reliability**: 99%+ uptime (Vercel provides this)
- **Client satisfaction**: Easier than manual image creation
- **Time saved**: Estimate hours saved per month vs. manual process

## Conclusion

This service should significantly reduce time spent creating social share images while maintaining brand consistency across all client sites. The architecture is simple, cost-effective, and scalable.

Once Claude Code implements this, you'll have a production-ready service that can:

- Generate branded OG images automatically
- Support unlimited client templates
- Integrate easily with any CMS or static site
- Scale to hundreds of thousands of requests
- Cost nearly nothing to operate

The key is the template system - once the foundation is built, adding new clients is just a matter of creating a new template file and registering it.
