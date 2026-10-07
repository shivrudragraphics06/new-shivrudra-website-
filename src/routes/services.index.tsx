import { PageHero } from "@/components/PageHero";
import { SERVICES } from "@/data/site";
import { ArrowRight } from "lucide-react";
import { Link } from "@/components/AppLink";
import { useEffect, useState } from "react";
import { fetchPublicServices, type PublicService } from "@/lib/public-content";

export function ServicesPage() {
  const [services, setServices] = useState<PublicService[]>(SERVICES);

  useEffect(() => {
    fetchPublicServices()
      .then((items) => {
        if (items.length) setServices(items);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <PageHero
        title="Our Services"
        subtitle="From designing to installation — complete printing and signage solutions for every need."
        breadcrumb={[{ label: "Services" }]}
      />
      <section className="py-16 container-page">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 hover:border-brand-red transition shadow-soft"
            >
              <div className="absolute top-0 right-0 h-24 w-24 gradient-brand opacity-5 rounded-bl-full group-hover:opacity-20 transition" />
              <div className="font-display font-bold text-lg group-hover:text-brand-red transition">
                {s.name}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.blurb || s.short_description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(s.subs ?? []).slice(0, 4).map((sub) => (
                  <span
                    key={sub}
                    className="text-[11px] font-medium bg-brand-light px-2 py-0.5 rounded-full"
                  >
                    {sub}
                  </span>
                ))}
                {(s.subs ?? []).length > 4 && (
                  <span className="text-[11px] font-medium text-brand-red">
                    +{(s.subs ?? []).length - 4}
                  </span>
                )}
              </div>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-red">
                View Details <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
