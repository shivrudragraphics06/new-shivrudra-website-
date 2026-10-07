import {
  BadgeCheck,
  ArrowRight,
  Sparkles,
  Award,
  Truck,
  Users,
  CheckCircle2,
  Printer,
  Factory,
  Signpost,
  Star,
  Search,
  FileText,
  Palette,
  Wrench,
  MessageCircle,
} from "lucide-react";
import {
  PROCESS_STEPS,
  SERVICES,
  WHY_CHOOSE,
  TIMELINE,
  CONTACT,
  SITE_TAGLINE,
} from "@/data/site";
import { useEffect, useState } from "react";
import { Link } from "@/components/AppLink";
import { IndustriesGrid } from "@/components/IndustriesGrid";
import heroMotionVideo from "@/assets/moving LEDdot pattern.mp4";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  fetchPublicServices,
  fetchPublicTestimonials,
  type PublicService,
  type PublicTestimonial,
} from "@/lib/public-content";
import { assetUrl } from "@/lib/api";

const TESTIMONIALS = [
  {
    name: "Rahul Jadhav",
    role: "Retail Store Owner",
    text: "Shivrudra Graphics delivered our store branding on time with excellent print quality. The team understood the requirement clearly and handled the installation neatly.",
  },
  {
    name: "Priya Kulkarni",
    role: "Marketing Manager",
    text: "We regularly work with them for banners, labels and signage. Their finishing, color output and response time have been very dependable.",
  },
  {
    name: "Amit Patil",
    role: "Business Owner",
    text: "From design to final print, the experience was smooth. The team suggested practical options and the final signage looked premium.",
  },
];

const PROCESS_ICONS = [
  Users,
  Search,
  FileText,
  Palette,
  Printer,
  Factory,
  Wrench,
  Truck,
  Signpost,
  MessageCircle,
];

const TIMELINE_ICONS = [Sparkles, Palette, Factory, Award];

const PROCESS_STRIP_POINTS = [
  { left: "5%", top: "36px" },
  { left: "15%", top: "52px" },
  { left: "25%", top: "48px" },
  { left: "35%", top: "36px" },
  { left: "45%", top: "51px" },
  { left: "55%", top: "78px" },
  { left: "65%", top: "71px" },
  { left: "75%", top: "42px" },
  { left: "85%", top: "33px" },
  { left: "95%", top: "18px" },
];

const SERVICE_IMAGE_BY_SLUG: Record<string, string> = {
  designing: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80",
  "flex-printing": "https://images.unsplash.com/photo-1601225612051-d44d9c2c1b3a?w=900&q=80",
  "vinyl-printing": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80",
  "uv-printing": "https://images.unsplash.com/photo-1581091215367-9b6c00b3039a?w=900&q=80",
  "screen-printing": "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=900&q=80",
  "digital-printing": "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=900&q=80",
  "offset-printing": "https://images.unsplash.com/photo-1585241936939-be4099591252?w=900&q=80",
  "photo-frame": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=900&q=80",
  "badge-dome-printing": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&q=80",
  "bag-printing": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80",
  stamp: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80",
  "engraving-marking": "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=900&q=80",
  keychain: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=900&q=80",
  "corporate-gift": "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&q=80",
  "industrial-name-plates": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900&q=80",
  signage: "https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?w=900&q=80",
  "premium-signages": "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=900&q=80",
  "safety-signages": "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=900&q=80",
  "laser-cnc-cutting": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&q=80",
  "trophies-medals": "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=900&q=80",
};

function getServiceImage(service: PublicService) {
  return assetUrl(
    service.image_url ||
      service.main_image_url ||
      SERVICE_IMAGE_BY_SLUG[service.slug] ||
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80",
  );
}

