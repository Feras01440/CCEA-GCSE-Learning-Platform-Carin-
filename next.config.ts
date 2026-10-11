import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Next 16 writes AGENTS.md and CLAUDE.md into the repository root when the dev server starts (its agent rules). Those
  // files would be read as this project's own instructions by every assistant session, so they are not generated (11 Oct 2026).
  agentRules: false,
};

export default nextConfig;
