import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack workspace root to this directory.
  // Without this, Next 16 detects C:\Users\Didico\package-lock.json (orphan
  // outside the project) as the workspace root and resolves modules from
  // the wrong node_modules — which makes /offer-book/* (and any nested
  // client-component route) render an empty <main> + a 404 RSC fallback.
  // See: dev server warning "We detected multiple lockfiles".
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
