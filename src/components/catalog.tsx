import { ArrowRight, PackageCheck, Send, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { createPortal } from "react-dom";

import { Link } from "@/components/AppLink";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { CONTACT } from "@/data/site";
import { assetUrl } from "@/lib/api";
import { submitPublicInquiry, type PublicProduct } from "@/lib/public-content";

type EnquiryProduct = PublicProduct & {
  service_id?: number;
  serviceName?: string;
  categoryName?: string;
  variant_id?: number;
  item_count?: number | null;
  detailsPath?: string;
};

export function ProductPlaceholder({ name }: { name?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white via-[#fafafa] to-red-50 p-6 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center text-brand-red">
          <PackageCheck className="h-11 w-11 stroke-[2.5]" />
        </div>
        <p className="sr-only">
          {name || "Shivrudra Graphics"}
        </p>
      </div>
    </div>
  );
}

export function ProductCard({
  product,
  onEnquire,
  imageFit = "cover",
  size = "normal",
}: {
  product: EnquiryProduct;
  onEnquire: (product: EnquiryProduct) => void;
  imageFit?: "cover" | "contain";
  size?: "normal" | "large";
}) {
  const imageUrl = product.main_image_url || product.image_url;
  const isLarge = size === "large";
  const [previewOpen, setPreviewOpen] = useState(false);
  const imageMarkup = imageUrl ? (
    <img
      src={assetUrl(imageUrl)}
      alt={product.name}
      className={`h-full w-full transition duration-500 group-hover:scale-[1.03] ${imageFit === "contain" ? `${isLarge ? "p-0" : "p-2"} object-contain` : "object-cover"}`}
      loading="lazy"
    />
  ) : (
    <ProductPlaceholder name={product.name} />
  );

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg ${isLarge ? "border border-red-300 p-4" : "border border-border p-4 hover:border-red-200"}`}>
      {isLarge && product.detailsPath ? (
        <Link to={product.detailsPath} className="block aspect-square overflow-hidden bg-white" aria-label={`View products in ${product.name}`}>
          {imageMarkup}
        </Link>
      ) : isLarge ? (
        <button
          type="button"
          onClick={() => imageUrl && setPreviewOpen(true)}
          className="block aspect-square overflow-hidden bg-white"
          aria-label={`Open ${product.name} image`}
        >
          {imageMarkup}
        </button>
      ) : (
        <Link
          to="/products/$productSlug"
          params={{ productSlug: product.slug }}
          className="block aspect-[1.2] overflow-hidden rounded-lg border border-border bg-brand-light"
        >
          {imageMarkup}
        </Link>
      )}
      <div className={isLarge ? "grid grid-rows-[3.5rem_1.25rem_2.75rem] gap-y-3 pt-5 text-center" : "flex flex-1 flex-col pt-5"}>
        <div className={`flex items-start justify-between gap-3 ${isLarge ? "h-14 w-full" : "min-h-[3.5rem]"}`}>
          {isLarge ? (
            <h3 className="line-clamp-2 flex-1 font-display text-xl font-black leading-7 text-brand-dark">
              {product.name}
            </h3>
          ) : (
            <Link
              to="/products/$productSlug"
              params={{ productSlug: product.slug }}
              className="line-clamp-2 font-display text-xl font-black leading-7 text-brand-dark transition hover:text-brand-red"
            >
              {product.name}
            </Link>
          )}
          {!isLarge ? (
            <Link
              to="/products/$productSlug"
              params={{ productSlug: product.slug }}
              className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-muted text-brand-red transition group-hover:bg-red-50"
              aria-label={`View ${product.name}`}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          {isLarge && product.detailsPath ? (
            <Link to={product.detailsPath} className="grid size-9 shrink-0 place-items-center rounded-full bg-red-50 text-brand-red hover:bg-red-100" aria-label={`View products in ${product.name}`} title={`View products in ${product.name}`}>
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
        {isLarge ? (
          <p className="h-5 text-sm font-semibold leading-5 text-muted-foreground">{product.item_count != null ? `${product.item_count} ${product.item_count === 1 ? "Item" : "Items"}` : null}</p>
        ) : null}
        {isLarge ? (
          <a
            href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hi, I would like to enquire about ${product.name}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-black text-white shadow-brand transition hover:bg-brand-maroon"
          >
            Enquire Now <WhatsAppIcon className="h-4 w-4" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onEnquire(product)}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-red px-4 text-sm font-black text-white shadow-brand transition hover:bg-brand-maroon"
          >
            Enquire Now <WhatsAppIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      {previewOpen && imageUrl ? (
        <ImagePreviewDialog imageUrl={imageUrl} title={product.name} onClose={() => setPreviewOpen(false)} />
      ) : null}
    </article>
  );
}

export function ImagePreviewDialog({ imageUrl, title, onClose }: { imageUrl: string; title: string; onClose: () => void }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm md:p-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="relative max-h-[92vh] w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid size-10 shrink-0 place-items-center rounded-full bg-white/95 text-brand-dark shadow-lg transition hover:text-brand-red"
          aria-label="Close image"
        >
          <X className="size-5" />
        </button>
        <img
          src={assetUrl(imageUrl)}
          alt={title}
          className="max-h-[88vh] w-full rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>,
    document.body,
  );
}

export function ProductGrid({
  products,
  loading,
  emptyText = "No products available in this category yet.",
  onEnquire,
}: {
  products: EnquiryProduct[];
  loading?: boolean;
  emptyText?: string;
  onEnquire: (product: EnquiryProduct) => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-border bg-white p-4 shadow-soft">
            <div className="aspect-[1.2] animate-pulse rounded-lg bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-5 animate-pulse rounded bg-muted" />
              <div className="h-11 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm font-semibold text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id ?? product.slug} product={product} onEnquire={onEnquire} />
      ))}
    </div>
  );
}

export function EnquiryModal({
  product,
  onClose,
}: {
  product: EnquiryProduct | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  if (!product) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!product) return;
    setStatus("saving");

    try {
      await submitPublicInquiry({
        name: form.name,
        phone: form.phone,
        email: form.email,
        company: form.company,
        product_id: product.id,
        service_id: product.service_id,
        product_name: product.name,
        subject: product.name,
        message: form.message || `Product enquiry: ${product.name}${product.variant_id ? ` (Sub product #${product.variant_id})` : ""}`,
      });
      setStatus("success");
      setForm({ name: "", phone: "", email: "", company: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-brand-red">You are enquiring about</p>
            <h2 className="mt-1 font-display text-2xl font-black text-brand-dark">{product.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {[product.serviceName || product.service_name, product.categoryName || product.category_name]
                .filter(Boolean)
                .join(" > ")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-md border">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <ModalField label="Name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} required />
          <ModalField label="Phone Number" value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} required />
          <ModalField label="Email" type="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} />
          <ModalField label="Company Name" value={form.company} onChange={(company) => setForm((current) => ({ ...current, company }))} />
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">
            Message
            <textarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              rows={4}
              className="rounded-md border border-border px-3 py-2 font-normal outline-none transition focus:border-brand-red"
              placeholder={`I want to enquire about ${product.name}`}
            />
          </label>
        </div>

        {status === "success" ? (
          <p className="mx-5 rounded-md bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
            Enquiry submitted successfully. Our team will contact you soon.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mx-5 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            Failed to submit enquiry. Please try again.
          </p>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-border p-5">
          <button type="button" onClick={onClose} className="h-11 rounded-md border px-4 text-sm font-bold">
            Close
          </button>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-red px-5 text-sm font-black text-white shadow-brand disabled:opacity-60"
            disabled={status === "saving"}
          >
            <Send className="h-4 w-4" />
            {status === "saving" ? "Submitting..." : "Submit Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ModalField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-11 rounded-md border border-border px-3 font-normal outline-none transition focus:border-brand-red"
      />
    </label>
  );
}
