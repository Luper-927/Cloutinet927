import type { Metadata, Viewport } from "next";
import {
  Search,
  Star,
  Phone,
  MessageCircle,
  Navigation,
  Globe,
  MapPin,
  Store,
  Package,
  BarChart3,
  TrendingUp,
  ArrowRight,
  PlayCircle,
  Gift,
  CreditCard,
  Clock,
  CheckCircle2,
  Menu,
  X,
  Quote,
  ClipboardList,
  Rocket,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloutinet — Get Found on Google. Get More Customers.",
  description:
    "Cloutinet creates a Google-searchable page for your business so customers can find and contact you on WhatsApp.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Success Stories", href: "#success-stories" },
];

const FEATURES = [
  {
    icon: Store,
    iconBg: "bg-emerald-100 text-emerald-600",
    title: "Google-Searchable Page",
    description:
      "We create an SEO-optimized page for your business that shows up on Google.",
  },
  {
    icon: MessageCircle,
    iconBg: "bg-blue-100 text-blue-600",
    title: "WhatsApp Integration",
    description: "Customers can chat with you instantly on WhatsApp with one tap.",
  },
  {
    icon: Package,
    iconBg: "bg-violet-100 text-violet-600",
    title: "Products & Services",
    description:
      "Showcase your products and services with photos, prices and details.",
  },
  {
    icon: Star,
    iconBg: "bg-amber-100 text-amber-600",
    title: "Customer Reviews",
    description: "Build trust with reviews from happy customers.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-rose-100 text-rose-600",
    title: "Visibility Score",
    description:
      "Get a score and actionable tips to improve your visibility on Google.",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-teal-100 text-teal-600",
    title: "Analytics Dashboard",
    description: "Track views, clicks and WhatsApp messages in real-time.",
  },
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
    href: "/auth?plan=free",
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
    href: "/auth?plan=growth",
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

const STEPS = [
  {
    number: "1",
    icon: ClipboardList,
    iconBg: "bg-blue-50 text-blue-600",
    title: "Create Your Page",
    description:
      "Tell us about your business and add your products, services and photos.",
  },
  {
    number: "2",
    icon: Rocket,
    iconBg: "bg-blue-50 text-blue-600",
    title: "Get Discovered",
    description:
      "We create your Google-searchable page and optimize it for visibility.",
  },
  {
    number: "3",
    icon: Users,
    iconBg: "bg-blue-50 text-blue-600",
    title: "Get More Customers",
    description:
      "Customers find you on Google and contact you on WhatsApp. You grow your business!",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Cloutinet helped my business show up on Google in days. I now get more customers on WhatsApp daily!",
    name: "Chioma E.",
    role: "Fashion Designer, Lagos",
  },
  {
    quote:
      "The best decision I made this year. Setup was super easy and it's helping my business grow consistently.",
    name: "Ahmed R.",
    role: "Phone Accessories, Abuja",
  },
  {
    quote:
      "I love the visibility score feature. It shows me exactly what to fix and how to get more customers.",
    name: "Blessing O.",
    role: "Cakes & Pastries, Port Harcourt",
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Check Score", href: "/checker" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Success Stories", href: "#success-stories" },
      { label: "Contact", href: "mailto:cloutinet.hello@gmail.com" },
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
      <Features />
      <Pricing />
      <Testimonials />
      <Steps />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 relative border-b border-white/5 bg-[#0A0E27]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 sm:h-8 sm:w-8">
            <span className="text-xs font-bold text-white sm:text-sm">C</span>
          </span>
          <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
            Cloutinet
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/checker"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Check Score
          </a>
          <a
            href="/auth"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Get Started
          </a>
        </div>

        <input type="checkbox" id="nav-toggle" className="peer hidden" />
        <label
          htmlFor="nav-toggle"
          className="z-50 flex h-9 w-9 cursor-pointer items-center justify-center text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 peer-checked:hidden" />
          <X className="hidden h-6 w-6 peer-checked:block" />
        </label>

        <div className="absolute inset-x-0 top-full z-40 hidden max-h-0 flex-col overflow-hidden border-b border-white/5 bg-[#0A0E27] px-4 opacity-0 transition-all duration-200 peer-checked:flex peer-checked:max-h-[480px] peer-checked:py-4 peer-checked:opacity-100 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="border-b border-white/5 py-3 text-sm font-medium text-slate-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-3">
            <a
              href="/checker"
              className="rounded-full border border-white/20 px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Check Score
            </a>
            <a
              href="/auth"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#2E1065] via-[#5B21B6] to-[#7C3AED] pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-28 lg:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-[10%] h-[500px] w-[700px] rounded-full bg-purple-700/30 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-fuchsia-500/25 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_70%_at_70%_40%,black_30%,transparent_75%)] lg:block"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div className="text-center lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-medium text-emerald-400 sm:mb-6 sm:px-4 sm:text-xs">
            <span aria-hidden>🇳🇬</span>
            Proudly built for Nigerian Businesses
          </div>

          <h1 className="text-4xl font-extrabold leading-[0.95] tracking-tight text-white xs:text-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
            Get Found on Google.
            <br />
            Get More <span className="text-emerald-400">Customers.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-200 sm:mt-6 sm:text-base lg:mx-0 lg:text-lg">
            List your products and services for free. Cloutinet creates a
            Google-searchable page for your business so customers can find
            and contact you on WhatsApp.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="/auth"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:py-3.5"
            >
              Create Your Free Page
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:py-3.5"
            >
              <PlayCircle className="h-4 w-4" />
              See How It Works
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-200 sm:mt-7 sm:justify-start sm:gap-x-6 sm:text-xs">
            <span className="flex items-center gap-1.5">
              <Gift className="h-4 w-4 text-emerald-400" />
              100% Free to Start
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              No Credit Card
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-400" />
              Setup in 2 Minutes
            </span>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[260px] flex-col items-center gap-5 pt-2 sm:max-w-xs sm:flex-row sm:items-start sm:justify-center sm:gap-0 sm:pt-4 lg:max-w-none lg:justify-end lg:pr-6">
          <PhoneMockup />
          <ScoreCard />
        </div>
      </div>
    </section>
  );
} 

function PhoneMockup() {
  return (
    <div className="w-full max-w-[230px] rounded-[1.75rem] border-4 border-slate-800 bg-white p-2 shadow-2xl sm:max-w-[280px] sm:rounded-[2rem] lg:max-w-[320px]">
      <div className="overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem]">
        <div className="px-3 pb-2.5 pt-3 sm:px-4 sm:pb-3 sm:pt-4">
          <p className="text-center text-lg font-medium sm:text-xl">
            <span className="text-blue-500">G</span>
            <span className="text-red-500">o</span>
            <span className="text-amber-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-emerald-500">l</span>
            <span className="text-red-500">e</span>
          </p>
          <div className="mt-2.5 flex items-center justify-between rounded-full border border-slate-200 px-3 py-1.5 sm:mt-3 sm:py-2">
            <span className="text-[10px] text-slate-600 sm:text-[12px]">
              Best cakes in Lagos
            </span>
            <Search className="h-3 w-3 text-blue-500 sm:h-3.5 sm:w-3.5" />
          </div>
          <div className="mt-2 flex gap-3 border-b border-slate-100 pb-2 text-[9px] font-medium text-slate-500 sm:gap-4 sm:text-[10px]">
            <span className="border-b-2 border-blue-500 pb-1.5 text-blue-600">
              All
            </span>
            <span>Images</span>
            <span>Maps</span>
            <span>Videos</span>
            <span>News</span>
          </div>
        </div>

        <div className="px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
          <p className="text-[12px] font-semibold text-slate-900 sm:text-[13px]">
            Sweet Cravings Cakes
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[10px] font-medium text-slate-600 sm:text-[11px]">4.8</span>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-2 w-2 fill-current sm:h-2.5 sm:w-2.5" />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 sm:text-[11px]">(128)</span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
            Cake Shop in Lagos · <span className="text-emerald-600">Open</span>
          </p>

          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-2.5">
            <div className="h-11 rounded-md bg-gradient-to-br from-pink-200 to-rose-300 sm:h-14" />
            <div className="h-11 rounded-md bg-gradient-to-br from-amber-700 to-amber-900 sm:h-14" />
            <div className="h-11 rounded-md bg-gradient-to-br from-pink-100 to-fuchsia-200 sm:h-14" />
          </div>

          <div className="mt-2.5 grid grid-cols-4 gap-1 text-center sm:mt-3">
            {[
              { icon: Phone, label: "Call", color: "text-blue-600 bg-blue-50" },
              { icon: MessageCircle, label: "WhatsApp", color: "text-emerald-600 bg-emerald-50" },
              { icon: Navigation, label: "Directions", color: "text-blue-600 bg-blue-50" },
              { icon: Globe, label: "Website", color: "text-blue-600 bg-blue-50" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 ${color}`}>
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
                <span className="text-[8px] text-slate-500 sm:text-[9px]">{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-2.5 text-[10px] leading-relaxed text-slate-500 sm:mt-3 sm:text-[11px]">
            Delicious cakes for all occasions. Custom cakes, pastries and
            more. Lagos, Nigeria
          </p>

          <div className="mt-2 flex h-12 items-center justify-center rounded-lg bg-slate-100 sm:mt-2.5 sm:h-16">
            <MapPin className="h-4 w-4 text-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard() {
  return (
    <div className="static mx-auto w-32 rounded-xl border border-slate-100 bg-white p-3 shadow-xl sm:absolute sm:-right-4 sm:top-8 sm:mx-0 sm:w-36 sm:rounded-2xl sm:p-4 lg:-right-6 lg:top-10 lg:w-40">
      <p className="text-[10px] font-medium leading-snug text-slate-500 sm:text-[11px]">
        Your Business Visibility Score
      </p>
      <div className="relative mt-2 flex items-center justify-center sm:mt-3">
        <svg className="h-16 w-16 -rotate-90 sm:h-20 sm:w-20" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#22C55E"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 34}
            strokeDashoffset={2 * Math.PI * 34 * (1 - 0.85)}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-base font-bold text-emerald-500 sm:text-xl">85%</span>
        </div>
      </div>
      <p className="mt-1 text-center text-[10px] font-medium text-emerald-500 sm:text-[11px]">
        Great Job!
      </p>
      <svg viewBox="0 0 100 30" className="mt-1.5 h-5 w-full text-emerald-500 sm:mt-2 sm:h-6">
        <polyline
          points="0,25 20,20 40,22 60,10 80,12 100,2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="bg-[#F5F7FB] py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-end gap-5 sm:gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700 sm:text-xs">
              <Star className="h-3 w-3 fill-current" />
              POWERFUL FEATURES
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:mt-4 sm:text-3xl lg:text-4xl">
              Everything You Need to Get{" "}
              <span className="text-blue-600">Discovered &amp; Grow</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-500 sm:text-base lg:text-right">
            Cloutinet gives your business the visibility it deserves with
            tools that help you attract, engage and convert more customers.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full sm:mb-4 sm:h-11 sm:w-11 ${feature.iconBg}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-white py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700 sm:text-xs">
            SIMPLE PRICING
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:mt-4 sm:text-3xl lg:text-4xl">
            Plans for every stage of your business
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Start free. Upgrade whenever you're ready for more customers.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${
                plan.highlighted
                  ? "border-blue-600 bg-blue-600 text-white shadow-xl"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  plan.highlighted ? "text-blue-100" : "text-slate-500"
                }`}
              >
                {plan.name}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                  {plan.price}
                </span>
                <span
                  className={`text-sm ${
                    plan.highlighted ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  plan.highlighted ? "text-blue-100" : "text-slate-500"
                }`}
              >
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
                    <span className={plan.highlighted ? "text-white" : "text-slate-600"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`mt-7 flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-slate-900 text-white hover:bg-slate-800"
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

function Testimonials() {
  return (
    <section id="success-stories" className="bg-white py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0A0E27] px-5 py-10 sm:rounded-3xl sm:px-12 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-300 sm:text-xs">
              TRUSTED BY 2,000+ BUSINESSES
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl">
              Loved by Nigerian Businesses
            </h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current sm:h-4 sm:w-4" />
                ))}
              </div>
              <span className="text-xs text-slate-400 sm:text-sm">
                4.9/5 from 500+ reviews
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
              >
                <Quote className="h-5 w-5 text-blue-400" />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">
                  {t.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 sm:mt-9">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === 0 ? "w-5 bg-blue-500" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section id="how-it-works" className="bg-white pb-14 sm:pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700 sm:text-xs">
            EASY 3-STEP PROCESS
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:mt-4 sm:text-3xl lg:text-4xl">
            Get Started <span className="text-blue-600">in 3</span> Simple Steps
          </h2>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-8 sm:mt-16 sm:gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-4 hidden border-t-2 border-dashed border-slate-200 md:block"
          />
          {STEPS.map((step) => (
            <div key={step.number} className="relative text-left">
              <div className="relative z-10 flex items-center gap-3 bg-white pr-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {step.number}
                </span>
              </div>
              <div className={`mt-4 flex h-10 w-10 items-center justify-center rounded-xl sm:mt-5 sm:h-11 sm:w-11 ${step.iconBg}`}>
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 sm:mt-4 sm:text-lg">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="get-started" className="bg-white pb-14 sm:pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#0A0E27] px-5 py-10 sm:rounded-3xl sm:px-12 sm:py-14 lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-blue-700/25 blur-[110px]"
          />
          <div className="relative grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Ready to Get More Customers?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base lg:mx-0">
                Join thousands of Nigerian businesses already growing with Cloutinet.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href="/auth"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:py-3.5"
                >
                  Create Your Free Page
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/checker"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:py-3.5"
                >
                  Check Your Score Free
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-400 sm:mt-7 sm:justify-start sm:gap-x-6 sm:text-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  No Credit Card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Free Forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Setup in 5 Minutes
                </span>
              </div>
            </div>

            <div className="relative mx-auto hidden h-64 w-full max-w-sm lg:block">
              <div className="absolute right-6 top-2 w-40 rounded-2xl bg-white p-4 shadow-2xl">
                <p className="text-[10px] font-medium text-slate-500">
                  Visibility Score
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-500">85%</p>
                <p className="text-[10px] font-medium text-emerald-500">
                  Great Job!
                </p>
                <svg viewBox="0 0 100 30" className="mt-2 h-6 w-full text-emerald-500">
                  <polyline
                    points="0,25 20,20 40,22 60,10 80,12 100,2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="absolute bottom-2 left-2 w-44 rounded-2xl bg-white p-4 shadow-2xl">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  <p className="text-[10px] font-medium text-slate-500">
                    New WhatsApp Messages
                  </p>
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-900">23</p>
                <p className="text-[10px] font-medium text-emerald-500">
                  +12% this week
                </p>
              </div>
              <span className="absolute bottom-0 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-xl">
                <MessageCircle className="h-6 w-6 text-white" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0A0E27] pt-12 sm:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 pb-10 sm:grid-cols-3 sm:gap-10 sm:pb-12 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">C</span>
              </span>
              <span className="text-lg font-semibold text-white">Cloutinet</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Helping Nigerian businesses get found on Google and win more customers, every day.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/5 py-6 sm:flex-row sm:gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Cloutinet. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">Made for Nigerian businesses 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}
