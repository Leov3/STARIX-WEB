import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.1.14", "192.168.1.17", "*.loca.lt"],
};

export default nextConfig;
