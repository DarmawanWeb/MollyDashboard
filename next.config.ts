import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // A self-contained server for the Docker image (docker-compose.yml).
  output: "standalone",
};

export default nextConfig;
