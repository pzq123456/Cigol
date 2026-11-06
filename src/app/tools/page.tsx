import type { Metadata } from "next";
import Link from "next/link";
import { liveTools, SITE } from "@/tools/registry";
import ToolCard from "@/app/components/ToolCard";

export const metadata: Metadata = {
  title: `All Tools — ${SITE.tagline}`,
  description: `Every free browser-based tool on ${SITE.name}. ${SITE.description}`,
  alternates: { canonical: "/tools" },
};

export default function ToolsIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100">
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-slate-800 dark:text-white hover:text-[#F97316] transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-mono text-xs flex items-center justify-center">
              C
            </span>
            <span>{SITE.name}</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 dark:text-gray-400 hover:text-[#F97316] transition-colors"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          All Tools
        </h1>
        <p className="mt-3 text-slate-600 dark:text-gray-400 leading-relaxed">
          {SITE.description}
        </p>

        <div className="mt-10 grid gap-3">
          {liveTools.map((tool) => (
            <ToolCard
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              title={tool.title}
              description={tool.description}
              icon={<span className="text-2xl">{tool.icon}</span>}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
