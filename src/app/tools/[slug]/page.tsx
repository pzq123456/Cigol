import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool, liveTools, SITE } from "@/tools/registry";
import { getToolComponent } from "@/tools/map";
import ToolCard from "@/app/components/ToolCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return liveTools.map((tool) => ({ slug: tool.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};

  const title = `${tool.title} — ${SITE.tagline}`;
  const url = `${SITE.url}/tools/${tool.slug}`;

  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title,
      description: tool.description,
      url,
      type: "website",
      siteName: SITE.name,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tool.description,
    },
  };
}

function buildJsonLd(tool: NonNullable<ReturnType<typeof getTool>>) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    description: tool.description,
    url: `${SITE.url}/tools/${tool.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(tool.faq && tool.faq.length > 0
      ? {
          mainEntity: tool.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : {}),
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);
  const Component = getToolComponent(slug);

  if (!tool || !Component) notFound();

  const related = tool.related
    ? liveTools.filter((t) => t.slug !== tool.slug && tool.related!.includes(t.slug))
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(tool)) }}
      />

      <header className="border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-slate-800 dark:text-white hover:text-[#F97316] transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-mono text-xs flex items-center justify-center">
              C
            </span>
            <span>{SITE.name}</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-500 dark:text-gray-400">
            <Link href="/tools" className="hover:text-[#F97316] transition-colors">
              All tools
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <nav className="text-xs text-slate-400 dark:text-gray-500 mb-6 font-mono">
          <Link href="/" className="hover:text-[#F97316]">
            home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/tools" className="hover:text-[#F97316]">
            tools
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600 dark:text-gray-300">{tool.slug}</span>
        </nav>

        <div className="max-w-2xl">
          <div className="text-4xl mb-4" aria-hidden="true">
            {tool.icon}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {tool.title}
          </h1>
          <p className="mt-3 text-slate-600 dark:text-gray-400 leading-relaxed">
            {tool.description}
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 sm:p-6">
          <Component />
        </section>

        {tool.faq && tool.faq.length > 0 && (
          <section className="mt-12 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              FAQ
            </h2>
            <dl className="space-y-5">
              {tool.faq.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-slate-700 dark:text-gray-200">
                    {item.q}
                  </dt>
                  <dd className="mt-1.5 text-slate-600 dark:text-gray-400 leading-relaxed">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-3">
              Related tools
            </h2>
            <div className="grid gap-3">
              {related.map((t) => (
                <ToolCard
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  title={t.title}
                  description={t.description}
                  icon={<span className="text-2xl">{t.icon}</span>}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
