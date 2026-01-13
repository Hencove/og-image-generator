'use client';

import { useState, useEffect } from 'react';
import { getTemplateIds } from '@/lib/templates';

export default function Home() {
  const [templateId, setTemplateId] = useState('default');
  const [title, setTitle] = useState('How to Build Better Websites');
  const [subtitle, setSubtitle] = useState('A comprehensive guide');
  const [author, setAuthor] = useState('John Doe');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);

  // Get available templates on mount
  useEffect(() => {
    const templates = getTemplateIds();
    setAvailableTemplates(templates);
  }, []);

  // Update image URL when form values change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('template', templateId);
    params.set('title', title);
    if (subtitle) params.set('subtitle', subtitle);
    if (author) params.set('author', author);
    if (date) params.set('date', date);
    if (category) params.set('category', category);

    setImageUrl(`/api/og?${params.toString()}`);
  }, [templateId, title, subtitle, author, date, category]);

  const copyUrl = () => {
    const fullUrl = `${window.location.origin}${imageUrl}`;
    navigator.clipboard.writeText(fullUrl);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            OG Image Generator
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Preview and test your Open Graph image templates
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Image Parameters
            </h2>

            <form className="space-y-4">
              {/* Template Selection */}
              <div>
                <label
                  htmlFor="template"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Template
                </label>
                <select
                  id="template"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {availableTemplates.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter image title"
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label
                  htmlFor="subtitle"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Optional subtitle"
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Author Input */}
              <div>
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Date Input */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Date
                </label>
                <input
                  type="text"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g., January 13, 2026"
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Category Input */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Tutorial"
                  className="mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {/* Copy URL Button */}
              <button
                type="button"
                onClick={copyUrl}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Copy Image URL
              </button>
            </form>

            {/* URL Display */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Generated URL
              </label>
              <code className="mt-1 block overflow-x-auto rounded bg-zinc-100 p-2 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {imageUrl}
              </code>
            </div>
          </div>

          {/* Preview Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Preview
            </h2>

            <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              {title && imageUrl ? (
                <img
                  src={imageUrl}
                  alt="OG Image Preview"
                  className="w-full"
                  style={{ aspectRatio: '1200/630' }}
                />
              ) : (
                <div
                  className="flex items-center justify-center bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  style={{ aspectRatio: '1200/630' }}
                >
                  Enter a title to see preview
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              <p>Dimensions: 1200 × 630 pixels</p>
              <p className="mt-1">Format: PNG</p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            How to Use
          </h2>

          <div className="prose prose-zinc dark:prose-invert">
            <p>
              To use these OG images on your website, add the following meta
              tags to your HTML <code>&lt;head&gt;</code>:
            </p>

            <pre className="overflow-x-auto rounded bg-zinc-100 p-4 text-sm dark:bg-zinc-800">
              {`<meta property="og:image" content="YOUR_IMAGE_URL" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="YOUR_IMAGE_URL" />`}
            </pre>

            <p>
              Replace <code>YOUR_IMAGE_URL</code> with the full URL from the
              "Generated URL" section above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
