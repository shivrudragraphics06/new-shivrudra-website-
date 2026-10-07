import { PageHero } from "@/components/PageHero";
import { IndustriesGrid } from "@/components/IndustriesGrid";

export function IndustriesPage() {
  return (
    <div className="bg-white">
      <PageHero
        title="Industries We Serve"
        subtitle="A creative partner trusted across sectors for branding, printing and signage solutions."
        breadcrumb={[{ label: "Industries" }]}
      />
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px]">
          <IndustriesGrid />
        </div>
      </section>
    </div>
  );
}