export function HomePage() {
  const [services, setServices] = useState<PublicService[]>(SERVICES);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>(TESTIMONIALS);

  useEffect(() => {
    fetchPublicServices()
      .then((items) => {
        if (items.length) setServices(items);
      })
      .catch(() => {});

    fetchPublicTestimonials()
      .then((items) => {
        if (items.length) setTestimonials(items);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#fff4d5]">
        <div className="relative min-h-[620px] md:min-h-[560px] xl:min-h-[640px]">
          <video
            className="absolute inset-0 h-full w-full object-cover object-left"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src={heroMotionVideo} type="video/mp4" />
          </video>

          <div className="relative flex min-h-[620px] w-full items-center justify-center px-4 py-14 sm:px-8 md:min-h-[560px] md:px-7 md:py-16 lg:px-8 xl:min-h-[640px] xl:px-10 2xl:px-12">
            <div className="w-full max-w-5xl animate-fade-up text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 text-2xl font-bold sm:text-3xl md:text-4xl">
                <span className="text-brand-red">Designing</span>
                <span className="text-brand-dark/40">|</span>
                <span className="text-brand-red">Printing</span>
                <span className="text-brand-dark/40">|</span>
                <span className="text-brand-red">Branding</span>
              </div>
              <p className="mx-auto mt-5 max-w-5xl text-xl font-medium leading-relaxed text-brand-dark/80 md:text-2xl">
                {SITE_TAGLINE}.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full gradient-brand px-7 py-4 text-lg font-semibold text-white shadow-brand transition hover:scale-105"
                >
                  Explore Services <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-4 text-lg font-semibold text-white shadow-soft transition hover:scale-105"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Get Quote
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Marquee */}
        <div className="border-y border-border bg-brand-dark text-white py-3 overflow-hidden">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12 shrink-0">
                {[
                  "Commercial Printing",
                  "LED Sign Boards",
                  "Vehicle Branding",
                  "Corporate Gifts",
                  "Industrial Name Plates",
                  "Safety Signages",
                  "Offset Printing",
                  "UV Printing",
                  "Vinyl Branding",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-brand-yellow" /> {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="relative overflow-hidden bg-white py-14 md:py-16">
        <div className="container-page relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-brand-red">
                All Services
              </div>
              <h2 className="mt-2 font-display text-3xl font-black text-brand-dark md:text-4xl">
                Our Complete Service Range
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Professional printing, signage, branding and industrial solutions for every
                business need.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex w-fit items-center gap-2 rounded-full gradient-brand px-5 py-3 text-sm font-bold text-white shadow-brand transition hover:scale-105"
            >
              View service page <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {services.map((service) => (
              <Link
                key={service.slug}
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="group overflow-hidden rounded-lg border border-border bg-white text-left shadow-soft transition hover:-translate-y-1 hover:border-brand-red hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-light">
                  <img
                    src={getServiceImage(service)}
                    alt={service.name}
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.src.endsWith("/images/shivrudra-printing-banner.png")) return;
                      event.currentTarget.src = "/images/shivrudra-printing-banner.png";
                    }}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-brand-red opacity-0 shadow-soft transition group-hover:translate-x-1 group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="grid min-h-16 place-items-center px-3 py-3 text-center">
                  <h3 className="font-display text-sm font-extrabold leading-snug text-brand-dark transition group-hover:text-brand-red">
                    {service.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 bg-brand-light">
        <div className="container-page grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold tracking-widest text-brand-red uppercase">
              About Shivrudra
            </div>
            <h2 className="mt-2 font-display font-black text-3xl md:text-4xl">
              A printing & signage partner you can trust
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Shivrudra Graphics Pvt Ltd was originally founded in 2014 at Kesnand & Kolwadi and is
              now situated in Pune, Maharashtra. The company specializes in {SITE_TAGLINE},
              Designing, Printing, Branding and In-Shop Branding Solutions.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We provide complete signage solutions from concept and design to manufacturing and
              installation — with optimum quality, competitive pricing and total customer
              satisfaction.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-yellow/40 border border-brand-yellow px-4 py-2 text-sm font-bold">
              <BadgeCheck className="h-4 w-4 text-brand-red" /> ISO 9001:2015 Certified Company
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { n: "Aadesh C. Nimbalkar", r: "Director" },
                { n: "Akshay N. Kalbhor", r: "Director" },
              ].map((d) => (
                <div key={d.n} className="p-4 rounded-xl bg-white border border-border">
                  <div className="text-xs text-brand-red font-bold">{d.r}</div>
                  <div className="font-display font-bold mt-1">{d.n}</div>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-red"
            >
              Read more about us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { i: Users, t: "Skilled Team", d: "Experienced professionals" },
              { i: Award, t: "Premium Quality", d: "Best in class output" },
              { i: Truck, t: "On-Time Delivery", d: "Reliable timelines" },
              { i: Sparkles, t: "Creative Edge", d: "Unique design approach" },
            ].map((b) => (
              <div
                key={b.t}
                className="p-6 rounded-2xl bg-white border border-border shadow-soft hover:border-brand-red transition"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-accent">
                  <b.i className="h-5 w-5 text-brand-dark" />
                </div>
                <div className="mt-4 font-display font-bold">{b.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION MISSION VALUES */}
      <section className="py-20">
        <div className="container-page">
          <SectionHeader eyebrow="Our Principles" title="Vision, Mission & Values" />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
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
                className="group relative overflow-hidden rounded-2xl border border-border bg-white p-8 shadow-soft transition hover:border-transparent hover:gradient-brand hover:text-white"
              >
                <div className="text-xs font-bold tracking-widest text-brand-red uppercase transition group-hover:text-brand-yellow">
                  0{i + 1}
                </div>
                <h3 className="mt-2 font-display font-black text-2xl">{v.t}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground transition group-hover:text-white/90">
                  {v.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="relative overflow-hidden bg-brand-dark pb-14 pt-20 text-white">
        <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 rounded-full bg-brand-yellow/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/4 rounded-full bg-brand-red/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="container-page relative">
          <SectionHeader
            eyebrow="Our Journey"
            title="From a passion project to a Pvt Ltd company"
            light
          />

          <div className="relative left-1/2 mt-14 hidden w-screen -translate-x-1/2 overflow-hidden md:block">
            <div className="relative min-w-[1100px] px-10 pb-4 pt-6 lg:px-14">
              <div className="relative mx-auto h-[310px] max-w-[1320px]">
                <svg
                  className="pointer-events-none absolute left-1/2 top-8 h-32 w-screen -translate-x-1/2 text-brand-red/55"
                  viewBox="0 0 1000 130"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 40 C145 74 235 82 345 55 S535 20 650 65 S830 98 1000 32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 18"
                  />
                </svg>

                {TIMELINE.map((item, index) => {
                  const Icon = TIMELINE_ICONS[index] ?? Sparkles;
                  const left = ["12%", "37%", "62%", "87%"][index] ?? "50%";
                  const cardOffset = index % 2 === 0 ? "top-[120px]" : "top-[145px]";

                  return (
                    <div
                      key={item.year}
                      className={`absolute w-[13rem] -translate-x-1/2 text-center ${cardOffset}`}
                      style={{ left }}
                    >
                      <div className="absolute left-1/2 top-[-4.75rem] grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full border-4 border-white bg-brand-red text-white shadow-brand">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white px-5 py-5 text-brand-dark shadow-2xl">
                        <div className="font-display text-3xl font-black text-brand-red">{item.year}</div>
                        <div className="mt-2 font-display text-base font-black leading-tight">{item.title}</div>
                        <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:hidden">
            {TIMELINE.map((item, index) => {
              const Icon = TIMELINE_ICONS[index] ?? Sparkles;

              return (
                <div key={item.year} className="relative rounded-2xl border border-white/10 bg-white p-5 text-brand-dark shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-red text-white shadow-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display text-2xl font-black text-brand-red">{item.year}</div>
                      <div className="mt-1 font-display text-base font-black">{item.title}</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Why Shivrudra"
            title="Why clients choose us as their trusted partner"
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_CHOOSE.map((w, i) => (
              <div
                key={w}
                className="flex items-start gap-3 p-5 rounded-xl bg-white border border-border hover:border-brand-red hover:shadow-soft transition"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-white text-sm font-bold">
                  {i + 1}
                </div>
                <div className="font-semibold text-sm">{w}</div>
                <CheckCircle2 className="ml-auto h-5 w-5 text-brand-red shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="relative overflow-hidden bg-brand-light pb-10 pt-20">
        <div className="absolute left-0 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-yellow/20 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 translate-x-1/3 rounded-full bg-brand-red/10 blur-3xl" />
        <div className="container-page relative">
          <SectionHeader
            eyebrow="Work Process"
            title="A streamlined 10-step journey"
            desc="From the first call to final installation, here's how we deliver."
          />

          <div className="relative left-1/2 mt-14 hidden w-screen -translate-x-1/2 overflow-x-auto overflow-y-hidden md:block">
            <div className="relative min-w-[1280px] px-6 pb-2 pt-4 lg:px-10">
              <div className="absolute left-0 top-6 h-36 w-36 rounded-full bg-brand-yellow/15 blur-3xl" />
              <div className="absolute bottom-4 right-0 h-40 w-40 rounded-full bg-brand-red/10 blur-3xl" />
              <div className="relative mx-auto h-[270px] max-w-[1800px]">
                <svg
                  className="pointer-events-none absolute inset-x-0 top-2 h-32 w-full text-brand-red/40"
                  viewBox="0 0 1200 140"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 42 C95 62 165 78 260 72 S418 36 545 73 S710 117 840 76 S1030 72 1200 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 18"
                  />
                </svg>

                {PROCESS_STEPS.map((s, i) => {
                  const Icon = PROCESS_ICONS[i];

                  return (
                    <div
                      key={s}
                      className="absolute w-[7.25rem] -translate-x-1/2 text-center"
                      style={PROCESS_STRIP_POINTS[i]}
                    >
                      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border-4 border-white gradient-brand text-white shadow-brand">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="mt-5 rounded-xl border border-border bg-white px-3 py-4 text-brand-dark shadow-soft">
                        <div className="font-display text-2xl font-black text-brand-red">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="mt-1 text-sm font-bold">{s}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:hidden">
            {PROCESS_STEPS.map((s, i) => (
              <div
                key={s}
                className="relative flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-soft"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full gradient-accent text-brand-dark">
                  {(() => {
                    const Icon = PROCESS_ICONS[i];
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <div className="font-display text-lg font-black text-brand-red">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="font-semibold text-sm">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="relative overflow-hidden bg-white pb-10 pt-12">
        <div className="container-page">
          <SectionHeader
            eyebrow="Industries We Serve"
            title="Trusted by brands across industries"
            desc="A creative partner trusted across sectors."
          />
          <div className="mt-12">
            <IndustriesGrid />
          </div>
          <div className="text-center mt-8">
            <Link
              to="/industries"
              className="font-semibold text-brand-red inline-flex items-center gap-2"
            >
              See full list <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-brand-light py-16">
        <div className="container-page">
          <SectionHeader
            eyebrow="Testimonials"
            title="What our clients say"
            desc="Feedback from businesses who trust us for printing, branding and signage."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.id ?? item.name ?? item.client_name}
                className="rounded-2xl border border-border bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-brand-red"
              >
                <div className="flex gap-1 text-brand-yellow">
                  {[...Array(item.rating || 5)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  "{item.text || item.message}"
                </p>
                <div className="mt-6 border-t border-border pt-4">
                  <div className="font-display font-bold text-brand-dark">
                    {item.name || item.client_name}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand-red">
                    {item.role || item.client_role || item.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-6 sm:py-8">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl gradient-brand text-white p-8 md:p-12 text-center shadow-brand">
            <div
              className="absolute top-0 left-0 h-full w-full opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold mb-5">
                <BadgeCheck className="h-4 w-4 text-brand-yellow" /> ISO 9001:2015 Certified
              </div>
              <h2 className="font-display font-black text-3xl md:text-5xl max-w-3xl mx-auto">
                Let's create something great
              </h2>
              <p className="mt-4 text-white/90 max-w-xl mx-auto">
                Tell us about your project - our team will connect with you to bring your ideas to
                print.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-brand-red px-6 py-3.5 font-bold shadow-soft hover:scale-105 transition"
                >
                  Get a Quote <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-yellow text-brand-dark px-6 py-3.5 font-bold shadow-soft hover:scale-105 transition"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
  light,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  light?: boolean;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div
        className={`text-xs font-bold tracking-widest uppercase ${light ? "text-brand-yellow" : "text-brand-red"}`}
      >
        {eyebrow}
      </div>
      <h2
        className={`mt-2 font-display font-black text-3xl md:text-4xl ${light ? "text-white" : "text-brand-dark"}`}
      >
        {title}
      </h2>
      {desc && (
        <p className={`mt-3 ${light ? "text-white/70" : "text-muted-foreground"}`}>{desc}</p>
      )}
    </div>
  );
}
