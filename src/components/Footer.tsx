import {
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { CONTACT, SERVICES, SITE_TAGLINE } from "@/data/site";
import logoUrl from "@/assets/logo.png";
import { Link } from "@/components/AppLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function Footer() {
  return (
    <footer className="mt-20 bg-brand-dark text-white">
      <div className="container-page py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={logoUrl}
              alt="Shivrudra Graphics Pvt Ltd logo"
              className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1"
            />
            <div>
              <div className="font-display font-extrabold">Shivrudra Graphics</div>
              <div className="text-xs text-white/70">Pvt Ltd</div>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-4">{SITE_TAGLINE}.</p>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
            <BadgeCheck className="h-4 w-4 text-brand-yellow" /> ISO 9001:2015 Certified
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 text-brand-yellow">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              "/about",
              "/services",
              "/industries",
              "/gallery",
              "/clients",
              "/contact",
            ].map((p) => (
              <li key={p}>
                <Link to={p} className="text-white/75 hover:text-brand-yellow">
                  {p
                    .replace("/", "")
                    .replace(/-/g, " ")
                    .replace(/^\w/, (c) => c.toUpperCase()) || "Home"}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 text-brand-yellow">Top Services</h4>
          <ul className="space-y-2 text-sm">
            {SERVICES.slice(0, 8).map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="text-white/75 hover:text-brand-yellow"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-4 text-brand-yellow">Contact</h4>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-brand-red shrink-0" />
              {CONTACT.address}
            </li>
            {CONTACT.phones.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-red shrink-0" />
                <a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-brand-yellow">
                  {p}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-red shrink-0" />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-brand-yellow">
                {CONTACT.email}
              </a>
            </li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              aria-label="WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-[#25D366]"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label={["Facebook", "Instagram", "LinkedIn", "YouTube"][i]}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand-red transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 text-center text-xs text-white/60">
          <span>© 2026 All Rights Reserved By Shivrudra Graphics Pvt Ltd. & Developed By </span>
          <a
            href="https://webakoof.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-white hover:text-brand-yellow"
          >
            Webakoof
          </a>
        </div>
      </div>
    </footer>
  );
}
