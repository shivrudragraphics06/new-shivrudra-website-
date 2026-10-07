import { ArrowRight, ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CONTACT } from "@/data/site";
import { Link } from "@/components/AppLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const LOGO_TYPES = [
  {
    name: "Minimal Logos",
    colors: "from-white via-[#f7f7f7] to-[#ffe9e9]",
    mark: "M",
  },
  {
    name: "Typography Logos",
    colors: "from-[#fff7d1] via-white to-[#ffe2df]",
    mark: "Aa",
  },
  {
    name: "3D Logos",
    colors: "from-[#fff0c2] via-[#ffe6d1] to-[#ffd6d1]",
    mark: "3D",
  },
  {
    name: "Lettermark Logos",
    colors: "from-white via-[#eef4ff] to-[#ffe8e2]",
    mark: "SG",
  },
  {
    name: "Mascot Logos",
    colors: "from-[#fff3cf] via-white to-[#e9f7ee]",
    mark: "MC",
  },
  {
    name: "Emblem Logos",
    colors: "from-[#f7f7f7] via-white to-[#ffecc4]",
    mark: "EM",
  },
  {
    name: "Icon Logos",
    colors: "from-white via-[#fff5d9] to-[#ffdede]",
    mark: "IC",
  },
  {
    name: "Calligraphy Logos",
    colors: "from-[#fff8df] via-white to-[#f7e7ff]",
    mark: "CA",
  },
];

export function LogoDesignPage() {
  return (
    <div>
      <PageHero
        title="Logo Design"
        subtitle="Choose a product type to discuss on WhatsApp."
        breadcrumb={[
          { label: "Services", to: "/services" },
          { label: "Designing", to: "/services/designing" },
          { label: "Logo Design" },
        ]}
      />

      <section className="container-page py-14 md:py-18">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <h2 className="font-display text-4xl font-black leading-tight text-brand-dark md:text-6xl">
            Choose a product type to discuss on WhatsApp.
          </h2>
          <Link
            to="/contact"
            className="inline-flex w-fit shrink-0 items-center gap-3 rounded-lg border border-border bg-white px-5 py-3 font-bold text-brand-dark shadow-soft transition hover:border-brand-red hover:text-brand-red"
          >
            Order Details <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {LOGO_TYPES.map((item) => {
            const message = `Hi, I want to enquire about ${item.name} logo design.`;

            return (
              <article key={item.name} className="group">
                <div
                  className={`relative aspect-[1.08] overflow-hidden rounded-lg bg-gradient-to-br ${item.colors} border border-border shadow-soft`}
                >
                  <div className="absolute left-6 top-6 h-14 w-14 rounded-full bg-brand-yellow/70 blur-2xl" />
                  <div className="absolute bottom-0 right-0 h-28 w-28 rounded-tl-full bg-brand-red/10" />
                  <div className="absolute inset-6 grid place-items-center rounded-lg border border-white/80 bg-white/55">
                    <div className="grid h-24 w-24 place-items-center rounded-2xl gradient-brand font-display text-4xl font-black text-white shadow-brand transition group-hover:scale-105">
                      {item.mark}
                    </div>
                  </div>
                  <div className="absolute left-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white text-brand-red shadow-soft">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-black leading-tight text-brand-dark">
                    {item.name}
                  </h3>
                  <a
                    href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`}
                    className="mt-1 inline-flex items-center gap-1.5 font-bold text-brand-red transition hover:text-brand-maroon"
                  >
                    Enquire <WhatsAppIcon className="h-4 w-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
