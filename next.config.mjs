/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export -> upload the contents of ./out to Hostinger public_html
  output: 'export',

  // Emits out/<slug>/index.html, which Apache/LiteSpeed serves natively with
  // no rewrite rules. Canonicals and sitemap URLs must carry the same
  // trailing slash or they will disagree with the real URL.
  trailingSlash: true,

  // Required by output: 'export' — the next/image optimizer needs a running
  // server. AVIF/WebP + srcset are pre-generated at build time instead by
  // scripts/optimize-images.mjs and consumed by components/SmartImage.tsx.
  images: { unoptimized: true },

  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
};

export default nextConfig;
