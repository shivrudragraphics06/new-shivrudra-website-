import { PageHero } from "@/components/PageHero";
import { SITE_TAGLINE, TIMELINE, WHY_CHOOSE } from "@/data/site";
import { BadgeCheck, CheckCircle2 } from "lucide-react";

export function AboutPage() {
  return (
    <div>
      <PageHero
        title="About Shivrudra Graphics Pvt Ltd"
        subtitle={`ISO 9001:2015 Certified - ${SITE_TAGLINE} in Pune.`}
        breadcrumb={[{ label: "About Us" }]}
      />

      <section className="py-16 container-page grid lg:grid-cols-[1.3fr_1fr] gap-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-yellow/40 border border-brand-yellow px-3 py-1.5 text-xs font-bold mb-4">
            <BadgeCheck className="h-4 w-4 text-brand-red" /> ISO 9001:2015 Certified Company
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl">Our story</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Shivrudra Graphics Pvt Ltd was originally founded in 2014 at Kesnand & Kolwadi and is
            now situated in Pune, Maharashtra. The company specializes in {SITE_TAGLINE}, Designing,
            Printing, Branding and In-Shop Branding Solutions.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Shivrudra provides complete signage solutions from concept and design to manufacturing
            and installation with optimum quality, competitive pricing and customer satisfaction.
          </p>

          <h3 className="mt-10 font-display font-bold text-xl">Our Directors</h3>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {["Aadesh C. Nimbalkar", "Akshay N. Kalbhor"].map((n) => (
              <div key={n} className="p-5 rounded-2xl bg-white border border-border shadow-soft">
                <div className="grid h-14 w-14 place-items-center rounded-full gradient-brand text-white font-display font-black text-lg">
                  {n
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="mt-3 text-xs text-brand-red font-bold">Director</div>
                <div className="font-display font-bold mt-1">{n}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {[
            {
              t: "Vision",
              d: "To provide all types of graphics solutions to increase the growth of clients and build inclusive partnerships based on trust and mutual respect.",
            },
            {
              t: "Mission",
              d: "To become the most valued business partner for clients and help them grow their business.",
            },
            {
              t: "Values",
              d: "Integrity, Innovation, Teamwork, Environment-Friendly Approach, Respect for People.",
            },
          ].map((v, i) => (
            <div
              key={v.t}
              className="group rounded-2xl border border-border bg-white p-6 shadow-soft transition hover:border-transparent hover:gradient-brand hover:text-white"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-brand-red transition group-hover:text-brand-yellow">
                {v.t}
              </div>
              <p className="mt-2 text-foreground transition group-hover:text-white/90">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-brand-light">
        <div className="container-page">
          <h2 className="font-display font-black text-3xl text-center">Our Journey</h2>
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {TIMELINE.map((t) => (
              <div
                key={t.year}
                className="p-6 rounded-2xl bg-white border border-border shadow-soft"
              >
                <div className="text-brand-red font-display font-black text-3xl">{t.year}</div>
                <div className="mt-2 font-display font-bold">{t.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 container-page">
        <h2 className="font-display font-black text-3xl text-center">Why Choose Shivrudra</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WHY_CHOOSE.map((w) => (
            <div
              key={w}
              className="flex items-start gap-3 p-5 rounded-xl bg-white border border-border"
            >
              <CheckCircle2 className="h-5 w-5 text-brand-red mt-0.5 shrink-0" />
              <div className="font-semibold text-sm">{w}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
