import { useEffect, useMemo, useState } from "react";

import logoUrl from "@/assets/logo.png";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Link } from "@/components/AppLink";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SITE_TAGLINE } from "@/data/site";
import { AdminPage } from "@/routes/admin";
import { AboutPage } from "@/routes/about";
import { ClientsPage } from "@/routes/clients";
import { ContactPage } from "@/routes/contact";
import { GalleryPage } from "@/routes/gallery";
import { HomePage } from "@/routes/index";
import { IndustriesPage } from "@/routes/industries";
import { LogoDesignPage } from "@/routes/logo-design";
import { ProductDetailPage } from "@/routes/products.$productSlug";
import { CategoryProductsPage, ServiceDetail } from "@/routes/services.$slug";
import { ServicesPage } from "@/routes/services.index";

const STATIC_TITLES: Record<string, string> = {
  "/": "Shivrudra Graphics Pvt Ltd - Printing, Branding & LED Signage in Pune",
  "/about": "About Us - Shivrudra Graphics Pvt Ltd",
  "/services": "Our Services - Shivrudra Graphics Pvt Ltd",
  "/industries": "Industries We Serve - Shivrudra Graphics",
  "/gallery": "Gallery - Shivrudra Graphics",
  "/clients": "Our Clients - Shivrudra Graphics",
  "/contact": "Contact Us - Shivrudra Graphics",
  "/logo-design": "Logo Design Types - Shivrudra Graphics",
};

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  return pathname.replace(/\/$/, "") || "/";
}

function setMeta(nameOrProperty: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${nameOrProperty}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(nameOrProperty, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function usePageMeta(pathname: string) {
  useEffect(() => {
    if (pathname === "/shivrudra_graphics-myadmin" || pathname.startsWith("/shivrudra_graphics-myadmin/")) return;

    const title = STATIC_TITLES[pathname] ?? "Shivrudra Graphics Pvt Ltd";
    const description =
      pathname === "/" ? `ISO 9001:2015 Certified. ${SITE_TAGLINE} in Pune.` : SITE_TAGLINE;

    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", SITE_TAGLINE);
    setMeta("property", "og:image", logoUrl);
    setMeta("name", "twitter:image", logoUrl);
  }, [pathname]);
}

function NotFoundPage() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-7xl font-black text-brand-dark">404</h1>
      <h2 className="mt-4 font-display text-2xl font-bold">Page not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-full gradient-brand px-6 py-3 font-bold text-white shadow-brand"
      >
        Go home
      </Link>
    </div>
  );
}

function CurrentPage({ pathname }: { pathname: string }) {
  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  if (pathname === "/") return <HomePage />;
  if (pathname === "/about") return <AboutPage />;
  if (pathname === "/services") return <ServicesPage />;
  if (pathname === "/industries") return <IndustriesPage />;
  if (pathname === "/gallery") return <GalleryPage />;
  if (pathname === "/clients") return <ClientsPage />;
  if (pathname === "/contact") return <ContactPage />;
  if (pathname === "/logo-design") return <LogoDesignPage />;
  if (segments[0] === "services" && segments[1] && segments[2])
    return <CategoryProductsPage serviceSlug={segments[1]} categorySlug={segments[2]} />;
  if (segments[0] === "services" && segments[1]) return <ServiceDetail slug={segments[1]} />;
  if (segments[0] === "products" && segments[1])
    return <ProductDetailPage productSlug={segments[1]} comboId={segments[2] === "combos" ? Number(segments[3]) : undefined} />;

  return <NotFoundPage />;
}

export function App() {
  const pathname = usePathname();
  usePageMeta(pathname);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (pathname === "/shivrudra_graphics-myadmin" || pathname.startsWith("/shivrudra_graphics-myadmin/")) {
    return <AdminPage pathname={pathname} navigate={navigate} />;
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">
        <CurrentPage pathname={pathname} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
