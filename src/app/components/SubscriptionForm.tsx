// components/SubscriptionForm.tsx

"use client";

export default function SubscriptionForm() {
  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="bg-background/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">
          Get notified when we launch
        </h3>

        <form className="flex flex-col sm:flex-row gap-3"> 
          <input
            type="email"
            name="email"
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
        <p className="text-xs text-gray-500 mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}