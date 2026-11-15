export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return new URL(configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`);
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) {
    return new URL(`https://${vercelProductionUrl}/`);
  }

  return new URL("http://localhost:3000/");
}
