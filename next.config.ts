import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const pwaOptions: any = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
};

const withPWA = withPWAInit(pwaOptions);

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
