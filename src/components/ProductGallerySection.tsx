import { useEffect, useMemo, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { GALLERY_CATEGORIES } from "@/data/site";
import { assetUrl } from "@/lib/api";
import { fetchPublicGallery } from "@/lib/public-content";

type GalleryItem = { cat: string; title: string; img: string };

const PRODUCT_GALLERY_ITEMS: GalleryItem[] = [
  {
    cat: "Printing",
    title: "Offset Printing Press",
    img: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=1000&q=80",
  },
  {
    cat: "Printing",
    title: "Digital Print Run",
    img: "https://images.unsplash.com/photo-1601225612051-d44d9c2c1b3a?w=1000&q=80",
  },
  {
    cat: "Signage",
    title: "Pylon Signage",
    img: "https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?w=1000&q=80",
  },
  {
    cat: "Signage",
    title: "Acrylic Letter Sign",
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&q=80",
  },
  {
    cat: "LED Boards",
    title: "3D LED Signage",
    img: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=1000&q=80",
  },
  {
    cat: "LED Boards",
    title: "Neon Storefront",
    img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=80",
  },
  {
    cat: "Corporate Gifts",
    title: "Branded Hampers",
    img: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1000&q=80",
  },
  {
    cat: "Corporate Gifts",
    title: "Premium Diaries",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&q=80",
  },
  {
    cat: "Vehicle Branding",
    title: "Car Wrap",
    img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1000&q=80",
  },
  {
    cat: "Vehicle Branding",
    title: "Bus Branding",
    img: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&q=80",
  },
  {
    cat: "Industrial Labels",
    title: "SS Name Plate",
    img: "https://images.unsplash.com/photo-1581091215367-9b6c00b3039a?w=1000&q=80",
  },
  {
    cat: "Industrial Labels",
    title: "Control Panel Stickers",
    img: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1000&q=80",
  },
];

export function ProductGallerySection({
  showFilters = false,
  limit,
  compactTop = false,
}: {
  showFilters?: boolean;
  limit?: number;
  compactTop?: boolean;
}) {
  const [active, setActive] = useState("All");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(PRODUCT_GALLERY_ITEMS);

  useEffect(() => {
    fetchPublicGallery()
      .then((items) => {
        if (!items.length) return;
        setGalleryItems(
          items.map((item) => ({
            cat: item.category || item.cat || "Printing",
            title: item.title,
            img: item.image_url || item.img || "",
          })),
        );
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const items =
      showFilters && active !== "All"
        ? galleryItems.filter((item) => item.cat === active)
        : galleryItems;

    return typeof limit === "number" ? items.slice(0, limit) : items;
  }, [active, galleryItems, limit, showFilters]);

  return (
    <section className={`bg-white ${compactTop ? "pb-16 pt-8" : "py-16"}`}>
      <div className="container-page">
        <div className="text-center">
          <h2 className="font-display text-3xl font-black text-brand-dark md:text-5xl">
            Product Gallery
          </h2>
          <p className="mt-3 text-muted-foreground">Click below to enlarge the images.</p>
        </div>

        {showFilters && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {GALLERY_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active === category
                    ? "gradient-brand border-transparent text-white shadow-brand"
                    : "border-border bg-white hover:border-brand-red hover:text-brand-red"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <button
              key={`${item.cat}-${item.title}`}
              type="button"
              onClick={() => setSelected(item)}
              className="group overflow-hidden rounded-lg border border-border bg-white text-left shadow-soft transition hover:-translate-y-1 hover:border-brand-red"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-light">
                <img
                  src={assetUrl(item.img)}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/35">
                  <span className="grid h-10 w-10 scale-90 place-items-center rounded-full bg-white text-brand-red opacity-0 shadow-soft transition group-hover:scale-100 group-hover:opacity-100">
                    <Maximize2 className="h-5 w-5" />
                  </span>
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-red">
                  {item.cat}
                </div>
                <div className="mt-1 font-display text-sm font-bold text-brand-dark">
                  {item.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-brand-dark shadow-soft transition hover:text-brand-red"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid min-h-0 flex-1 place-items-center bg-neutral-100 p-4 sm:p-6">
              <img
                src={assetUrl(selected.img)}
                alt={selected.title}
                className="mx-auto max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            </div>
            <div className="border-t border-border p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-red">
                {selected.cat}
              </div>
              <div className="font-display text-xl font-black text-brand-dark">{selected.title}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
