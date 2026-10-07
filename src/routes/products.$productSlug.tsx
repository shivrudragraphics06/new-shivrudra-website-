import { ImageIcon } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { assetUrl } from "@/lib/api";
import { findProductBySlug } from "@/lib/products";
import { Link } from "@/components/AppLink";
import { useEffect, useState } from "react";
import { fetchPublicProduct, type PublicGalleryItem, type PublicProduct, type PublicProductVariant } from "@/lib/public-content";
import { ImagePreviewDialog, ProductCard, ProductPlaceholder } from "@/components/catalog";

export function ProductNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-black">Product not found</h1>
      <Link to="/services" className="mt-4 inline-block font-bold text-brand-red">
        Back to services
      </Link>
    </div>
  );
}

export function ProductDetailPage({ productSlug, comboId }: { productSlug: string; comboId?: number }) {
  const [product, setProduct] = useState(() => findProductBySlug(productSlug));
  const [productDescription, setProductDescription] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [variants, setVariants] = useState<PublicProductVariant[]>([]);
  const [detailImages, setDetailImages] = useState<PublicGalleryItem[]>([]);
  const [failedDetailImages, setFailedDetailImages] = useState<Set<string>>(new Set());
  const [cmsProduct, setCmsProduct] = useState<PublicProduct | null>(null);
  const [previewImage, setPreviewImage] = useState<{ imageUrl: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fallbackProduct = findProductBySlug(productSlug);
    setProduct(fallbackProduct);
    setProductDescription("");
    setMainImageUrl("");
    setVariants([]);
    setDetailImages([]);
    setCmsProduct(null);
    setPreviewImage(null);
    setFailedDetailImages(new Set());
    fetchPublicProduct(productSlug)
      .then((item) => {
        setCmsProduct(item);
        setProduct({
          slug: item.slug,
          name: item.name,
          serviceSlug: item.serviceSlug || "",
          serviceName: item.serviceName || "Services",
        });
        setProductDescription(item.description || item.short_description || "");
        setMainImageUrl(item.main_image_url || "");
        setDetailImages(item.images || []);
        setVariants(item.variants || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productSlug]);

  if (loading) return <div className="container-page py-14 text-muted-foreground">Loading...</div>;
  if (!product) return <ProductNotFound />;
  const selectedCombo = comboId === undefined ? null : variants.find((variant) => variant.id === comboId);
  if (comboId !== undefined && !selectedCombo) return <ProductNotFound />;
  const isComboListing = productSlug === "corporate-gift-combo-sets" && comboId === undefined;
  const pageTitle = selectedCombo?.name || product.name;
  const galleryImages = detailImages.filter((image) => image.image_url && !failedDetailImages.has(image.image_url));
  const galleryItems = galleryImages.length
    ? galleryImages
    : mainImageUrl
      ? [{ id: 0, image_url: mainImageUrl, alt_text: product.name }]
      : [];
  const subProducts = (selectedCombo ? selectedCombo.items || [] : variants).map((variant) => ({
    id: cmsProduct?.id,
    variant_id: variant.id,
    item_count: variant.item_count,
    detailsPath: isComboListing ? `/products/${product.slug}/combos/${variant.id}` : undefined,
    slug: product.slug,
    name: variant.name || variant.label || "Sub Product",
    sku: variant.sku,
    short_description: variant.description || variant.detail,
    main_image_url: variant.image_url,
    image_url: variant.image_url,
    serviceName: product.serviceName,
    serviceSlug: product.serviceSlug,
    service_id: cmsProduct?.service_id,
    category_id: cmsProduct?.category_id,
    category_name: cmsProduct?.category_name || cmsProduct?.categoryName,
  }));

  return (
    <div>
      <PageHero
        title={pageTitle}
        subtitle={selectedCombo ? selectedCombo.description || "" : productDescription}
        breadcrumb={[
          { label: "Services", to: "/services" },
          { label: product.serviceName, to: `/services/${product.serviceSlug}` },
          ...(selectedCombo ? [{ label: product.name, to: `/products/${product.slug}` }, { label: pageTitle }] : [{ label: product.name }]),
        ]}
      />

      <section className="container-page py-14 md:py-18">
        {subProducts.length || selectedCombo ? (
          <div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">
                {subProducts.length} {selectedCombo ? "Products" : "Sub Products"}
              </p>
              <h2 className="mt-3 font-display text-4xl font-black leading-tight text-brand-dark md:text-5xl">
                {selectedCombo ? `${pageTitle} Products` : `${product.name} Sub Products`}
              </h2>
            </div>
            {!subProducts.length ? <p className="mt-8 text-muted-foreground">No products available yet.</p> : null}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {subProducts.map((subProduct) => (
                <ProductCard
                  key={subProduct.variant_id ?? subProduct.slug}
                  product={subProduct}
                  onEnquire={() => undefined}
                  imageFit="contain"
                  size="large"
                />
              ))}
            </div>
          </div>
        ) : null}

        {!selectedCombo ? <div className={subProducts.length ? "mt-16" : ""}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-red">
                {galleryItems.length} Client Mockup {galleryItems.length === 1 ? "Image" : "Images"}
              </p>
              <h2 className="mt-3 font-display text-4xl font-black leading-tight text-brand-dark md:text-5xl">
                Product Gallery
              </h2>
            </div>
          </div>

          {galleryItems.length ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleryItems.map((image, index) => (
                <article key={image.id ?? `${image.image_url}-${index}`} className="text-center">
                  <button
                    type="button"
                    className="group block w-full overflow-hidden rounded-xl border border-border bg-white p-3 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-brand-red hover:shadow-lg"
                    onClick={() => image.image_url && setPreviewImage({ imageUrl: image.image_url, title: galleryImageTitle(image, product.name) })}
                  >
                    <img
                      src={assetUrl(image.image_url)}
                      alt={image.alt_text || product.name}
                      className="aspect-square w-full rounded-lg bg-white object-contain transition duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                      onError={() => {
                        if (!image.image_url) return;
                        setFailedDetailImages((current) => new Set(current).add(image.image_url || ""));
                      }}
                    />
                  </button>
                  <h3 className="mt-5 font-display text-xl font-black text-brand-dark">
                    {galleryImageTitle(image, product.name)}
                  </h3>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-xl border border-dashed border-border bg-white p-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-red-50 text-brand-red">
                <ImageIcon className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-display text-xl font-black text-brand-dark">No gallery images yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add client mockup designs from Admin Panel &gt; Products &gt; Edit Product &gt; Product Gallery / Client Mockups.
              </p>
            </div>
          )}
        </div> : null}

        {!galleryItems.length && mainImageUrl ? (
          <div className="mt-10 overflow-hidden rounded-lg border border-border bg-white shadow-soft">
            <div className="aspect-[16/9] bg-brand-light">
              <ProductPlaceholder name={product.name} />
            </div>
          </div>
        ) : null}

      </section>
      {previewImage ? (
        <ImagePreviewDialog imageUrl={previewImage.imageUrl} title={previewImage.title} onClose={() => setPreviewImage(null)} />
      ) : null}
    </div>
  );
}

function galleryImageTitle(image: PublicGalleryItem, fallback: string) {
  const title = image.alt_text || image.title || image.original_filename || fallback;
  return title
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
