import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Newspaper,
  RotateCw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { Breadcrumb } from "@/components/PageHero";
import { Link } from "@/components/AppLink";
import { usePublicContent } from "@/hooks/use-public-content";
import { assetUrl } from "@/lib/api";
import { fetchPublicBlogs, type PublicBlog } from "@/lib/public-content";

const PAGE_SIZE = 9;

function BlogDate({ value }: { value?: string }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
      <time dateTime={value}>
        {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </time>
    </span>
  );
}

function readTime(blog: PublicBlog) {
  return Math.max(
    1,
    Math.ceil(
      (blog.content || blog.excerpt || "").trim().split(/\s+/).filter(Boolean).length / 200,
    ),
  );
}

function BlogImage({ blog, detail = false }: { blog: PublicBlog; detail?: boolean }) {
  const [failed, setFailed] = useState(false);
  return blog.featured_image_url && !failed ? (
    <img
      src={assetUrl(blog.featured_image_url)}
      alt={blog.title}
      loading={detail ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={
        detail
          ? "max-h-[580px] w-full object-contain"
          : "h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
      }
    />
  ) : (
    <div
      className={
        "flex flex-col items-center justify-center gap-3 bg-[#f0f2f4] " +
        (detail ? "aspect-[16/9]" : "h-full")
      }
    >
      <Newspaper className="h-10 w-10 text-brand-red" strokeWidth={1.5} aria-hidden="true" />
      <span className="text-xs font-semibold uppercase text-muted-foreground">
        Shivrudra Graphics
      </span>
    </div>
  );
}

function BlogCard({ blog }: { blog: PublicBlog }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#e4e7eb] bg-white transition hover:border-[#cdd2d8] hover:shadow-lg">
      <Link
        to="/blogs/$slug"
        params={{ slug: blog.slug }}
        aria-label={"Read " + blog.title}
        className="block aspect-[16/10] overflow-hidden bg-[#f0f2f4] focus-visible:outline-2 focus-visible:outline-brand-red"
      >
        <BlogImage key={blog.featured_image_url} blog={blog} />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <BlogDate value={blog.publish_date} />
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {readTime(blog)} min read
          </span>
        </div>
        <h2 className="mt-4 min-h-14 break-words font-display text-xl font-bold leading-7 text-brand-dark">
          <Link
            to="/blogs/$slug"
            params={{ slug: blog.slug }}
            className="line-clamp-2 transition hover:text-brand-red"
          >
            {blog.title}
          </Link>
        </h2>
        <p className="mt-3 min-h-[66px] whitespace-pre-line break-words text-sm leading-[22px] text-muted-foreground">
          <span className="line-clamp-3">{blog.excerpt || blog.content || ""}</span>
        </p>
        <div className="mt-6 flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
            <UserRound className="h-4 w-4 shrink-0" />
            <span className="max-w-[160px] truncate" title={blog.author || "Shivrudra Graphics"}>
              {blog.author || "Shivrudra Graphics"}
            </span>
          </span>
          <Link
            to="/blogs/$slug"
            params={{ slug: blog.slug }}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-red"
          >
            Read More
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function BlogMessage({ error, children }: { error?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Newspaper className="mb-4 h-9 w-9 text-muted-foreground" strokeWidth={1.5} />
      <p role={error ? "alert" : "status"} className="font-medium text-brand-dark">
        {children}
      </p>
      {error ? (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-red"
        >
          <RotateCw className="h-4 w-4" />
          Try Again
        </button>
      ) : null}
    </div>
  );
}

export function BlogsPage({ slug }: { slug?: string }) {
  const { content: blogs, loading, error } = usePublicContent<PublicBlog[]>(fetchPublicBlogs, []);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const blog = slug ? blogs.find((item) => item.slug === slug) : undefined;
  const term = query.trim().toLowerCase();
  const filtered = blogs.filter(
    (item) =>
      !term ||
      [item.title, item.excerpt, item.author].some((value) => value?.toLowerCase().includes(term)),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  if (slug) {
    const related = blogs.filter((item) => item.id !== blog?.id).slice(0, 3);
    return (
      <div className="bg-white">
        <div className="container-page max-w-[1040px] py-8 sm:py-12">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand-red"
          >
            <ArrowLeft className="h-4 w-4" />
            All Blogs
          </Link>
          {loading ? (
            <BlogMessage>Loading article...</BlogMessage>
          ) : !blog ? (
            <BlogMessage error={error}>
              {error ? "Unable to load this article." : "Article not found."}
            </BlogMessage>
          ) : (
            <article className="pt-8 sm:pt-10">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase text-brand-red">Shivrudra Journal</p>
                <h1 className="mt-3 break-words font-display text-3xl font-extrabold leading-tight text-brand-dark sm:text-4xl lg:text-5xl">
                  {blog.title}
                </h1>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 shrink-0" />
                    <span className="break-words">{blog.author || "Shivrudra Graphics"}</span>
                  </span>
                  <BlogDate value={blog.publish_date} />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {readTime(blog)} min read
                  </span>
                </div>
              </div>
              {blog.featured_image_url ? (
                <figure className="mt-8 overflow-hidden rounded-lg bg-[#f0f2f4]">
                  <BlogImage key={blog.featured_image_url} blog={blog} detail />
                </figure>
              ) : null}
              <div className="mx-auto mt-8 max-w-[720px] sm:mt-10">
                {blog.excerpt ? (
                  <p className="border-l-2 border-brand-red pl-5 text-lg leading-8 text-brand-dark">
                    {blog.excerpt}
                  </p>
                ) : null}
                <div className="mt-7 space-y-6 break-words text-base leading-8 text-[#40454d]">
                  {(blog.content || "")
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index} className="whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))}
                </div>
                <div className="mt-10 border-t border-border pt-6">
                  <Link
                    to="/blogs"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    All Blogs
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
        {blog && related.length ? (
          <section className="border-t border-border bg-brand-light py-12">
            <div className="container-page">
              <h2 className="mb-6 font-display text-2xl font-bold">More From the Journal</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <BlogCard key={item.id} blog={item} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-[#f7f8fa]">
        <div className="container-page py-10 sm:py-14">
          <div className="[&_nav]:text-muted-foreground [&_nav_span]:text-muted-foreground">
            <Breadcrumb items={[{ label: "Blogs" }]} />
          </div>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-brand-dark sm:text-5xl">
            Blogs
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Ideas, inspiration and updates from the world of printing, branding and signage.
          </p>
        </div>
      </section>
      <section className="container-page py-8 sm:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold">Latest Articles</h2>
            {!loading ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "article" : "articles"}
                {term ? " found" : ""}
              </p>
            ) : null}
          </div>
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Search blogs</span>
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search articles"
              className="h-11 w-full rounded-md border border-[#dce0e5] bg-white pl-10 pr-10 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-1 top-1 grid h-9 w-9 place-items-center text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
        </div>
        {loading ? (
          <div
            role="status"
            aria-label="Loading blogs"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[0, 1, 2].map((item) => (
              <div key={item} className="overflow-hidden rounded-lg border border-border">
                <div className="aspect-[16/10] animate-pulse bg-muted motion-reduce:animate-none" />
                <div className="space-y-4 p-6">
                  <div className="h-3 w-1/3 bg-muted" />
                  <div className="h-6 w-4/5 bg-muted" />
                  <div className="h-14 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : !blogs.length ? (
          <BlogMessage error={error}>
            {error ? "Unable to load blogs." : "No published posts yet."}
          </BlogMessage>
        ) : !filtered.length ? (
          <BlogMessage>No articles match your search.</BlogMessage>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((item) => (
                  <BlogCard key={item.id} blog={item} />
                ))}
            </div>
            {pageCount > 1 ? (
              <nav
                aria-label="Blog pagination"
                className="mt-10 flex items-center justify-center gap-5 border-t border-border pt-6"
              >
                <button
                  type="button"
                  title="Previous page"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="grid h-10 w-10 place-items-center rounded-md border disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span aria-live="polite" className="text-sm text-muted-foreground">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  type="button"
                  title="Next page"
                  aria-label="Next page"
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                  className="grid h-10 w-10 place-items-center rounded-md border disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
