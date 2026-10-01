import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      // 旧URL(/characters)を国際標準の /heroes へ恒久移動
      { source: "/characters", destination: "/heroes", permanent: true },
      { source: "/characters/:slug", destination: "/heroes/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
