import type { MetadataRoute } from "next";

const SITE = "https://pricinghistory.onedaybuilt.com";

/* The whole point of the page is to be read and checked, so nothing is
   disallowed except the two API routes, which return an image and a counter
   and are worthless in an index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
