const PRODUCTION_SITE_URL = "https://amadergaibandha.vercel.app";

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return new URL(configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`);
  }

  // Keep production metadata correct even before the Vercel env var is added.
  if (process.env.NODE_ENV === "production") {
    return new URL(`${PRODUCTION_SITE_URL}/`);
  }

  return new URL("http://localhost:3000/");
}
