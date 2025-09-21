import type { NextConfig } from "next";
const NEXT_PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const nextConfig: NextConfig = {
  // 注释掉 output: "export" 以启用开发代理功能
  // output: "export",

  // 根据环境变量设置 basePath，支持 nginx 前缀代理
  basePath: NEXT_PUBLIC_BASE_PATH,

  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle canvas dependency for Konva
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
      };
    }
    
    // Ignore canvas module in client-side bundles
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
    });

    return config;
  },
};

export default nextConfig;
