import ClientClock from "./components/ClientClock";
import ThemeToggle from "./components/ThemeToggle";
import SubscriptionForm from "./components/SubscriptionForm";
import ToolCard from "./components/ToolCard";
import Logo from "./components/Logo";
import Footer from "./components/Footer";
import TimestampConverter from "./components/QuickUtils";

export default function Home() {
  const tools = [
    {
      href: "/beautifier",
      title: "Code Snippet Beautifier",
      description: "Transform your code into beautiful, shareable images",
    },
    {
      href: "https://geo.cigol.dev",
      title: "Maption",
      description: "The online SaaS platform for Geospatial Storytelling",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 flex flex-col items-center transition-colors duration-500 selection:bg-[#F97316]/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 优化后的左上角：增加了暗色模式下的透明度 */}
        <div
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] 
        bg-[#F97316]/20 dark:bg-[#F97316]/15 
        blur-[100px] rounded-full mix-blend-screen"
        />

        {/* 优化后的右下角：增加了暗色模式下的透明度 */}
        <div
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] 
        bg-blue-600/20 dark:bg-blue-500/15 
        blur-[100px] rounded-full mix-blend-screen"
        />
      </div>

      <div className="w-full max-w-7xl px-6 py-6 relative z-30 flex justify-end">
        <ThemeToggle />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-2xl relative z-10 text-center">
        <Logo />

        <div className="w-full mb-12">
          <ClientClock />
        </div>

        <section className="w-full space-y-3">
          <h3 className="text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 ml-1">
            Quick Tools: Epoch Converter
          </h3>
          <TimestampConverter />
        </section>

        <div className="space-y-12 w-full">
          <section>
            <div className="text-left text-xs font-bold uppercase text-slate-400 dark:text-gray-500 mt-2 ml-1 border border-dashed border-slate-300 dark:border-gray-600 p-4 rounded-lg mb-4">
              Other tools
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">
              Coming Soon
            </h2>
            <p className="font-mono text-slate-600 dark:text-gray-400 text-lg leading-relaxed max-w-lg mx-auto">
              <span className="text-[#F97316] animate-pulse">&gt;</span>{" "}
              cigol.dev is under construction!
            </p>
          </section>

          <section className="grid gap-3">
            <h3 className="text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 ml-1">
              Available Tools
            </h3>
            {tools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </section>

          <SubscriptionForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
