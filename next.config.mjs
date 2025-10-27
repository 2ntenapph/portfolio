const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const explicitBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();

const basePath = explicitBasePath
  ? explicitBasePath.startsWith("/")
    ? explicitBasePath
    : `/${explicitBasePath}`
  : isGitHubPages && repository
    ? `/${repository}`
    : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath || undefined
};

export default nextConfig;
