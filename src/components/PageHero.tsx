import { Link } from "@/components/AppLink";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="text-xs sm:text-sm text-white/80 flex items-center flex-wrap gap-1">
      <Link to="/" className="hover:text-brand-yellow">
        Home
      </Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {it.to ? (
            <Link to={it.to} className="hover:text-brand-yellow">
              {it.label}
            </Link>
          ) : (
            <span className="text-brand-yellow font-semibold">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
}) {
  return (
    <section className="relative overflow-hidden gradient-brand text-white">
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-yellow/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="container-page relative py-14 md:py-20">
        {breadcrumb && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumb} />
          </div>
        )}
        <h1 className="font-display font-black text-3xl md:text-5xl leading-tight max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-white/85 max-w-2xl text-base md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
