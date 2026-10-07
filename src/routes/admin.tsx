import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Eye,
  FolderTree,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Newspaper,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { type ComponentType, type FormEvent, type SVGProps, useEffect, useMemo, useState } from "react";

import logoUrl from "@/assets/logo.png";
import { adminApi, assetUrl, loginAdmin } from "@/lib/api";

type AdminPath = { pathname: string; navigate: (path: string) => void };
type AdminRecord = Record<string, any> & { id?: number | string };
type FieldType = "text" | "textarea" | "number" | "checkbox" | "image" | "datetime" | "select";
type Field = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  optionsKey?: string;
  dependsOn?: string;
  placeholder?: string;
};
type ResourceConfig = {
  key: string;
  label: string;
  singular: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  columns: string[];
  fields: Field[];
  empty: string;
};

const statusOptions = [
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
];
const blogStatusOptions = [
  { id: "DRAFT", name: "Draft" },
  { id: "PUBLISHED", name: "Published" },
];
const inquiryStatusOptions = [
  { id: "NEW", name: "New" },
  { id: "CONTACTED", name: "Contacted" },
  { id: "IN_PROGRESS", name: "In Progress" },
  { id: "CLOSED", name: "Closed" },
];

const resources: ResourceConfig[] = [
  {
    key: "services",
    label: "Services",
    singular: "Service",
    icon: BriefcaseBusiness,
    columns: ["image_url", "name", "short_description", "status", "display_order"],
    empty: "Services are the top-level catalog groups shown on the website.",
    fields: [
      { name: "name", label: "Service Name", required: true },
      { name: "slug", label: "Slug", placeholder: "auto-created if blank" },
      { name: "short_description", label: "Short Description", type: "textarea" },
      { name: "description", label: "Full Description", type: "textarea" },
      { name: "image", label: "Service Main Image", type: "image" },
      { name: "icon", label: "Icon/Image", type: "image" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", optionsKey: "_status" },
      { name: "seo_title", label: "SEO Title" },
      { name: "seo_description", label: "SEO Description", type: "textarea" },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    singular: "Category",
    icon: FolderTree,
    columns: ["image_url", "name", "service_name", "status", "display_order"],
    empty: "Categories added under Services will appear here.",
    fields: [
      { name: "service_id", label: "Service", type: "select", optionsKey: "services", required: true },
      { name: "name", label: "Category Name", required: true },
      { name: "slug", label: "Slug", placeholder: "auto-created if blank" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Category Image", type: "image" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", optionsKey: "_status" },
    ],
  },
  {
    key: "products",
    label: "Products",
    singular: "Product",
    icon: Package,
    columns: ["main_image_url", "name", "service_name", "category_name", "featured", "status"],
    empty: "Products added under your Services and Categories will appear here.",
    fields: [
      { name: "service_id", label: "Service", type: "select", optionsKey: "services", required: true },
      { name: "category_id", label: "Category", type: "select", optionsKey: "categories", dependsOn: "service_id", required: true },
      { name: "name", label: "Product Name", required: true },
      { name: "slug", label: "Slug", placeholder: "auto-created if blank" },
      { name: "sku", label: "Product Code / SKU" },
      { name: "short_description", label: "Short Description", type: "textarea" },
      { name: "description", label: "Full Description", type: "textarea" },
      { name: "main_image", label: "Main Product Image", type: "image" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", optionsKey: "_status" },
      { name: "seo_title", label: "SEO Title" },
      { name: "seo_description", label: "SEO Description", type: "textarea" },
    ],
  },
  {
    key: "gallery",
    label: "Gallery",
    singular: "Gallery Image",
    icon: Image,
    columns: ["image_url", "title", "alt_text", "status", "display_order"],
    empty: "Website portfolio/gallery images will appear here.",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "image", label: "Image", type: "image" },
      { name: "alt_text", label: "Alt Text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", optionsKey: "_status" },
    ],
  },
  {
    key: "blogs",
    label: "Blogs",
    singular: "Blog",
    icon: Newspaper,
    columns: ["featured_image_url", "title", "author", "publish_date", "status"],
    empty: "Draft and published website blogs will appear here.",
    fields: [
      { name: "title", label: "Blog Title", required: true },
      { name: "slug", label: "Slug", placeholder: "auto-created if blank" },
      { name: "image", label: "Featured Image", type: "image" },
      { name: "excerpt", label: "Short Description / Excerpt", type: "textarea" },
      { name: "content", label: "Full Content", type: "textarea" },
      { name: "author", label: "Author" },
      { name: "publish_date", label: "Publish Date", type: "datetime" },
      { name: "status", label: "Status", type: "select", optionsKey: "_blogStatus" },
      { name: "seo_title", label: "Meta Title" },
      { name: "seo_description", label: "Meta Description", type: "textarea" },
    ],
  },
  {
    key: "industries",
    label: "Industries",
    singular: "Industry",
    icon: Building2,
    columns: ["image_url", "name", "short_description", "status", "display_order"],
    empty: "Industries served by Shivrudra Graphics will appear here.",
    fields: [
      { name: "name", label: "Industry Name", required: true },
      { name: "slug", label: "Slug", placeholder: "auto-created if blank" },
      { name: "image", label: "Icon/Image", type: "image" },
      { name: "short_description", label: "Short Description", type: "textarea" },
      { name: "description", label: "Full Description", type: "textarea" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", optionsKey: "_status" },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    singular: "Client",
    icon: Users,
    columns: ["logo_url", "name", "website_url", "status", "display_order"],
    empty: "Client logos displayed on the website will appear here.",
    fields: [
      { name: "name", label: "Client Name", required: true },
      { name: "logo", label: "Client Logo", type: "image" },
      { name: "website_url", label: "Website URL" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", optionsKey: "_status" },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    icon: MessageSquareQuote,
    columns: ["image_url", "client_name", "company_name", "rating", "status"],
    empty: "Customer testimonials will appear here.",
    fields: [
      { name: "client_name", label: "Client Name", required: true },
      { name: "company_name", label: "Company Name" },
      { name: "designation", label: "Designation" },
      { name: "image", label: "Client Image", type: "image" },
      { name: "rating", label: "Rating", type: "number" },
      { name: "testimonial", label: "Testimonial", type: "textarea", required: true },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "status", label: "Status", type: "select", optionsKey: "_status" },
    ],
  },
  {
    key: "inquiries",
    label: "Inquiries",
    singular: "Inquiry",
    icon: MessageSquareQuote,
    columns: ["name", "phone", "email", "subject", "status", "created_at"],
    empty: "Website contact form submissions will appear here.",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "phone", label: "Phone" },
      { name: "email", label: "Email" },
      { name: "company", label: "Company" },
      { name: "service_id", label: "Service", type: "select", optionsKey: "services" },
      { name: "subject", label: "Subject / Service" },
      { name: "message", label: "Message", type: "textarea" },
      { name: "status", label: "Status", type: "select", optionsKey: "_inquiryStatus" },
      { name: "admin_notes", label: "Admin Notes", type: "textarea" },
    ],
  },
];

const navGroups = [
  { title: "Dashboard", items: [{ key: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Catalog",
    items: [
      { key: "services", label: "Services", icon: BriefcaseBusiness },
      { key: "categories", label: "Categories", icon: FolderTree },
      { key: "products", label: "Products", icon: Package },
    ],
  },
  {
    title: "Website Content",
    items: [
      { key: "gallery", label: "Gallery", icon: Image },
      { key: "blogs", label: "Blogs", icon: Newspaper },
      { key: "industries", label: "Industries", icon: Building2 },
      { key: "clients", label: "Clients", icon: Users },
      { key: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
    ],
  },
  { title: "Leads", items: [{ key: "inquiries", label: "Inquiries", icon: MessageSquareQuote }] },
  { title: "System", items: [{ key: "settings", label: "Settings", icon: Settings }] },
];

function getToken() {
  return localStorage.getItem("admin_token");
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toInputValue(value: AdminRecord[string]) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function AdminLoginPage({ navigate }: AdminPath) {
  const [email, setEmail] = useState(import.meta.env.ADMIN_EMAIL || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_name", data.admin.name);
      navigate("/shivrudra_graphics-myadmin/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-10 text-brand-dark">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:block">
          <img src={logoUrl} alt="Shivrudra Graphics" className="h-20 w-auto" />
          <h1 className="mt-8 max-w-xl font-display text-5xl font-black leading-tight">Shivrudra Graphics Admin</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            Manage catalog, website content, leads, media, and settings from one clean CMS.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-soft">
          <img src={logoUrl} alt="Shivrudra Graphics" className="mb-8 h-14 w-auto lg:hidden" />
          <h2 className="font-display text-2xl font-black">Admin Login</h2>
          <div className="mt-6 grid gap-4">
            <AdminTextInput label="Email" value={email} onChange={setEmail} type="email" required />
            <AdminTextInput label="Password" value={password} onChange={setPassword} type="password" required />
          </div>
          {error ? <Notice tone="error">{error}</Notice> : null}
          <button className="mt-6 h-11 w-full rounded-md bg-brand-red px-4 text-sm font-bold text-white shadow-brand disabled:opacity-60" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

function AdminShell({ pathname, navigate, children }: AdminPath & { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const adminName = localStorage.getItem("admin_name") || "Admin";
  const activeKey = pathname.split("/")[2] || "dashboard";

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_name");
    navigate("/shivrudra_graphics-myadmin/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-20 items-center border-b px-5">
        <img src={logoUrl} alt="Shivrudra Graphics" className="h-12 w-auto" />
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-wide text-muted-foreground">{group.title}</p>
            <div className="grid gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      navigate(`/shivrudra_graphics-myadmin/${item.key}`);
                      setOpen(false);
                    }}
                    className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-bold transition ${
                      active ? "bg-brand-red text-white" : "text-muted-foreground hover:bg-muted hover:text-brand-dark"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-brand-dark">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <aside className="h-full w-72 border-r bg-white">{sidebar}</aside>
        </div>
      ) : null}

      <section className="lg:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-md border lg:hidden">
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-red">CMS Admin</p>
              <h1 className="font-display text-lg font-black md:text-xl">Welcome, {adminName}</h1>
            </div>
          </div>
          <button onClick={logout} className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-bold hover:bg-muted">
            <LogOut className="size-4" />
            Logout
          </button>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </section>
    </main>
  );
}

function AdminDashboard({ navigate }: AdminPath) {
  const [data, setData] = useState<{
    counts: Record<string, number>;
    recentInquiries: AdminRecord[];
    recentProducts: AdminRecord[];
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi<typeof data>("/dashboard")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Dashboard failed to load"));
  }, []);

  const counts = data?.counts ?? {};
  const cards = [
    ["Total Services", "services"],
    ["Total Categories", "categories"],
    ["Total Products", "products"],
    ["Total Gallery Images", "gallery"],
    ["Total Blogs", "blogs"],
    ["Total Industries", "industries"],
    ["Total Clients", "clients"],
    ["Total Testimonials", "testimonials"],
    ["Total Inquiries", "inquiries"],
    ["New Inquiries", "newInquiries"],
  ];

  return (
    <div className="grid gap-6">
      <PageTitle title="Dashboard" subtitle="Live counts, recent leads, recent products, and quick actions from MySQL." />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, key]) => (
          <div key={key} className="rounded-lg border bg-white p-4 shadow-soft">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-black">{data ? counts[key] ?? 0 : "-"}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <InfoPanel title="Recent Inquiries" className="xl:col-span-2">
          <MiniTable rows={data?.recentInquiries ?? []} columns={["name", "phone", "email", "subject", "status", "created_at"]} />
        </InfoPanel>
        <InfoPanel title="Content Status">
          {[
            ["Active Products", counts.activeProducts],
            ["Inactive Products", counts.inactiveProducts],
            ["Published Blogs", counts.publishedBlogs],
            ["Draft Blogs", counts.draftBlogs],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-center justify-between border-b py-3 last:border-b-0">
              <span className="text-sm font-bold">{label}</span>
              <span className="text-lg font-black">{data ? value ?? 0 : "-"}</span>
            </div>
          ))}
        </InfoPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <InfoPanel title="Recent Products" className="xl:col-span-2">
          <MiniTable rows={data?.recentProducts ?? []} columns={["main_image_url", "name", "category_name", "service_name", "status"]} />
        </InfoPanel>
        <InfoPanel title="Quick Actions">
          {[
            ["+ Add Service", "services"],
            ["+ Add Category", "categories"],
            ["+ Add Product", "products"],
            ["+ Add Gallery Image", "gallery"],
            ["+ Add Blog", "blogs"],
          ].map(([label, key]) => (
            <button key={key} onClick={() => navigate(`/shivrudra_graphics-myadmin/${key}`)} className="mb-2 flex h-10 w-full items-center justify-center rounded-md bg-brand-red px-3 text-sm font-black text-white last:mb-0">
              {label}
            </button>
          ))}
        </InfoPanel>
      </div>
    </div>
  );
}

function ProductManagementPage() {
  const productResource = resources.find((item) => item.key === "products")!;
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [services, setServices] = useState<AdminRecord[]>([]);
  const [categories, setCategories] = useState<AdminRecord[]>([]);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [viewing, setViewing] = useState<AdminRecord | null>(null);
  const [form, setForm] = useState<AdminRecord>(defaultForm(productResource));
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVariants, setShowVariants] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [productRows, serviceRows, categoryRows] = await Promise.all([
        adminApi<AdminRecord[]>("/products"),
        adminApi<AdminRecord[]>("/services"),
        adminApi<AdminRecord[]>("/categories"),
      ]);
      setRows(productRows);
      setServices(serviceRows);
      setCategories(categoryRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Products failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredCategories = categories.filter((category) => !serviceFilter || String(category.service_id) === serviceFilter);
  const formCategories = categories.filter((category) => !form.service_id || String(category.service_id) === String(form.service_id));

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesText = !term || String(row.name ?? "").toLowerCase().includes(term);
      const matchesService = !serviceFilter || String(row.service_id) === serviceFilter;
      const matchesCategory = !categoryFilter || String(row.category_id) === categoryFilter;
      const matchesStatus = !statusFilter || String(row.status) === statusFilter;
      const matchesFeatured =
        !featuredFilter ||
        (featuredFilter === "YES" ? Boolean(row.featured || row.is_featured) : !Boolean(row.featured || row.is_featured));
      return matchesText && matchesService && matchesCategory && matchesStatus && matchesFeatured;
    });
  }, [rows, query, serviceFilter, categoryFilter, statusFilter, featuredFilter]);

  function openCreate() {
    setEditing({});
    setForm(defaultForm(productResource));
    setFiles({});
    setShowVariants(false);
    setError("");
    setNotice("");
  }

  function openEdit(row: AdminRecord) {
    setEditing(row);
    setForm({ ...defaultForm(productResource), ...row });
    setFiles({});
    setShowVariants(false);
    setError("");
    setNotice("");
    if (row.id) {
      adminApi<AdminRecord[]>(`/products/${row.id}/variants`)
        .then((items) => setShowVariants(items.length > 0))
        .catch(() => setShowVariants(false));
    }
  }

  function updateField(name: string, value: string | boolean) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "name" && !current.id && !current.slug) next.slug = slugifyLocal(String(value));
      if (name === "service_id") next.category_id = "";
      return next;
    });
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const body = buildFormData(productResource, form, files);
      const isEdit = Boolean(editing?.id);
      await adminApi(`/products${isEdit ? `/${editing?.id}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        body,
      });
      setEditing(null);
      await loadAll();
      setNotice(`Product ${isEdit ? "updated" : "added"} successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product could not be saved");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(row: AdminRecord) {
    const next = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await adminApi(`/products/${row.id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    await loadAll();
  }

  async function deleteProduct(row: AdminRecord) {
    if (!confirm(`Delete Product?\n\nAre you sure you want to delete ${row.name}?`)) return;
    try {
      await adminApi(`/products/${row.id}?force=true`, { method: "DELETE" });
      await loadAll();
      setNotice("Product deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product could not be deleted");
    }
  }

  const previewImage = files.main_image ? URL.createObjectURL(files.main_image) : String(form.main_image_url || "");

  return (
    <div>
      <PageTitle
        title="Products"
        subtitle="Manage all products displayed on the Shivrudra Graphics website."
        actionLabel="Add Product"
        onAction={openCreate}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice>{notice}</Notice> : null}

      <div className="mt-6 rounded-lg border bg-white p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-5">
          <label className="relative block md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-md border px-9 text-sm outline-none focus:ring-2 focus:ring-brand-red"
              placeholder="Search Product"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <AdminSelect value={serviceFilter} onChange={(value) => { setServiceFilter(value); setCategoryFilter(""); }} options={services} placeholder="All Services" />
          <AdminSelect value={categoryFilter} onChange={setCategoryFilter} options={filteredCategories} placeholder="All Categories" />
          <select className="h-10 rounded-md border bg-white px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select className="h-10 rounded-md border bg-white px-3 text-sm md:col-start-5" value={featuredFilter} onChange={(event) => setFeaturedFilter(event.target.value)}>
            <option value="">Featured / All</option>
            <option value="YES">Featured Only</option>
            <option value="NO">Not Featured</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-muted">
                {["Product Image", "Product Name", "Service", "Category", "Featured", "Status", "Display Order", "Actions"].map((label) => (
                  <th key={label} className="border-b px-3 py-3 font-black">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filteredRows.length ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="px-3 py-3">{renderCell(row.main_image_url, "main_image_url")}</td>
                    <td className="px-3 py-3 font-bold">{row.name}</td>
                    <td className="px-3 py-3">{row.service_name || "-"}</td>
                    <td className="px-3 py-3">{row.category_name || "-"}</td>
                    <td className="px-3 py-3">{row.featured ? "Yes" : "No"}</td>
                    <td className="px-3 py-3">{row.status}</td>
                    <td className="px-3 py-3">{row.display_order ?? 0}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setViewing(row)} className="grid size-8 place-items-center rounded-md border hover:bg-muted" title="View"><Eye className="size-4" /></button>
                        <button onClick={() => openEdit(row)} className="grid size-8 place-items-center rounded-md border hover:bg-muted" title="Edit"><Pencil className="size-4" /></button>
                        <button onClick={() => toggleStatus(row)} className="h-8 rounded-md border px-2 text-xs font-bold hover:bg-muted">{row.status === "ACTIVE" ? "Hide" : "Show"}</button>
                        <button onClick={() => deleteProduct(row)} className="grid size-8 place-items-center rounded-md border text-brand-red hover:bg-red-50" title="Delete"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Products added under your Services and Categories will appear here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <EditorDialog title={editing.id ? "Edit Product" : "Add Product"} onClose={() => setEditing(null)} onSubmit={saveProduct} saving={saving} wide>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid gap-5">
              <ProductFormSection title="Where should this product appear?" eyebrow="Step 1" description="Choose the service and category where this product appears on the website.">
                <AdminSelectField label="Service" value={toInputValue(form.service_id)} onChange={(value) => updateField("service_id", value)} options={services} required />
                <div>
                  <AdminSelectField label="Category" value={toInputValue(form.category_id)} onChange={(value) => updateField("category_id", value)} options={formCategories} required />
                  {form.service_id && !formCategories.length ? (
                    <p className="mt-2 text-sm font-semibold text-brand-red">No categories available for this service.</p>
                  ) : null}
                </div>
              </ProductFormSection>

              <ProductFormSection title="Basic Product Information" eyebrow="Step 2" description="Product name and image are enough for the public product card. Other details are optional.">
                <AdminTextInput label="Product Name" value={toInputValue(form.name)} onChange={(value) => updateField("name", value)} required />
                <AdminTextInput label="Slug" value={toInputValue(form.slug)} onChange={(value) => updateField("slug", value)} />
                <AdminTextInput label="Product Code / SKU" value={toInputValue(form.sku)} onChange={(value) => updateField("sku", value)} />
                <AdminTextInput label="Display Order" type="number" value={toInputValue(form.display_order)} onChange={(value) => updateField("display_order", value)} />
                <label className="grid gap-2 text-sm font-bold md:col-span-2">
                  Short Description
                  <textarea className="min-h-20 rounded-lg border border-border px-4 py-3 font-normal outline-none transition focus:border-brand-red focus:ring-2 focus:ring-red-100" value={toInputValue(form.short_description)} onChange={(event) => updateField("short_description", event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm font-bold md:col-span-2">
                  Full Description
                  <textarea className="min-h-28 rounded-lg border border-border px-4 py-3 font-normal outline-none transition focus:border-brand-red focus:ring-2 focus:ring-red-100" value={toInputValue(form.description)} onChange={(event) => updateField("description", event.target.value)} />
                </label>
              </ProductFormSection>

              <ProductFormSection title="Product Image" eyebrow="Step 3" description="This is the image customers will see on the product card.">
                <ImageInput label={files.main_image || form.main_image_url ? "Change Image" : "Upload Product Image"} onFile={(file) => setFiles((current) => ({ ...current, main_image: file }))} />
                {(files.main_image || form.main_image_url) ? (
                  <button type="button" onClick={() => { setFiles((current) => ({ ...current, main_image: undefined })); if (!editing.id) updateField("main_image_url", ""); }} className="h-10 w-fit rounded-md border px-4 text-sm font-bold">
                    Remove Image
                  </button>
                ) : null}
              </ProductFormSection>

              {editing.id ? (
                <>
                  <ProductFormSection title="Product Gallery / Client Mockups" eyebrow="Step 4" description="Upload finished client mockups/design photos shown on the product detail page.">
                    <p className="text-sm text-muted-foreground md:col-span-2">Add client mockups, logo designs, print samples, or other gallery images for this product.</p>
                    <ProductImagesManager productId={Number(editing.id)} />
                  </ProductFormSection>
                  <ProductFormSection title="Sub Products / Variants" eyebrow="Optional" description="Use this when a product has items under it. Example: Pens > Black Matt Pen, Metal Pen, Plastic Pen.">
                    <div className="md:col-span-2">
                      <p className="text-sm font-bold">Does this product have sub products?</p>
                      <div className="mt-2 flex gap-3">
                        <button type="button" onClick={() => setShowVariants(false)} className={`h-9 rounded-md border px-4 text-sm font-bold ${!showVariants ? "bg-brand-red text-white" : ""}`}>No</button>
                        <button type="button" onClick={() => setShowVariants(true)} className={`h-9 rounded-md border px-4 text-sm font-bold ${showVariants ? "bg-brand-red text-white" : ""}`}>Yes</button>
                      </div>
                    </div>
                    {showVariants ? <ProductSubEditor productId={Number(editing.id)} type="variants" allowChildren={form.slug === "corporate-gift-combo-sets"} /> : null}
                  </ProductFormSection>
                </>
              ) : (
                <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">Save the product first, then add additional images and optional variants.</p>
              )}

              <ProductFormSection title="Website Display" eyebrow="Step 5" description="Active products appear publicly. Lower display order numbers appear first.">
                <AdminSelectField label="Status" value={toInputValue(form.status)} onChange={(value) => updateField("status", value)} options={statusOptions} />
                <label className="flex h-11 items-center gap-3 rounded-md border px-3 text-sm font-bold">
                  <input checked={Boolean(form.featured)} onChange={(event) => updateField("featured", event.target.checked)} type="checkbox" />
                  Show as Featured Product
                </label>
                <p className="text-xs font-semibold text-muted-foreground md:col-span-2">Lower numbers appear first.</p>
              </ProductFormSection>

              <details className="rounded-xl border border-border bg-white p-5 shadow-soft">
                <summary className="cursor-pointer font-display text-lg font-black">Advanced / SEO Settings</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <AdminTextInput label="SEO Title" value={toInputValue(form.seo_title)} onChange={(value) => updateField("seo_title", value)} />
                  <label className="grid gap-2 text-sm font-bold md:col-span-2">
                    SEO Description
                    <textarea className="min-h-20 rounded-lg border border-border px-4 py-3 font-normal outline-none transition focus:border-brand-red focus:ring-2 focus:ring-red-100" value={toInputValue(form.seo_description)} onChange={(event) => updateField("seo_description", event.target.value)} />
                  </label>
                </div>
              </details>
            </div>

            <ProductWebsitePreview name={String(form.name || "Product Name")} image={previewImage} />
          </div>
        </EditorDialog>
      ) : null}

      {viewing ? (
        <ProductViewDialog
          product={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setViewing(null);
            openEdit(viewing);
          }}
        />
      ) : null}
    </div>
  );
}

function AdminSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: AdminRecord[];
  placeholder: string;
}) {
  return (
    <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-brand-dark outline-none transition focus:border-brand-red focus:ring-2 focus:ring-red-100" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={String(option.id)} value={String(option.id)}>
          {String(option.name ?? option.title ?? option.id)}
        </option>
      ))}
    </select>
  );
}

function AdminSelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: AdminRecord[];
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-brand-dark">
      {label}
      <AdminSelect value={value} onChange={onChange} options={options} placeholder={`Select ${label}`} />
      {required ? <span className="sr-only">required</span> : null}
    </label>
  );
}

function ProductFormSection({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-soft md:p-6">
      <div className="mb-5">
        {eyebrow ? <p className="text-xs font-black uppercase tracking-wide text-brand-red">{eyebrow}</p> : null}
        <h4 className="mt-1 font-display text-xl font-black text-brand-dark">{title}</h4>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ProductImagesManager({ productId }: { productId: number }) {
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setRows(await adminApi<AdminRecord[]>(`/products/${productId}/images`));
  }

  useEffect(() => {
    load().catch(() => setRows([]));
  }, [productId]);

  async function uploadImages() {
    if (!files?.length) return;
    setSaving(true);
    const data = new FormData();
    Array.from(files).forEach((file) => data.append("images", file));
    await adminApi(`/products/${productId}/images`, { method: "POST", body: data });
    setFiles(null);
    await load();
    setSaving(false);
  }

  async function remove(row: AdminRecord) {
    if (!row.id || !confirm("Delete this product image?")) return;
    await adminApi(`/products/${productId}/images/${row.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="grid gap-4 md:col-span-2">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-muted px-3 text-sm font-bold">
          <Upload className="size-4" />
          Upload Images
          <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setFiles(event.target.files)} />
        </label>
        <button type="button" onClick={uploadImages} disabled={!files?.length || saving} className="h-10 rounded-md bg-brand-red px-4 text-sm font-bold text-white disabled:opacity-60">
          {saving ? "Uploading..." : "+ Upload Images"}
        </button>
      </div>

      {rows.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border bg-white p-2">
              {row.image_url ? <img src={assetUrl(String(row.image_url))} alt={String(row.alt_text || "")} className="aspect-[4/3] w-full rounded bg-brand-light object-contain" /> : null}
              <p className="mt-2 truncate text-xs font-semibold">{row.alt_text || "Product image"}</p>
              <p className="text-xs text-muted-foreground">Order: {row.display_order ?? 0}</p>
              <button type="button" onClick={() => remove(row)} className="mt-2 h-8 w-full rounded-md border text-xs font-bold text-brand-red">
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">No additional images yet.</p>
      )}
    </div>
  );
}

function ProductWebsitePreview({ name, image }: { name: string; image?: string }) {
  return (
    <aside className="sticky top-4 h-fit rounded-xl border border-border bg-white p-5 shadow-soft">
      <p className="mb-4 text-xs font-black uppercase tracking-wide text-brand-red">Website Preview</p>
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-lg shadow-red-950/5">
        <div className="aspect-[1.18] bg-gradient-to-br from-white via-[#fafafa] to-red-50">
          {image ? (
            <img src={assetUrl(image)} alt={name} className="h-full w-full object-contain p-4" />
          ) : (
            <div className="grid h-full place-items-center text-sm font-black text-muted-foreground">Product Image</div>
          )}
        </div>
        <div className="p-5">
          <div className="line-clamp-2 min-h-[3.5rem] font-display text-xl font-black leading-7 text-brand-dark">{name}</div>
          <div className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-brand-red px-4 text-sm font-black uppercase tracking-wide text-white shadow-brand">
            ENQUIRE NOW
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        This preview matches the customer-facing product card.
      </p>
    </aside>
  );
}

function ProductViewDialog({
  product,
  onClose,
  onEdit,
}: {
  product: AdminRecord;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto max-w-2xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-display text-xl font-black">View Product</h3>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-md border"><X className="size-4" /></button>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[180px_1fr]">
          <div className="overflow-hidden rounded-lg border bg-brand-light">
            {product.main_image_url ? (
              <img src={assetUrl(String(product.main_image_url))} alt={String(product.name)} className="aspect-[4/3] w-full object-contain p-2" />
            ) : (
              <div className="grid aspect-[4/3] place-items-center text-xs font-bold text-muted-foreground">No image</div>
            )}
          </div>
          <div className="grid gap-2 text-sm">
            <h4 className="font-display text-2xl font-black">{product.name}</h4>
            <p><strong>Service:</strong> {product.service_name || "-"}</p>
            <p><strong>Category:</strong> {product.category_name || "-"}</p>
            <p><strong>Status:</strong> {product.status || "-"}</p>
            <p><strong>Featured:</strong> {product.featured ? "Yes" : "No"}</p>
            <p><strong>Display Order:</strong> {product.display_order ?? 0}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-5 py-4">
          <a href={`/products/${product.slug}`} target="_blank" className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-bold">
            View on Website
          </a>
          <button type="button" onClick={onEdit} className="h-10 rounded-md bg-brand-red px-4 text-sm font-bold text-white">
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
}

function slugifyLocal(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AdminResourcePage({ resource }: { resource: ResourceConfig }) {
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [options, setOptions] = useState<Record<string, AdminRecord[]>>({});
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [form, setForm] = useState<AdminRecord>({});
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadRows() {
    setLoading(true);
    setError("");
    try {
      setRows(await adminApi<AdminRecord[]>(`/${resource.key}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : `${resource.label} failed to load`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditing(null);
    setForm(defaultForm(resource));
    loadRows();
  }, [resource.key]);

  useEffect(() => {
    const keys = Array.from(new Set(resource.fields.map((field) => field.optionsKey).filter(Boolean))) as string[];
    Promise.all(
      keys
        .filter((key) => !key.startsWith("_"))
        .map(async (key) => [key, await adminApi<AdminRecord[]>(`/${key}`)] as const),
    )
      .then((entries) =>
        setOptions({
          ...Object.fromEntries(entries),
          _status: statusOptions,
          _blogStatus: blogStatusOptions,
          _inquiryStatus: inquiryStatusOptions,
        }),
      )
      .catch(() => setOptions({ _status: statusOptions, _blogStatus: blogStatusOptions, _inquiryStatus: inquiryStatusOptions }));
  }, [resource.fields, resource.key]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(term)));
  }, [query, rows]);

  function openCreate() {
    setEditing({});
    setForm(defaultForm(resource));
    setFiles({});
    setError("");
  }

  function openEdit(row: AdminRecord) {
    setEditing(row);
    setForm({ ...defaultForm(resource), ...row });
    setFiles({});
    setError("");
  }

  function closeForm() {
    setEditing(null);
    setForm(defaultForm(resource));
    setFiles({});
  }

  function updateField(field: Field, value: string | boolean) {
    if (field.type === "number" || field.type === "select") {
      setForm((current) => ({ ...current, [field.name]: value === "" ? "" : value }));
      if (field.name === "service_id" && resource.key === "products") {
        setForm((current) => ({ ...current, category_id: "" }));
      }
      return;
    }
    setForm((current) => ({ ...current, [field.name]: value }));
  }

  async function saveRecord(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const body = buildFormData(resource, form, files);
      const isEdit = Boolean(editing?.id);
      await adminApi(`/${resource.key}${isEdit ? `/${editing?.id}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        body,
      });

      await loadRows();
      closeForm();
      setNotice(`${resource.singular} ${isEdit ? "updated" : "added"} successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${resource.singular} could not be saved`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(row: AdminRecord) {
    if (!row.id) return;
    if (!confirm(`Delete ${String(row.name ?? row.title ?? resource.singular)}?`)) return;

    try {
      await adminApi(`/${resource.key}/${row.id}`, { method: "DELETE" });
      await loadRows();
      setNotice(`${resource.singular} deleted successfully.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : `${resource.singular} could not be deleted`;
      if (resource.key === "products" && confirm(`${message}\n\nDelete this product and its images/variants permanently?`)) {
        await adminApi(`/${resource.key}/${row.id}?force=true`, { method: "DELETE" });
        await loadRows();
        return;
      }
      setError(message);
    }
  }

  return (
    <div>
      <PageTitle title={resource.label} subtitle="Add, edit, hide/show, reorder, and delete safely." actionLabel={`Add ${resource.singular}`} onAction={openCreate} />
      {error ? <Notice tone="error">{error}</Notice> : null}
      {notice ? <Notice>{notice}</Notice> : null}

      <div className="mt-6 rounded-lg border bg-white p-4 shadow-soft">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input className="h-10 w-full rounded-md border px-9 text-sm outline-none focus:ring-2 focus:ring-brand-red" placeholder={`Search ${resource.label.toLowerCase()}`} value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <DataTable rows={filteredRows} columns={resource.columns} loading={loading} empty={resource.empty} onEdit={openEdit} onDelete={deleteRecord} />
      </div>

      {editing ? (
        <EditorDialog title={`${editing.id ? "Edit" : "Add"} ${resource.singular}`} onClose={closeForm} onSubmit={saveRecord} saving={saving}>
          <div className="grid gap-5">
            {resource.key === "products" ? <ProductBreadcrumb form={form} options={options} /> : null}
            <FormSection title={resource.key === "products" ? "Basic Information" : `${resource.singular} Details`}>
              {resource.fields.slice(0, resource.key === "products" ? 5 : resource.fields.length).map((field) => (
                <AdminField key={field.name} field={field} options={fieldOptions(field, options, form)} value={form[field.name]} imagePreview={resource.key === "clients" && field.name === "logo" ? String(form.logo_url || "") : undefined} onChange={(value) => updateField(field, value)} onFile={(file) => setFiles((current) => ({ ...current, [field.name]: file }))} />
              ))}
            </FormSection>
            {resource.key === "products" ? (
              <>
                <FormSection title="Description">
                  {resource.fields.slice(5, 7).map((field) => (
                    <AdminField key={field.name} field={field} value={form[field.name]} onChange={(value) => updateField(field, value)} />
                  ))}
                </FormSection>
                <FormSection title="Product Images">
                  {resource.fields.slice(7, 8).map((field) => (
                    <AdminField key={field.name} field={field} value={form[field.name]} onChange={(value) => updateField(field, value)} onFile={(file) => setFiles((current) => ({ ...current, [field.name]: file }))} />
                  ))}
                  {editing.id ? <ProductSubEditor productId={Number(editing.id)} type="images" /> : <p className="text-sm text-muted-foreground">Save the product first, then add additional images.</p>}
                </FormSection>
                <FormSection title="Optional Variants">
                  {editing.id ? <ProductSubEditor productId={Number(editing.id)} type="variants" /> : <p className="text-sm text-muted-foreground">Save the product first, then add optional variants.</p>}
                </FormSection>
                <FormSection title="SEO">
                  {resource.fields.slice(11).map((field) => (
                    <AdminField key={field.name} field={field} value={form[field.name]} onChange={(value) => updateField(field, value)} />
                  ))}
                </FormSection>
                <FormSection title="Status & Display">
                  {resource.fields.slice(8, 11).map((field) => (
                    <AdminField key={field.name} field={field} options={fieldOptions(field, options, form)} value={form[field.name]} onChange={(value) => updateField(field, value)} />
                  ))}
                </FormSection>
              </>
            ) : null}
          </div>
        </EditorDialog>
      ) : null}
    </div>
  );
}

function ProductSubEditor({ productId, type, variantId, allowChildren = false }: { productId: number; type: "images" | "variants" | "combo-items"; variantId?: number; allowChildren?: boolean }) {
  const key = type === "images" ? "product-images" : type;
  const config: ResourceConfig =
    type === "images"
      ? {
          key,
          label: "Images",
          singular: "Image",
          icon: Image,
          columns: ["image_url", "alt_text", "display_order"],
          empty: "Additional product images will appear here.",
          fields: [
            { name: "alt_text", label: "Alt Text" },
            { name: "image", label: "Image", type: "image" },
            { name: "display_order", label: "Display Order", type: "number" },
          ],
        }
      : {
          key,
          label: "Sub Products / Variants",
          singular: type === "combo-items" ? "Combo Product" : "Sub Product",
          icon: Package,
          columns: type === "combo-items" ? ["image_url", "name", "sku", "status", "display_order"] : ["image_url", "name", "sku", "item_count", "status", "display_order"],
          empty: "Sub products added under this product will appear here.",
          fields: [
            { name: "name", label: type === "combo-items" ? "Product Name" : "Sub Product Name", required: true },
            ...(type === "combo-items" ? [] : [{ name: "item_count", label: "Item Count", type: "number" as const }]),
            { name: "sku", label: "SKU" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "image", label: "Sub Product Image", type: "image" },
            { name: "display_order", label: "Display Order", type: "number" },
            { name: "status", label: "Status", type: "select", optionsKey: "_status" },
          ],
        };
  const [rows, setRows] = useState<AdminRecord[]>([]);
  const [form, setForm] = useState<AdminRecord>({});
  const [file, setFile] = useState<File>();
  const [show, setShow] = useState(false);
  const [editingSub, setEditingSub] = useState<AdminRecord | null>(null);
  const [subError, setSubError] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  async function load() {
    if (type === "combo-items") {
      setRows(await adminApi<AdminRecord[]>(`/variants/${variantId}/items`));
      return;
    }
    if (type === "variants") {
      const productVariants = await adminApi<AdminRecord[]>(`/products/${productId}/variants`);
      setRows(productVariants);
      return;
    }

    const all = await adminApi<AdminRecord[]>(`/${key}`);
    setRows(all.filter((row) => Number(row.product_id) === productId));
  }

  useEffect(() => {
    load().catch((error) => setSubError(error instanceof Error ? error.message : "Products could not be loaded"));
  }, [productId, key, variantId]);

  async function save() {
    if (savingSub) return;
    try {
      setSubError("");
      if (!String(form.name || "").trim() && type !== "images") throw new Error("Product name is required");
      setSavingSub(true);
      const data = buildFormData(config, { ...form, product_id: productId, status: form.status || "ACTIVE" }, file ? { image: file } : {});
      data.set("product_id", String(productId));
      if (type === "combo-items") data.set("variant_id", String(variantId));
      const isEdit = Boolean(editingSub?.id);
      await adminApi(`/${key}${isEdit ? `/${editingSub?.id}` : ""}`, { method: isEdit ? "PUT" : "POST", body: data });
      setShow(false);
      setEditingSub(null);
      setForm({});
      setFile(undefined);
      await load();
    } catch (err) {
      setSubError(err instanceof Error ? err.message : `${config.singular} could not be saved`);
    } finally {
      setSavingSub(false);
    }
  }

  function addNew() {
    setEditingSub(null);
    setForm({ status: "ACTIVE", display_order: 0 });
    setFile(undefined);
    setSubError("");
    setShow(true);
  }

  function editRow(row: AdminRecord) {
    setEditingSub(row);
    setForm({ ...row });
    setFile(undefined);
    setSubError("");
    setShow(true);
  }

  async function remove(row: AdminRecord) {
    if (!row.id || !confirm(`Delete this ${config.singular.toLowerCase()}?`)) return;
    await adminApi(`/${key}/${row.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="grid gap-3 md:col-span-2">
      <button type="button" onClick={addNew} className="inline-flex h-10 w-fit items-center gap-2 rounded-md border px-3 text-sm font-bold">
        <Plus className="size-4" />
        Add {config.singular}
      </button>
      <DataTable rows={rows} columns={config.columns} empty={config.empty} onEdit={editRow} onDelete={remove} compact />
      {subError ? <p role="alert" className="text-sm font-semibold text-red-700">{subError}</p> : null}
      {show ? (
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-display text-lg font-black">{editingSub ? `Edit ${config.singular}` : `Add ${config.singular}`}</p>
            <button type="button" onClick={() => { setShow(false); setEditingSub(null); setForm({}); setFile(undefined); }} className="grid size-8 place-items-center rounded-md border bg-white">
              <X className="size-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <AdminField key={`${editingSub?.id || "new"}-${field.name}`} field={field} options={field.optionsKey === "_status" ? statusOptions : []} value={form[field.name]} imagePreview={field.type === "image" ? String(form.image_url || "") : ""} onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))} onFile={setFile} />
            ))}
            {subError ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 md:col-span-2">{subError}</p> : null}
            <div className="flex gap-2 md:col-span-2">
              <button type="button" onClick={save} disabled={savingSub} className="h-10 rounded-md bg-brand-red px-4 text-sm font-bold text-white disabled:opacity-50">{savingSub ? "Saving..." : `${editingSub ? "Update" : "Save"} ${config.singular}`}</button>
              <button type="button" onClick={() => { setShow(false); setEditingSub(null); setForm({}); setFile(undefined); }} className="h-10 rounded-md border px-4 text-sm font-bold">Cancel</button>
            </div>
          </div>
          {allowChildren && editingSub?.id ? (
            <section className="mt-6 border-t pt-5">
              <h4 className="mb-4 text-lg font-bold">Products in {String(editingSub.name)}</h4>
              <ProductSubEditor key={String(editingSub.id)} productId={productId} type="combo-items" variantId={Number(editingSub.id)} />
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SettingsPage() {
  const fields = [
    "company_name",
    "phone_number",
    "alternate_phone",
    "email",
    "whatsapp_number",
    "address",
    "google_maps_url",
    "facebook",
    "instagram",
    "linkedin",
    "youtube",
    "default_meta_title",
    "default_meta_description",
    "footer_description",
    "copyright_text",
  ];
  const [form, setForm] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => {
    adminApi<Array<{ setting_key: string; setting_value?: string }>>("/settings").then((rows) => {
      setForm(Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value || ""])));
    });
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    const data = new FormData();
    fields.forEach((field) => data.append(field, form[field] || ""));
    Object.entries(files).forEach(([key, file]) => file && data.append(key, file));
    await adminApi("/settings", { method: "PUT", body: data });
    setNotice("Settings updated successfully.");
  }

  return (
    <div>
      <PageTitle title="Settings" subtitle="Company, contact, SEO, social links, and footer details stored in MySQL." />
      {notice ? <Notice>{notice}</Notice> : null}
      <form onSubmit={save} className="mt-6 rounded-lg border bg-white p-5 shadow-soft">
        <FormSection title="General">
          <AdminTextInput label="Company Name" value={form.company_name || ""} onChange={(value) => setForm((current) => ({ ...current, company_name: value }))} />
          <ImageInput label="Logo" onFile={(file) => setFiles((current) => ({ ...current, logo: file }))} />
          <ImageInput label="Favicon" onFile={(file) => setFiles((current) => ({ ...current, favicon: file }))} />
        </FormSection>
        <FormSection title="Contact & Address">
          {["phone_number", "alternate_phone", "email", "whatsapp_number", "address", "google_maps_url"].map((field) => (
            <AdminTextInput key={field} label={formatLabel(field)} value={form[field] || ""} onChange={(value) => setForm((current) => ({ ...current, [field]: value }))} />
          ))}
        </FormSection>
        <FormSection title="Social, SEO & Footer">
          {fields.slice(8).map((field) => (
            <AdminTextInput key={field} label={formatLabel(field)} value={form[field] || ""} onChange={(value) => setForm((current) => ({ ...current, [field]: value }))} />
          ))}
        </FormSection>
        <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-brand-red px-4 text-sm font-bold text-white">
          <Save className="size-4" />
          Save Settings
        </button>
      </form>
    </div>
  );
}

function AdminField({ field, options = [], value, imagePreview, onChange, onFile }: { field: Field; options?: AdminRecord[]; value: AdminRecord[string]; imagePreview?: string; onChange: (value: string | boolean) => void; onFile?: (file?: File) => void }) {
  if (field.type === "checkbox") {
    return (
      <label className="flex h-11 items-center gap-3 rounded-md border px-3 text-sm font-bold">
        <input checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
        {field.label}
      </label>
    );
  }
  if (field.type === "textarea") {
    return (
      <label className="grid gap-2 text-sm font-bold md:col-span-2">
        {field.label}
        <textarea className="min-h-28 rounded-md border px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-brand-red" value={toInputValue(value)} onChange={(event) => onChange(event.target.value)} required={field.required} placeholder={field.placeholder} />
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <label className="grid gap-2 text-sm font-bold">
        {field.label}
        <select className="h-10 rounded-md border bg-white px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-brand-red" value={toInputValue(value)} onChange={(event) => onChange(event.target.value)} required={field.required}>
          <option value="">Select {field.label}</option>
          {options.map((option) => (
            <option key={String(option.id)} value={String(option.id)}>
              {String(option.name ?? option.title ?? option.id)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (field.type === "image") return <ImageInput label={field.label} currentUrl={imagePreview} onFile={onFile} />;

  return <AdminTextInput label={field.label} value={toInputValue(value)} onChange={onChange} required={field.required} placeholder={field.placeholder} type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"} />;
}

function AdminTextInput({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-brand-dark">
      {label}
      <input className="h-11 rounded-lg border border-border px-4 text-sm font-normal outline-none transition focus:border-brand-red focus:ring-2 focus:ring-red-100" value={value} onChange={(event) => onChange(event.target.value)} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

function ImageInput({ label, currentUrl, onFile }: { label: string; currentUrl?: string; onFile?: (file?: File) => void }) {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const preview = previewUrl || currentUrl;

  return (
    <label className="grid gap-2 text-sm font-bold text-brand-dark">
      {label}
      {preview ? (
        <img src={assetUrl(preview)} alt="" className="h-28 w-40 rounded-lg border bg-white object-contain p-1" />
      ) : null}
      <span className="relative inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted px-4 text-sm font-bold transition hover:border-brand-red hover:bg-red-50">
        <Upload className="size-4" />
        {selectedFile ? selectedFile.name : currentUrl ? "Change Image" : "Upload Image"}
        <input
          className="absolute inset-0 cursor-pointer opacity-0"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            setSelectedFile(nextFile);
            onFile?.(nextFile);
          }}
        />
      </span>
    </label>
  );
}

function DataTable({ rows, columns, loading, empty, onEdit, onDelete, compact }: { rows: AdminRecord[]; columns: string[]; loading?: boolean; empty: string; onEdit?: (row: AdminRecord) => void; onDelete?: (row: AdminRecord) => void; compact?: boolean }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className={`w-full min-w-[760px] border-collapse text-left text-sm ${compact ? "min-w-[520px]" : ""}`}>
        <thead>
          <tr className="bg-muted">
            {columns.map((column) => (
              <th key={column} className="border-b px-3 py-3 font-black">{formatLabel(column)}</th>
            ))}
            {(onEdit || onDelete) && <th className="w-28 border-b px-3 py-3 font-black">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={columns.length + 1}>Loading...</td></tr>
          ) : rows.length ? (
            rows.map((row) => (
              <tr key={row.id} className="border-b last:border-b-0">
                {columns.map((column) => <td key={column} className="max-w-[260px] truncate px-3 py-3">{renderCell(row[column], column)}</td>)}
                {(onEdit || onDelete) && (
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      {onEdit ? <button type="button" onClick={() => onEdit(row)} className="grid size-8 place-items-center rounded-md border hover:bg-muted" title="Edit"><Pencil className="size-4" /></button> : null}
                      {onDelete ? <button type="button" onClick={() => onDelete(row)} className="grid size-8 place-items-center rounded-md border text-brand-red hover:bg-red-50" title="Delete"><Trash2 className="size-4" /></button> : null}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr><td className="px-3 py-8 text-center text-muted-foreground" colSpan={columns.length + 1}><EmptyState text={empty} /></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MiniTable({ rows, columns }: { rows: AdminRecord[]; columns: string[] }) {
  return rows.length ? <DataTable rows={rows} columns={columns} empty="No records yet." compact /> : <EmptyState text="No records yet." />;
}

function EditorDialog({
  title,
  children,
  onClose,
  onSubmit,
  saving,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  saving: boolean;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-3 md:p-6">
      <form onSubmit={onSubmit} className={`mx-auto overflow-hidden rounded-xl bg-[#f7f7f8] shadow-2xl ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4 md:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-brand-red">Product Management</p>
            <h3 className="font-display text-2xl font-black text-brand-dark">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg border bg-white"><X className="size-4" /></button>
        </div>
        <div className="p-4 md:p-6">{children}</div>
        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-5 py-4 md:px-6">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-bold"><X className="size-4" />Cancel</button>
          <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-red px-5 text-sm font-bold text-white shadow-brand disabled:opacity-60" disabled={saving}><Save className="size-4" />{saving ? "Saving Product..." : "Save Product"}</button>
        </div>
      </form>
    </div>
  );
}

function PageTitle({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="font-display text-3xl font-black">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actionLabel ? <button onClick={onAction} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-red px-4 text-sm font-bold text-white shadow-brand"><Plus className="size-4" />{actionLabel}</button> : null}
    </div>
  );
}

function InfoPanel({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return <section className={`rounded-lg border bg-white p-4 shadow-soft ${className}`}><h3 className="mb-3 font-display text-lg font-black">{title}</h3>{children}</section>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h4 className="mb-3 font-display text-lg font-black">{title}</h4><div className="grid gap-4 md:grid-cols-2">{children}</div></section>;
}

function ProductBreadcrumb({ form, options }: { form: AdminRecord; options: Record<string, AdminRecord[]> }) {
  const service = options.services?.find((row) => String(row.id) === String(form.service_id));
  const category = options.categories?.find((row) => String(row.id) === String(form.category_id));
  return <p className="rounded-md bg-muted px-3 py-2 text-sm font-bold text-muted-foreground">Catalog &gt; {String(service?.name ?? "Service")} &gt; {String(category?.name ?? "Category")} &gt; {String(form.name || "Product")}</p>;
}

function Notice({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "error" }) {
  return <p className={`mt-5 rounded-md px-3 py-2 text-sm font-semibold ${tone === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{children}</p>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="py-4 text-center text-sm text-muted-foreground">{text}</div>;
}

function defaultForm(resource: ResourceConfig): AdminRecord {
  return Object.fromEntries(
    resource.fields.map((field) => {
      if (field.name === "status") return [field.name, resource.key === "blogs" ? "DRAFT" : resource.key === "inquiries" ? "NEW" : "ACTIVE"];
      if (field.type === "checkbox") return [field.name, false];
      if (field.type === "number") return [field.name, field.name === "rating" ? 5 : 0];
      return [field.name, ""];
    }),
  );
}

function buildFormData(resource: ResourceConfig, form: AdminRecord, files: Record<string, File | undefined>) {
  const data = new FormData();
  for (const field of resource.fields) {
    if (field.type === "image") continue;
    const value = form[field.name];
    if (value === "" || value === undefined || value === null) continue;
    data.append(field.name, String(value));
  }
  Object.entries(files).forEach(([key, file]) => file && data.append(key, file));
  return data;
}

function fieldOptions(field: Field, options: Record<string, AdminRecord[]>, form: AdminRecord) {
  const values = options[field.optionsKey || ""] ?? [];
  if (field.dependsOn === "service_id" && form.service_id) {
    return values.filter((row) => String(row.service_id) === String(form.service_id));
  }
  return values;
}

function renderCell(value: AdminRecord[string], column?: string) {
  if (column?.includes("image") || column?.includes("logo")) {
    return value ? <img src={assetUrl(String(value))} alt="" className="h-12 w-20 rounded border bg-white object-contain p-1" /> : "-";
  }
  if (column && ["display_order", "sort_order", "rating", "id", "item_count"].includes(column)) return value ?? "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === 1) return "Yes";
  if (value === 0) return "No";
  if (!value) return "-";
  return String(value);
}

export function AdminPage({ pathname, navigate }: AdminPath) {
  useEffect(() => {
    document.title = "Admin Panel - Shivrudra Graphics";
  }, []);

  if (pathname === "/shivrudra_graphics-myadmin/login") {
    if (getToken()) navigate("/shivrudra_graphics-myadmin/dashboard");
    return <AdminLoginPage pathname={pathname} navigate={navigate} />;
  }

  if (!getToken()) {
    navigate("/shivrudra_graphics-myadmin/login");
    return null;
  }

  const resourceKey = pathname.split("/")[2] || "dashboard";
  const resource = resources.find((item) => item.key === resourceKey);

  return (
    <AdminShell pathname={pathname} navigate={navigate}>
      {resourceKey === "dashboard" ? (
        <AdminDashboard pathname={pathname} navigate={navigate} />
      ) : resourceKey === "products" ? (
        <ProductManagementPage />
      ) : resourceKey === "settings" ? (
        <SettingsPage />
      ) : resource ? (
        <AdminResourcePage resource={resource} />
      ) : (
        <AdminDashboard pathname={pathname} navigate={navigate} />
      )}
    </AdminShell>
  );
}
