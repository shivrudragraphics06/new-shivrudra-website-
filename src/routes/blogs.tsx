import { ArrowLeft, ArrowRight, Newspaper } from "lucide-react";
import { Link } from "@/components/AppLink";
import { PageHero } from "@/components/PageHero";
import { usePublicContent } from "@/hooks/use-public-content";
import { assetUrl } from "@/lib/api";
import { fetchPublicBlogs, type PublicBlog } from "@/lib/public-content";

function BlogDate({ value }: { value?: string }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return <time dateTime={value}>{date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>;
}

export function BlogsPage({ slug }: { slug?: string }) {
  const { content: blogs, loading, error } = usePublicContent<PublicBlog[]>(fetchPublicBlogs, []);
  const blog = slug ? blogs.find((item) => item.slug === slug) : undefined;

  if (slug) {
    return (
      <div className="bg-white">
        <PageHero title={blog?.title || "Blog"} breadcrumb={[{ label: "Blogs", to: "/blogs" }, { label: blog?.title || "Article" }]} />
        <article className="container-page max-w-4xl py-10">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red"><ArrowLeft className="h-4 w-4" />All Blogs</Link>
          {loading ? <p className="mt-8" role="status">Loading...</p> : error ? <p className="mt-8" role="alert">Unable to load this article.</p> : !blog ? <p className="mt-8">Article not found.</p> : (
            <>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {blog.author ? <span>{blog.author}</span> : null}
                <BlogDate value={blog.publish_date} />
              </div>
              {blog.featured_image_url ? <img src={assetUrl(blog.featured_image_url)} alt={blog.title} className="mt-6 max-h-[520px] w-full rounded-lg object-contain" /> : null}
              {blog.excerpt ? <p className="mt-6 text-lg leading-relaxed">{blog.excerpt}</p> : null}
              <div className="mt-6 whitespace-pre-wrap break-words text-base leading-8">{blog.content}</div>
            </>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <PageHero title="Blogs" subtitle="Printing, branding and signage updates from Shivrudra Graphics." breadcrumb={[{ label: "Blogs" }]} />
      <section className="container-page py-10">
        {loading ? <p role="status">Loading...</p> : error ? <p role="alert">Unable to load blogs.</p> : !blogs.length ? <p className="text-muted-foreground">No published posts yet.</p> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((item) => (
              <article key={item.id} className="min-w-0 overflow-hidden rounded-lg border border-border">
                <Link to="/blogs/$slug" params={{ slug: item.slug }} className="block aspect-[16/10] bg-brand-light">
                  {item.featured_image_url ? <img src={assetUrl(item.featured_image_url)} alt={item.title} loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><Newspaper className="h-12 w-12 text-brand-red" /></div>}
                </Link>
                <div className="p-5">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><BlogDate value={item.publish_date} />{item.author ? <span>{item.author}</span> : null}</div>
                  <h2 className="mt-3 break-words font-display text-xl font-bold"><Link to="/blogs/$slug" params={{ slug: item.slug }}>{item.title}</Link></h2>
                  {item.excerpt ? <p className="mt-3 line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p> : null}
                  <Link to="/blogs/$slug" params={{ slug: item.slug }} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-red">Read More<ArrowRight className="h-4 w-4" /></Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
