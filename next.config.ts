/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "event-platform-banners.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "event-platform-banners.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
