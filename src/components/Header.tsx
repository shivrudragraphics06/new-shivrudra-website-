import { useState } from "react";
import { Globe2, Mail, Phone, Menu, X, ChevronDown, BadgeCheck } from "lucide-react";
import { SERVICES, CONTACT } from "@/data/site";
import logoUrl from "@/assets/logo.png";
import { Link } from "@/components/AppLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

type NavItem = { to: string; label: string; mega?: boolean };
const NAV: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services", mega: true },
  { to: "/industries", label: "Industries We Serve" },
  { to: "/gallery", label: "Gallery" },
  { to: "/clients", label: "Clients" },
  { to: "/contact", label: "Contact Us" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      {/* Top strip */}
      <div className="bg-brand-dark text-white text-xs">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-2">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-brand-yellow" />
            <span className="font-medium tracking-wide">ISO 9001:2015 Certified Company</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-1.5 hover:text-brand-yellow">
              <Mail className="h-3.5 w-3.5" /> {CONTACT.email}
            </a>
            <a href={`https://${CONTACT.website}`} className="flex items-center gap-1.5 hover:text-brand-yellow">
              <Globe2 className="h-3.5 w-3.5" /> {CONTACT.website}
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-2">
        <Link to="/" className="flex min-w-0 items-center">
          <img
            src={logoUrl}
            alt="Shivrudra Graphics Pvt Ltd logo"
            className="h-16 w-auto shrink-0 object-contain sm:h-18"
          />
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${CONTACT.phones[0].replace(/\s/g, "")}`}
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-brand-red hover:text-brand-red transition"
          >
            <Phone className="h-4 w-4" /> {CONTACT.phones[0]}
          </a>
          <a
            href={`https://wa.me/${CONTACT.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition shadow-soft"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          <button
            className="md:hidden grid h-10 w-10 place-items-center rounded-lg border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="hidden md:block border-t border-border bg-brand-light">
        <div className="container-page flex items-center justify-center gap-1">
          {NAV.map((item) => (
            <div key={item.to} className="relative group">
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-brand-red" }}
                className="inline-flex items-center gap-1 px-4 py-3 text-sm font-semibold text-brand-dark hover:text-brand-red transition relative"
                onMouseEnter={() => item.mega && setServicesOpen(true)}
              >
                {item.label}
                {item.mega && <ChevronDown className="h-3.5 w-3.5" />}
                <span className="absolute left-4 right-4 bottom-1.5 h-0.5 bg-brand-red scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
              </Link>

              {item.mega && (
                <div
                  className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute left-0 top-full z-50 w-[min(95vw,900px)] bg-white border border-border shadow-soft rounded-b-xl p-6"
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                    {SERVICES.map((s) => (
                      <Link
                        key={s.slug}
                        to="/services/$slug"
                        params={{ slug: s.slug }}
                        className="block py-2 px-2 rounded text-sm font-medium hover:bg-brand-light hover:text-brand-red transition"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="container-page py-4 space-y-1">
            {NAV.map((item) => (
              <div key={item.to}>
                <Link
                  to={item.to as never}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 px-3 rounded font-semibold hover:bg-brand-light hover:text-brand-red"
                >
                  {item.label}
                </Link>
                {item.mega && (
                  <div className="pl-4 grid grid-cols-2 gap-x-2">
                    {SERVICES.slice(0, 10).map((s) => (
                      <Link
                        key={s.slug}
                        to="/services/$slug"
                        params={{ slug: s.slug }}
                        onClick={() => setOpen(false)}
                        className="block py-1.5 px-2 text-xs text-muted-foreground hover:text-brand-red"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 font-semibold"
            >
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
      {servicesOpen ? null : null}
    </header>
  );
}
