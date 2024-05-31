/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  redirects: async () => {
    return [{ source: '/', destination: '/realms', permanent: false }];
  },
};

module.exports = nextConfig;
