import type { Metadata } from "next";
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

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <Steps />
      <FinalCta />
      <Footer />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0E27]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">C</span>
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
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

        <div className="flex items-center gap-3">
          <a
            href="#check-score"
            className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:inline-block"
          >
            Check Score
          </a>
          <a
            href="#get-started"
            className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:inline-block"
          >
            Get Started
          </a>
          <button className="text-white" aria-label="Open menu" type="button">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0A0E27] pb-20 pt-14 lg:pb-28 lg:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-[10%] h-[500px] w-[700px] rounded-full bg-blue-700/30 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-blue-600/25 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_70%_at_70%_40%,black_30%,transparent_75%)] lg:block"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <span aria-hidden>🇳🇬</span>
            Proudly built for Nigerian Businesses
          </div>

          <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Get Found on Google.
            <br />
            Get More <span className="text-emerald-400">Customers.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
            List your products and services for free. Cloutinet creates a
            Google-searchable page for your business so customers can find
            and contact you on WhatsApp.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#get-started"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Create Your Free Page
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how-it-works"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <PlayCircle className="h-4 w-4" />
              See How It Works
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
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
              Setup in 5 Minutes
            </span>
          </div>
        </div>

        <div className="relative mx-auto flex justify-center pt-4 lg:justify-end lg:pr-6">
          <PhoneMockup />
          <ScoreCard />
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="w-[300px] rounded-[2rem] border-4 border-slate-800 bg-white p-2 shadow-2xl sm:w-[320px]">
      <div className="overflow-hidden rounded-[1.5rem]">
        <div className="px-4 pb-3 pt-4">
          <p className="text-center text-xl font-medium">
            <span className="text-blue-500">G</span>
            <span className="text-red-500">o</span>
            <span className="text-amber-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-emerald-500">l</span>
            <span className="text-red-500">e</span>
          </p>
          <div className="mt-3 flex items-center justify-between rounded-full border border-slate-200 px-3 py-2">
            <span className="text-[12px] text-slate-600">
              Best cakes in Lagos
            </span>
            <Search className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="mt-2 flex gap-4 border-b border-slate-100 pb-2 text-[10px] font-medium text-slate-500">
            <span className="border-b-2 border-blue-500 pb-1.5 text-blue-600">
              All
            </span>
            <span>Images</span>
            <span>Maps</span>
            <span>Videos</span>
            <span>News</span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-1">
          <p className="text-[13px] font-semibold text-slate-900">
            Sweet Cravings Cakes
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] font-medium text-slate-600">4.8</span>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-2.5 w-2.5 fill-current" />
              ))}
            </div>
            <span className="text-[11px] text-slate-400">(128)</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Cake Shop in Lagos · <span className="text-emerald-600">Open</span>
          </p>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            <div className="h-14 rounded-md bg-gradient-to-br from-pink-200 to-rose-300" />
            <div className="h-14 rounded-md bg-gradient-to-br from-amber-700 to-amber-900" />
            <div className="h-14 rounded-md bg-gradient-to-br from-pink-100 to-fuchsia-200" />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1 text-center">
            {[
              { icon: Phone, label: "Call", color: "text-blue-600 bg-blue-50" },
              { icon: MessageCircle, label: "WhatsApp", color: "text-emerald-600 bg-emerald-50" },
              { icon: Navigation, label: "Directions", color: "text-blue-600 bg-blue-50" },
              { icon: Globe, label: "Website", color: "text-blue-600 bg-blue-50" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Delicious cakes for all occasions. Custom cakes, pastries and
            more. Lagos, Nigeria
          </p>

          <div className="mt-2.5 flex h-16 items-center justify-center rounded-lg bg-slate-100">
            <MapPin className="h-4 w-4 text-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCard() {
  return (
    <div className="absolute -right-2 top-6 w-40 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl sm:-right-6 sm:top-10">
      <p className="text-[11px] font-medium leading-snug text-slate-500">
        Your Business Visibility Score
      </p>
      <div className="relative mt-3 flex items-center justify-center">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
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
          <span className="text-xl font-bold text-emerald-500">85%</span>
        </div>
      </div>
      <p className="mt-1 text-center text-[11px] font-medium text-emerald-500">
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
  );
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

function Features() {
  return (
    <section id="features" className="bg-[#F5F7FB] py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <Star className="h-3 w-3 fill-current" />
              POWERFUL FEATURES
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything You Need to Get{" "}
              <span className="text-blue-600">Discovered &amp; Grow</span>
            </h2>
          </div>
          <p className="text-base leading-relaxed text-slate-500 lg:text-right">
            Cloutinet gives your business the visibility it deserves with
            tools that help you attract, engage and convert more customers.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${feature.iconBg}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
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

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

function Testimonials() {
  return (
    <section id="success-stories" className="bg-white py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0A0E27] px-6 py-14 sm:px-12 lg:py-16">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
              TRUSTED BY 2,000+ BUSINESSES
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Loved by Nigerian Businesses
            </h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-slate-400">
                4.9/5 from 500+ reviews
              </span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6"
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

          <div className="mt-9 flex items-center justify-center gap-2">
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

// ---------------------------------------------------------------------------
// 3-step process
// ---------------------------------------------------------------------------

function Steps() {
  return (
    <section id="how-it-works" className="bg-white pb-24 lg:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            EASY 3-STEP PROCESS
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Get Started <span className="text-blue-600">in 3</span> Simple Steps
          </h2>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
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
              <div className={`mt-5 flex h-11 w-11 items-center justify-center rounded-xl ${step.iconBg}`}>
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
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

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------

function FinalCta() {
  return (
    <section id="get-started" className="bg-white pb-24 lg:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0A0E27] px-6 py-14 sm:px-12 lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-blue-700/25 blur-[110px]"
          />
          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Get More Customers?
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
                Join thousands of Nigerian businesses already growing with Cloutinet.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  Create Your Free Page
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#check-score"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
                >
                  Check Your Score Free
                </a>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
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

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function Footer() {
  const columns = [
    { title: "Product", links: ["How it Works", "Features", "Pricing", "Check Score"] },
    { title: "Company", links: ["About", "Success Stories", "Careers", "Contact"] },
    { title: "Resources", links: ["Blog", "Help Center", "Local SEO Guide"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
  ];

  return (
    <footer className="border-t border-white/5 bg-[#0A0E27] pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 pb-12 sm:grid-cols-3 lg:grid-cols-6">
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

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Cloutinet. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">Made for Nigerian businesses 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}
