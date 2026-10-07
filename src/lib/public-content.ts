import { publicApi } from "@/lib/api";

export type PublicService = {
  id?: number;
  slug: string;
  name: string;
  serviceName?: string;
  serviceSlug?: string;
  image_url?: string;
  main_image_url?: string;
  short_description?: string;
  description?: string;
  blurb?: string;
  subs?: string[];
  products?: { id: number; name: string; slug: string; service_id: number }[];
};

export type PublicCategory = {
  id?: number;
  service_id?: number;
  slug: string;
  name: string;
  icon?: string;
  description?: string;
  image_url?: string;
  service_name?: string;
};

export type PublicProduct = {
  id?: number;
  service_id?: number;
  category_id?: number;
  slug: string;
  name: string;
  sku?: string;
  short_description?: string;
  description?: string;
  main_image_url?: string;
  image_url?: string;
  service_name?: string;
  serviceName?: string;
  serviceSlug?: string;
  category_name?: string;
  categoryName?: string;
};

export type PublicGalleryItem = {
  id?: number;
  cat?: string;
  category?: string;
  title: string;
  img?: string;
  image_url?: string;
  alt_text?: string;
  original_filename?: string;
};

export type PublicProductVariant = {
  items?: PublicProductVariant[];
  item_count?: number | null;
  id?: number;
  product_id?: number | null;
  label?: string;
  name?: string;
  sku?: string;
  detail?: string;
  description?: string;
  image_url?: string;
  colors?: string;
  sort_order?: number;
};

export type PublicIndustry = {
  id?: number;
  name: string;
  slug?: string;
  icon_url?: string;
  image_url?: string;
  short_description?: string;
};

export type PublicClient = {
  id?: number;
  name: string;
  logo_url?: string;
  website_url?: string;
};

export type PublicTestimonial = {
  id?: number;
  name?: string;
  role?: string;
  text?: string;
  client_name?: string;
  client_role?: string;
  company?: string;
  message?: string;
  rating?: number;
  testimonial?: string;
  designation?: string;
  company_name?: string;
  image_url?: string;
};

export type PublicBlog = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  publish_date?: string;
  featured_image_url?: string;
};

export const fetchPublicBlogs = () => publicApi<PublicBlog[]>("/blogs");
export const fetchPublicServices = () => publicApi<PublicService[]>("/services");
export const fetchPublicCategories = () => publicApi<PublicCategory[]>("/categories");
export const fetchPublicProducts = () => publicApi<PublicProduct[]>("/products");
export const fetchPublicGallery = () => publicApi<PublicGalleryItem[]>("/gallery");
export const fetchPublicIndustries = () => publicApi<PublicIndustry[]>("/industries");
export const fetchPublicClients = () => publicApi<PublicClient[]>("/clients");
export const fetchPublicTestimonials = () => publicApi<PublicTestimonial[]>("/testimonials");
export const fetchPublicProduct = (slug: string) =>
  publicApi<PublicProduct & { images?: PublicGalleryItem[]; variants?: PublicProductVariant[] }>(`/products/${slug}`);

export function submitPublicInquiry(payload: {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  service_id?: number;
  product_id?: number;
  product_name?: string;
  subject?: string;
  message?: string;
}) {
  return publicApi<{ id: number; message: string }>("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
