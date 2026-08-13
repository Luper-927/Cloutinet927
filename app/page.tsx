import type { Metadata, Viewport } from "next";
import {
  Search,
  Star,
  MessageCircle,
  Store,
  Package,
  Image as ImageIcon,
  Tag,
  MapPin,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloutinet — Create. Share. Grow.",
  description:
    "Cloutinet creates a Google-searchable page for your business so customers can find and contact you on WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const CHECKLIST = [
  { icon: Store, label: "Business Details" },
  { icon: Package, label: "Products & Services" },
  { icon: ImageIcon, label: "Photos & Videos" },
  { icon: Tag, label: "Prices" },
  { icon: MapPin, label: "Location" },
  { icon: MessageCircle, label: "WhatsApp Contact" },
];

const FLOW_STEPS = [
  { icon: Search, label: "They Search", color: "text-blue-500 bg-white" },
  { icon: Store, label: "They Find You", color: "text-white bg-purple-600" },
  { icon: MessageCircle, label: "They Contact You", color: "text-white bg-emerald-500" },
];

const PLANS = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "For businesses just getting started online.",
    features: [
      "1 Google-searchable page",
      "Up to 5 products or services",
      "WhatsApp contact button",
      "Basic visibility score",
    ],
    cta: "Start Free",
    href: "/signup?plan=free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₦5,000",
    period: "/month",
    description: "For businesses ready to rank and grow.",
    features: [
      "Everything in Free",
      "Unlimited products or services",
      "Full visibility score + tips",
      "Review management tools",
      "Priority support",
    ],
    cta: "Start Growth Plan",
    href: "/signup?plan=growth",
    highlighted: true,
  },
  {
    name: "Business",
    price: "₦15,000",
    period: "/month",
    description: "For teams managing multiple locations.",
    features: [
      "Everything in Growth",
      "Up to 5 business locations",
      "Analytics dashboard",
      "Dedicated account manager",
    ],
    cta: "Talk to Sales",
    href: "/contact?topic=business-plan",
    highlighted: false,
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Check Score", href: "/check-score" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <Navbar />
      <Hero />
      <Checklist />
      <Flow />
      <Pricing />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#3B0A6B] to-[#5B21B6]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white">
            <span className="text-sm font-bold text-purple-700">C</span>
          </span>
          <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
            Cloutinet
          </span>
        </a>
        <div className="flex items-center gap-2">
          <a
            href="/check-score"
            className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white sm:px-4 sm:text-sm"
          >
            Check Score
          </a>
          <a
            href="/signup"
            className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white sm:px-4 sm:text-sm"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#3B0A6B] via-[#5B21B6] to-[#7C3AED] px-4 pb-16 pt-10 text-center sm:px-6 sm:pb-24 sm:pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 top-4 grid grid-cols-4 gap-1.5 opacity-40 sm:right-10 sm:top-10"
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="h-1 w-1 rounded-full bg-white sm:h-1.5 sm:w-1.5" />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/10 to-transparent"
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl sm:h-20 sm:w-20">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 text-lg font-bold text-white sm:h-11 sm:w-11 sm:text-xl">
            C
          </span>
        </span>
        <p className="mt-3 text-lg font-semibold text-white sm:text-xl">Cloutinet</p>

        <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-5xl">
          Create.
          <br />
          Share.
          <br />
          <span className="text-emerald-400">Grow.</span>
        </h1>

        <p className="mt-4 max-w-sm text-sm text-purple-100 sm:text-base">
          Your business deserves to be found.
        </p>

        <a
          href="/signup"
          className="mt-6 flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-400 sm:px-8 sm:py-3.5 sm:text-base"
        >
          cloutinet.online
        </a>

        <div className="mt-10 grid grid-cols-3 gap-4 sm:mt-14 sm:gap-8">
          {[
            { icon: Store, label: "Create Your Page" },
            { icon: Search, label: "Get Found" },
            { icon: TrendingUp, label: "Grow Your Business" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </span>
              <span className="text-[10px] font-medium text-purple-100 sm:text-xs">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Checklist() {
  return (
    <section id="features" className="relative overflow-hidden bg-[#FAF5FF] px-4 py-14 sm:px-6 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-purple-200/50 blur-2xl sm:h-60 sm:w-60"
      />
      <div className="relative mx-auto max-w-xl">
        <h2 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
          Add <span className="text-purple-600">everything</span>
          <br />
          your customers need to know.
        </h2>

        <div className="mt-8 flex flex-col gap-3 sm:mt-10">
          {CHECKLIST.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm sm:p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 sm:h-12 sm:w-12">
                <item.icon className="h-5 w-5 text-white" />
              </span>
              <span className="text-sm font-medium text-slate-800 sm:text-base">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Flow() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
          Customers find you. They reach you.
          <br />
          <span className="text-emerald-500">You grow.</span>
        </h2>

        <div className="mt-10 flex items-center justify-center gap-3 sm:mt-14 sm:gap-6">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-md sm:h-16 sm:w-16 ${step.color}`}
                >
                  <step.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <span className="text-[10px] font-medium text-slate-600 sm:text-xs">
                  {step.label}
                </span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 sm:h-5 sm:w-5" />
              )}
            </div>
          ))}
        </div>

        <div className="relative mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 px-6 py-8 sm:mt-16 sm:py-10">
          <p className="text-lg font-bold text-white sm:text-xl">
            More Visibility.
            <br />
            More Customers. More Sales.
          </p>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-[#FAF5FF] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-[11px] font-semibold text-purple-700 sm:text-xs">
            SIMPLE PRICING
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Plans for every stage of your business
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-purple-600 bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-xl"
                  : "border-purple-100 bg-white"
              }`}
            >
              <p className={`text-sm font-semibold ${plan.highlighted ? "text-purple-100" : "text-slate-500"}`}>
                {plan.name}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.highlighted ? "text-purple-100" : "text-slate-400"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`mt-2 text-sm ${plan.highlighted ? "text-purple-100" : "text-slate-500"}`}>
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.highlighted ? "text-emerald-300" : "text-emerald-500"
                      }`}
                    />
                    <span className={plan.highlighted ? "text-white" : "text-slate-600"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`mt-7 flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                  plan.highlighted ? "bg-white text-purple-700" : "bg-purple-600 text-white"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0A6B] to-[#7C3AED] px-6 py-12 text-center sm:px-12 sm:py-16">
        <h2 className="text-2xl font-bold text-white sm:text-4xl">Ready to Get More Customers?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-purple-100 sm:text-base">
          Join Nigerian businesses already growing with Cloutinet.
        </p>
        <a
          href="/signup"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white sm:px-8 sm:py-3.5 sm:text-base"
        >
          Create Your Free Page
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#2B0854] pt-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 pb-10 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <span className="text-sm font-bold text-purple-700">C</span>
              </span>
              <span className="text-lg font-semibold text-white">Cloutinet</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-purple-200">
              Helping Nigerian businesses get found and win more customers.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-purple-200 hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-purple-300 sm:flex-row">
          <p>© {new Date().getFullYear()} Cloutinet. All rights reserved.</p>
          <p>Made for Nigerian businesses 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}
