/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/relay-4Hyx/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay-4Hyx/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};
