import { SERVICES } from "@/data/site";

export type ProductInfo = {
  slug: string;
  name: string;
  serviceSlug: string;
  serviceName: string;
};

export function toProductSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getAllProducts(): ProductInfo[] {
  return SERVICES.flatMap((service) =>
    service.subs.map((sub) => ({
      slug: toProductSlug(sub),
      name: sub,
      serviceSlug: service.slug,
      serviceName: service.name,
    })),
  );
}

export function findProductBySlug(slug: string) {
  return getAllProducts().find((product) => product.slug === slug);
}
