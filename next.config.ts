import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compress responses
  compress: true,
  
  // Generate source maps for production debugging
  productionBrowserSourceMaps: false,
  
  // Disable powered by header for security
  poweredByHeader: false,
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'framer-motion'
    ],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack optimizations in production
    if (!dev && !isServer) {
      // Optimize bundle size
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
