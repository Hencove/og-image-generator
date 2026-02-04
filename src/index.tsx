import { ImageResponse } from '@cloudflare/pages-plugin-vercel-og/api';
import { getTemplate, getTemplateIds } from './lib/templates';

export interface Env {
  DEMO_PASSWORD?: string;
  ALLOWED_DOMAINS?: string;
}

/**
 * Load a Google Font for use in OG image generation
 */
async function loadGoogleFont(
  font: string,
  weight: number = 400,
): Promise<ArrayBuffer> {
  // URL encode font name (e.g., "Darker Grotesque" -> "Darker+Grotesque")
  const encodedFont = font.replace(/ /g, '+');
  // Fetch full font (no text subset) for reliability
  const url = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@${weight}`;

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
 * Validate that the request comes from an allowed domain
 */
function isAllowedDomain(request: Request, env: Env): boolean {
  const allowedDomains = env.ALLOWED_DOMAINS;

  if (!allowedDomains || allowedDomains.trim() === '') {
    return true;
  }

  const domains = allowedDomains.split(',').map((d) => d.trim().toLowerCase());

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererHost = new URL(referer).hostname.toLowerCase();
      if (
        domains.some(
          (domain) =>
            refererHost === domain || refererHost.endsWith(`.${domain}`),
        )
      ) {
        return true;
      }
    } catch {
      // Invalid URL
    }
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).hostname.toLowerCase();
      if (
        domains.some(
          (domain) =>
            originHost === domain || originHost.endsWith(`.${domain}`),
        )
      ) {
        return true;
      }
    } catch {
      // Invalid URL
    }
  }

  return false;
}

/**
 * Validate HTTP Basic Auth
 */
function validateBasicAuth(
  request: Request,
  password: string,
): Response | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Demo Page"',
      },
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = atob(base64Credentials);
  const [, providedPassword] = credentials.split(':');

  if (providedPassword !== password) {
    return new Response('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Demo Page"',
      },
    });
  }

  return null;
}

/**
 * Handle OG image generation
 */
async function handleOgRequest(request: Request, env: Env): Promise<Response> {
  try {
    if (!isAllowedDomain(request, env)) {
      return new Response('Access denied: Domain not allowed', { status: 403 });
    }

    const url = new URL(request.url);
    const templateId = url.searchParams.get('template') || 'default';
    const title = url.searchParams.get('title');
    const subtitle = url.searchParams.get('subtitle') || undefined;
    const author = url.searchParams.get('author') || undefined;
    const date = url.searchParams.get('date') || undefined;
    const category = url.searchParams.get('category') || undefined;

    if (!title) {
      return new Response('Missing required parameter: title', { status: 400 });
    }

    const maxTitleLength = 200;
    const sanitizedTitle =
      title.length > maxTitleLength
        ? title.substring(0, maxTitleLength) + '...'
        : title;

    const template = getTemplate(templateId);
    const TemplateComponent = template.default;

    // Load fonts if template specifies them
    const fonts: {
      name: string;
      data: ArrayBuffer;
      weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    }[] = [];

    if (template.config.fonts) {
      for (const fontConfig of template.config.fonts) {
        const weights = fontConfig.weights || [400];
        for (const weight of weights) {
          try {
            const fontData = await loadGoogleFont(fontConfig.name, weight);
            fonts.push({
              name: fontConfig.name,
              data: fontData,
              weight: weight as
                | 100
                | 200
                | 300
                | 400
                | 500
                | 600
                | 700
                | 800
                | 900,
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

/**
 * Generate demo page HTML
 */
function getDemoPageHtml(): string {
  const templates = getTemplateIds();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OG Image Generator</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .subtitle { color: #64748b; margin-bottom: 2rem; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    label { font-weight: 500; font-size: 0.875rem; }
    input, select {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 1rem;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover { background: #2563eb; }
    .preview-container {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .preview-header h2 { font-size: 1.25rem; }
    .dimensions { color: #64748b; font-size: 0.875rem; }
    .preview-image {
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }
    .url-container {
      margin-top: 1rem;
      padding: 1rem;
      background: #f1f5f9;
      border-radius: 0.5rem;
      display: flex;
      gap: 0.5rem;
    }
    .url-input {
      flex: 1;
      font-family: monospace;
      font-size: 0.875rem;
      background: white;
    }
    .copy-btn {
      background: #64748b;
      padding: 0.5rem 1rem;
    }
    .copy-btn:hover { background: #475569; }
  </style>
</head>
<body>
  <h1>OG Image Generator</h1>
  <p class="subtitle">Generate dynamic Open Graph images for social sharing</p>

  <div class="form-grid">
    <div class="form-group">
      <label for="template">Template</label>
      <select id="template">
        ${templates.map((t) => `<option value="${t}">${t}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="title">Title *</label>
      <input type="text" id="title" placeholder="Enter title..." value="Welcome to Our Platform">
    </div>
    <div class="form-group">
      <label for="subtitle">Subtitle</label>
      <input type="text" id="subtitle" placeholder="Optional subtitle...">
    </div>
    <div class="form-group">
      <label for="author">Author</label>
      <input type="text" id="author" placeholder="Author name...">
    </div>
    <div class="form-group">
      <label for="date">Date</label>
      <input type="text" id="date" placeholder="e.g., January 2024">
    </div>
    <div class="form-group">
      <label for="category">Category</label>
      <input type="text" id="category" placeholder="e.g., Blog, News, Case Study">
    </div>
  </div>

  <button onclick="generateImage()">Generate Preview</button>

  <div class="preview-container" style="margin-top: 2rem;">
    <div class="preview-header">
      <h2>Preview</h2>
      <span class="dimensions">1200 x 630 px</span>
    </div>
    <img id="preview" class="preview-image" alt="OG Image Preview">
    <div class="url-container">
      <input type="text" id="url" class="url-input" readonly>
      <button class="copy-btn" onclick="copyUrl()">Copy</button>
    </div>
  </div>

  <script>
    function generateImage() {
      const params = new URLSearchParams();
      params.set('template', document.getElementById('template').value);
      params.set('title', document.getElementById('title').value);

      const subtitle = document.getElementById('subtitle').value;
      if (subtitle) params.set('subtitle', subtitle);

      const author = document.getElementById('author').value;
      if (author) params.set('author', author);

      const date = document.getElementById('date').value;
      if (date) params.set('date', date);

      const category = document.getElementById('category').value;
      if (category) params.set('category', category);

      const url = '/api/og?' + params.toString();
      document.getElementById('preview').src = url;
      document.getElementById('url').value = window.location.origin + url;
    }

    function copyUrl() {
      const urlInput = document.getElementById('url');
      urlInput.select();
      document.execCommand('copy');
      alert('URL copied to clipboard!');
    }

    // Generate initial preview
    generateImage();
  </script>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle OG image requests
    if (url.pathname === '/api/og' || url.pathname === '/og') {
      return handleOgRequest(request, env);
    }

    // Handle demo page
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // Check for password protection
      if (env.DEMO_PASSWORD) {
        const authResult = validateBasicAuth(request, env.DEMO_PASSWORD);
        if (authResult) return authResult;
      }

      return new Response(getDemoPageHtml(), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
