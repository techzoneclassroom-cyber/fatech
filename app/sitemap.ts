import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { CATEGORIES } from "@/lib/catalogue";
import { getProducts } from "@/lib/products";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pages = [
    "/",
    "/shop",
    "/services",
    "/software",
    "/courses",
    "/about",
    "/contact",
    "/quote",
    "/import",
    "/repair",
    "/cart",
    "/faq",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/policies/terms",
    "/policies/cookies",
  ];

  return [
    ...pages.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "/" || path === "/shop" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.6,
    })),
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/shop?cat=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
