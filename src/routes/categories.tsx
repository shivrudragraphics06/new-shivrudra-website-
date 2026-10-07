import { PageHero } from "@/components/PageHero";
import { CATEGORIES, SERVICES } from "@/data/site";
import {
  ArrowRight,
  Sparkles,
  Printer,
  Factory,
  Building2,
  Lightbulb,
  Signpost,
  Package,
  Gift,
  Car,
  ShieldAlert,
  Monitor,
  Layers,
} from "lucide-react";
import { Link } from "@/components/AppLink";
import { useEffect, useState } from "react";
import {
  fetchPublicCategories,
  fetchPublicServices,
  type PublicCategory,
  type PublicService,
} from "@/lib/public-content";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Printer,
  Factory,
  Building2,
  Lightbulb,
  Signpost,
  Package,
  Gift,
  Car,
  ShieldAlert,
  Monitor,
  Layers,
  Sparkles,
};

const CATEGORY_SERVICE_SLUGS: Record<string, string[]> = {
  "commercial-printing": ["digital-printing", "offset-printing", "flex-printing", "uv-printing"],
  "industrial-printing": [
    "screen-printing",
    "industrial-name-plates",
    "engraving-marking",
    "laser-cnc-cutting",
  ],
  "corporate-branding": ["designing", "vinyl-printing", "signage", "badge-dome-printing"],
  "led-sign-boards": ["signage", "laser-cnc-cutting", "uv-printing", "vinyl-printing"],
  signages: ["signage", "safety-signages", "laser-cnc-cutting", "vinyl-printing"],
  "packaging-labels": ["digital-printing", "offset-printing", "screen-printing", "uv-printing"],
  "corporate-gifts": ["corporate-gift", "keychain", "bag-printing", "photo-frame", "stamp"],
  "vehicle-branding": ["vinyl-printing", "flex-printing", "designing", "uv-printing"],
  "safety-signages": ["safety-signages", "signage", "vinyl-printing", "digital-printing"],
  "digital-printing": ["digital-printing", "uv-printing", "vinyl-printing", "badge-dome-printing"],
  "offset-printing": ["offset-printing", "digital-printing", "screen-printing", "bag-printing"],
  "custom-branding": ["designing", "signage", "corporate-gift", "engraving-marking", "keychain"],
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<PublicCategory[]>(CATEGORIES);
  const [services, setServices] = useState<PublicService[]>(SERVICES);

  useEffect(() => {
    fetchPublicCategories()
      .then((items) => {
        if (items.length) setCategories(items);
      })
      .catch(() => {});
    fetchPublicServices()
      .then((items) => {
        if (items.length) setServices(items);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <PageHero
        title="Browse by Category"
        subtitle="Find exactly what you need across our printing, signage and branding categories."
        breadcrumb={[{ label: "Categories" }]}
      />
      <section className="py-16 container-page">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => {
            const Icon = ICONS[c.icon || ""] ?? Sparkles;
            const related = (CATEGORY_SERVICE_SLUGS[c.slug] ?? [])
              .map((slug) => services.find((service) => service.slug === slug))
              .filter((service): service is PublicService => Boolean(service));

            return (
              <div
                key={c.slug}
                className="group p-6 rounded-2xl bg-white border border-border shadow-soft hover:border-brand-red transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-xl gradient-brand text-white shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg">{c.name}</div>
                    <div className="text-xs text-muted-foreground">Premium quality</div>
                  </div>
                </div>
                <div className="mt-5 space-y-1">
                  {related.map((s) => (
                    <Link
                      key={s.slug}
                      to="/services/$slug"
                      params={{ slug: s.slug }}
                      className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-brand-light text-sm"
                    >
                      <span>{s.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-brand-red" />
                    </Link>
                  ))}
                </div>
                <Link
                  to="/services"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-red"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
