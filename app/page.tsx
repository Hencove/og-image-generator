'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { getTemplateIds } from '@/lib/templates';

export default function Home() {
  const [templateId, setTemplateId] = useState('default');
  const [title, setTitle] = useState('How to Build Better Websites');
  const [subtitle, setSubtitle] = useState('A comprehensive guide');
  const [author, setAuthor] = useState('John Doe');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  // Get available templates - computed once on initial render
  const availableTemplates = useMemo(() => getTemplateIds(), []);

  // Compute image URL from current form values
  const imageUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('template', templateId);
    params.set('title', title);
    if (subtitle) params.set('subtitle', subtitle);
    if (author) params.set('author', author);
    if (date) params.set('date', date);
    if (category) params.set('category', category);

    return `/api/og?${params.toString()}`;
  }, [templateId, title, subtitle, author, date, category]);

  const copyUrl = () => {
    const fullUrl = `${window.location.origin}${imageUrl}`;
    navigator.clipboard.writeText(fullUrl);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-hencove-white dark:bg-hencove-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-lora text-6xl font-normal text-hencove-black dark:text-hencove-white">
            OG Image Generator
          </h1>
          <p className="mt-2 font-manrope text-2xl font-light text-hencove-black dark:text-hencove-white">
            Preview and test your Open Graph image templates
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h2 className="mb-4 font-manrope text-2xl font-bold text-hencove-black dark:text-hencove-white">
              Image Parameters
            </h2>

            <form className="space-y-4">
              {/* Template Selection */}
              <div>
                <label
                  htmlFor="template"
                  className="block font-manrope text-base font-bold text-hencove-black dark:text-hencove-white"
                >
                  Template
                </label>
                <select
                  id="template"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-hencove-black bg-white px-3 py-2 font-manrope text-base text-hencove-black shadow-sm focus:border-hencove-blue focus:outline-none focus:ring-1 focus:ring-hencove-blue dark:border-zinc-600 dark:bg-zinc-700 dark:text-hencove-white"
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
                  className="block font-manrope text-base font-bold text-hencove-black dark:text-hencove-white"
                >
                  Title <span className="text-hencove-pink">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter image title"
                  required
                  className="mt-1 block w-full rounded-md border border-hencove-black bg-white px-3 py-2 font-manrope text-base text-hencove-black shadow-sm focus:border-hencove-blue focus:outline-none focus:ring-1 focus:ring-hencove-blue dark:border-zinc-600 dark:bg-zinc-700 dark:text-hencove-white dark:placeholder:text-zinc-400"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label
                  htmlFor="subtitle"
                  className="block font-manrope text-base font-bold text-hencove-black dark:text-hencove-white"
                >
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Optional subtitle"
                  className="mt-1 block w-full rounded-md border border-hencove-black bg-white px-3 py-2 font-manrope text-base text-hencove-black shadow-sm focus:border-hencove-blue focus:outline-none focus:ring-1 focus:ring-hencove-blue dark:border-zinc-600 dark:bg-zinc-700 dark:text-hencove-white dark:placeholder:text-zinc-400"
                />
              </div>

              {/* Author Input */}
              <div>
                <label
                  htmlFor="author"
                  className="block font-manrope text-base font-bold text-hencove-black dark:text-hencove-white"
                >
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="mt-1 block w-full rounded-md border border-hencove-black bg-white px-3 py-2 font-manrope text-base text-hencove-black shadow-sm focus:border-hencove-blue focus:outline-none focus:ring-1 focus:ring-hencove-blue dark:border-zinc-600 dark:bg-zinc-700 dark:text-hencove-white dark:placeholder:text-zinc-400"
                />
              </div>

              {/* Date Input */}
              <div>
                <label
                  htmlFor="date"
                  className="block font-manrope text-base font-bold text-hencove-black dark:text-hencove-white"
                >
                  Date
                </label>
                <input
                  type="text"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g., January 13, 2026"
                  className="mt-1 block w-full rounded-md border border-hencove-black bg-white px-3 py-2 font-manrope text-base text-hencove-black shadow-sm focus:border-hencove-blue focus:outline-none focus:ring-1 focus:ring-hencove-blue dark:border-zinc-600 dark:bg-zinc-700 dark:text-hencove-white dark:placeholder:text-zinc-400"
                />
              </div>

              {/* Category Input */}
              <div>
                <label
                  htmlFor="category"
                  className="block font-manrope text-base font-bold text-hencove-black dark:text-hencove-white"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Tutorial"
                  className="mt-1 block w-full rounded-md border border-hencove-black bg-white px-3 py-2 font-manrope text-base text-hencove-black shadow-sm focus:border-hencove-blue focus:outline-none focus:ring-1 focus:ring-hencove-blue dark:border-zinc-600 dark:bg-zinc-700 dark:text-hencove-white dark:placeholder:text-zinc-400"
                />
              </div>

              {/* Copy URL Button */}
              <button
                type="button"
                onClick={copyUrl}
                className="w-full rounded-[10px] border-2 border-hencove-black bg-hencove-black px-4 py-2 font-manrope text-lg text-hencove-white transition-colors hover:border-hencove-blue hover:bg-hencove-blue focus:outline-none focus:ring-2 focus:ring-hencove-blue focus:ring-offset-2"
              >
                Copy Image URL
              </button>
            </form>

            {/* URL Display */}
            <div className="mt-4">
              <label className="block font-manrope text-base font-bold text-hencove-black dark:text-hencove-white">
                Generated URL
              </label>
              <code className="mt-1 block overflow-x-auto rounded bg-hencove-tan p-2 font-manrope text-xs text-hencove-black dark:bg-zinc-700 dark:text-hencove-white">
                {imageUrl}
              </code>
            </div>
          </div>

          {/* Preview Section */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h2 className="mb-4 font-manrope text-2xl font-bold text-hencove-black dark:text-hencove-white">
              Preview
            </h2>

            <div className="overflow-hidden rounded-lg border-2 border-hencove-black dark:border-zinc-600">
              {title && imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="OG Image Preview"
                  width={1200}
                  height={630}
                  className="w-full"
                  unoptimized
                />
              ) : (
                <div
                  className="flex items-center justify-center bg-hencove-tan font-manrope text-base text-hencove-black dark:bg-zinc-700 dark:text-hencove-white"
                  style={{ aspectRatio: '1200/630' }}
                >
                  Enter a title to see preview
                </div>
              )}
            </div>

            <div className="mt-4 font-manrope text-xs text-hencove-black dark:text-zinc-400">
              <p>Dimensions: 1200 × 630 pixels</p>
              <p className="mt-1">Format: PNG</p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-800">
          <h2 className="mb-4 font-manrope text-2xl font-bold text-hencove-black dark:text-hencove-white">
            How to Use
          </h2>

          <div className="space-y-4">
            <p className="font-manrope text-base text-hencove-black dark:text-hencove-white">
              To use these OG images on your website, add the following meta
              tags to your HTML{' '}
              <code className="rounded bg-hencove-tan px-1 py-0.5 font-manrope text-xs dark:bg-zinc-700">
                &lt;head&gt;
              </code>
              :
            </p>

            <pre className="overflow-x-auto rounded bg-hencove-tan p-4 font-manrope text-xs text-hencove-black dark:bg-zinc-700 dark:text-hencove-white">
              {`<meta property="og:image" content="YOUR_IMAGE_URL" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="YOUR_IMAGE_URL" />`}
            </pre>

            <p className="font-manrope text-base text-hencove-black dark:text-hencove-white">
              Replace{' '}
              <code className="rounded bg-hencove-tan px-1 py-0.5 font-manrope text-xs dark:bg-zinc-700">
                YOUR_IMAGE_URL
              </code>{' '}
              with the full URL from the &ldquo;Generated URL&rdquo; section
              above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
