import ClientClock from './components/ClientClock';
import ThemeToggle from './components/ThemeToggle';

export default function Home() {
  return (
    <div
      className="font-sans min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        background: `linear-gradient(135deg, var(--background-start), var(--background-mid), var(--background-end))`,
        color: 'var(--foreground)',
      }}
    >
      <ThemeToggle />

      <main className="flex flex-col items-center justify-center text-center max-w-2xl w-full gap-8 py-12">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#F97316] rounded-full blur-lg opacity-20 animate-pulse"></div>
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#orangeGradient)"
                strokeWidth="3"
                fill="none"
                opacity="0.8"
              />
              <text
                x="50"
                y="68"
                fontFamily="monospace"
                fontSize="60"
                fontWeight="bold"
                fill="url(#orangeGradient)"
                textAnchor="middle"
              >
                C
              </text>
              <defs>
                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#FB923C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#F97316] to-[#FB923C] tracking-tight">
            cigol.dev
          </h1>
        </div>

        {/* Current Time Display */}
        <div className="my-6 w-full">
          <ClientClock />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white">
            Coming Soon
          </h2>

          <p className="font-mono text-lg text-gray-300 leading-relaxed">
            <span className="text-[#F97316]">&gt;</span> cigol.dev is under construction! We&apos;re building a hub for developers, designers, and researchers with powerful tools, a personal portfolio, and a geek blog. Stay tuned!
          </p>

          {/* Available Tools */}
          <div className="bg-background/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Available Tools</h3>
            <div className="space-y-3">
              <a
                href="/beautifier"
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Code Snippet Beautifier</h4>
                    <p className="text-gray-400 text-sm">Transform your code into beautiful, shareable images</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Subscription Form */}
          <div className="space-y-4 w-full max-w-md mx-auto">
            <div className="bg-background/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Get notified when we launch</h3>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-full border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white font-semibold hover:from-[#EA580C] hover:to-[#F97316] transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 pt-4">
            <a
              href="https://x.com/cigol_dev"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group p-3 rounded-full bg-gray-800 hover:bg-[#F97316] transition-colors duration-300"
              aria-label="Follow us on X (formerly Twitter)"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:scale-110 transition-transform duration-300"
              >
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  fill="currentColor"
                  className="text-gray-400 group-hover:text-white"
                />
              </svg>
            </a>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-sm text-gray-500">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
          <p>&copy; 2025 cigol.dev. All rights reserved.</p>
          <span className="text-gray-700">•</span>
          <a href="/privacy" className="hover:text-[#F97316] transition-colors duration-300">
            Privacy
          </a>
          <span className="text-gray-700">•</span>
          <a href="/terms" className="hover:text-[#F97316] transition-colors duration-300">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}