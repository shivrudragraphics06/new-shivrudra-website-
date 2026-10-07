import { ArrowRight, Phone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Link } from "@/components/AppLink";
import { EnquiryModal, ProductGrid } from "@/components/catalog";
import { PageHero } from "@/components/PageHero";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { CONTACT, SERVICES } from "@/data/site";
import {
  fetchPublicCategories,
  fetchPublicProducts,
  fetchPublicServices,
  type PublicCategory,
  type PublicProduct,
  type PublicService,
} from "@/lib/public-content";

export function ServiceNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display font-black text-3xl">Service not found</h1>
      <Link to="/services" className="mt-4 inline-block text-brand-red">
        Back to services
      </Link>
    </div>
  );
}

export function ServiceDetail({ slug }: { slug: string }) {
  const { services, categories, products, loading } = useCatalogData();
  const [enquiryProduct, setEnquiryProduct] = useState<PublicProduct | null>(null);
  const svc = services.find((service) => service.slug === slug);

  if (!svc && !loading) return <ServiceNotFound />;
  const service = svc ?? SERVICES.find((item) => item.slug === slug);
  if (!service) return <ServiceNotFound />;

  const serviceProducts = products.filter((product) => product.service_id === service.id);
  const others = services.filter((item) => item.slug !== service.slug).slice(0, 6);

  return (
    <div>
      <PageHero
        title={service.name}
        subtitle={service.blurb || service.short_description || ""}
        breadcrumb={[{ label: "Services", to: "/services" }, { label: service.name }]}
      />

      <section className="container-page py-16">
        <div>
          <h2 className="font-display text-3xl font-black text-brand-dark md:text-4xl">
            What we offer in {service.name}
          </h2>
          <p className="mt-3 max-w-5xl text-base leading-7 text-muted-foreground">
            Explore our full range of {service.name.toLowerCase()} solutions. Each product is crafted with premium materials and delivered on time.
          </p>
          <div className="mt-9">
            <ProductGrid
              products={serviceProducts}
              loading={loading}
              emptyText="No products available in this service yet."
              onEnquire={setEnquiryProduct}
            />
          </div>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl gradient-brand p-8 text-white shadow-brand md:p-10">
            <div className="font-display text-3xl font-black">Need a quote?</div>
            <p className="mt-4 text-base font-semibold text-white/90">Get a tailored quote for your {service.name.toLowerCase()} requirement.</p>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=Hi,%20I%20need%20a%20quote%20for%20${encodeURIComponent(service.name)}`}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-brand-red"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp Quote
            </a>
            <a
              href={`tel:${CONTACT.phones[0].replace(/\s/g, "")}`}
              className="ml-0 mt-3 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-black text-brand-dark sm:ml-3 sm:mt-0"
            >
              <Phone className="h-4 w-4" /> Call Now
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-white p-8 md:p-10">
            <div className="font-display text-xl font-black">Other Services</div>
            <div className="mt-5 space-y-1">
              {others.map((item) => (
                <Link
                  key={item.slug}
                  to="/services/$slug"
                  params={{ slug: item.slug }}
                  className="flex items-center justify-between rounded px-3 py-2.5 text-base text-brand-dark hover:bg-brand-light"
                >
                  <span>{item.name}</span>
                  <ArrowRight className="h-4 w-4 text-brand-red" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal product={enquiryProduct} onClose={() => setEnquiryProduct(null)} />
    </div>
  );
}

export function CategoryProductsPage({ serviceSlug, categorySlug }: { serviceSlug: string; categorySlug: string }) {
  const { services, categories, products, loading } = useCatalogData();
  const [enquiryProduct, setEnquiryProduct] = useState<PublicProduct | null>(null);
  const service = services.find((item) => item.slug === serviceSlug);
  const category = categories.find((item) => item.slug === categorySlug && (!service?.id || item.service_id === service.id));

  if (!service && !loading) return <ServiceNotFound />;

  const categoryProducts = products.filter((product) => product.category_id === category?.id);
  const title = category?.name || "Products";

  return (
    <div>
      <PageHero
        title={title}
        subtitle={category?.description || "Browse available products and send a quick enquiry."}
        breadcrumb={[
          { label: "Services", to: "/services" },
          { label: service?.name || "Service", to: `/services/${serviceSlug}` },
          { label: title },
        ]}
      />
      <section className="container-page py-16">
        <ProductGrid products={categoryProducts} loading={loading} onEnquire={setEnquiryProduct} />
      </section>
      <EnquiryModal product={enquiryProduct} onClose={() => setEnquiryProduct(null)} />
    </div>
  );
}

function useCatalogData() {
  const [services, setServices] = useState<PublicService[]>(SERVICES);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchPublicServices(), fetchPublicCategories(), fetchPublicProducts()])
      .then(([serviceRows, categoryRows, productRows]) => {
        if (!active) return;
        if (serviceRows.length) setServices(serviceRows);
        setCategories(categoryRows);
        setProducts(productRows);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => ({ services, categories, products, loading }), [services, categories, products, loading]);
}
