import type { MetadataRoute } from "next";
import { AS_OF } from "@/data/series";

const SITE = "https://pricinghistory.onedaybuilt.com";

/* One page, one entry. lastModified is the corpus date, not the build date —
   the page is only meaningfully new when the prices behind it change. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE, lastModified: new Date(AS_OF), changeFrequency: "monthly", priority: 1 }];
}
