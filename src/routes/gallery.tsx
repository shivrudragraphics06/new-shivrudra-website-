import { PageHero } from "@/components/PageHero";
import { ProductGallerySection } from "@/components/ProductGallerySection";

export function GalleryPage() {
  return (
    <div>
      <PageHero
        title="Product Gallery"
        subtitle="Click below to enlarge the images."
        breadcrumb={[{ label: "Gallery" }]}
      />
      <ProductGallerySection showFilters />
    </div>
  );
}
