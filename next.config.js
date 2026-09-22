/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages serves this as a plain folder of files, so everything has to be
  // pre-rendered at build time. No API routes, no middleware, no server data
  // fetching, no request-time image optimization: static export breaks all of them.
  output: 'export',
  images: { unoptimized: true },

  // No basePath. The site serves from the root of cairnetint.com, not from a
  // /repo-name subpath, so adding one would break every asset URL.

  // Pages Emit index.html inside a folder per route, so /foo serves /foo/index.html.
  trailingSlash: true,

  reactStrictMode: true,
};

module.exports = nextConfig;
