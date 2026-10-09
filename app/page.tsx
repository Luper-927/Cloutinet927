import type { Metadata, Viewport } from "next";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Package,
  CreditCard,
  Megaphone,
  Plug,
  Zap,
  Users,
  Briefcase,
  FileText,
  Activity,
  Layers,
  Code,
  Sparkles,
  Quote,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloutinet - Run Your Whole Business From One Place",
  description:
    "Manage your team, payments, documents and AI assistant in one system, built for growing businesses. Cloutinet brings customers, payments, documents, marketing and team management together.",
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "AI", href: "#ai" },
  { label: "How it works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
];

const TOOLS = [
  "Customers",
  "Employees",
  "Payments",
  "Documents",
  "Marketing",
  "Operations",
  "Analytics",
  "Automation",
];

const AREAS = [
  {
    key: "RUN",
    badge: "bg-blue-100 text-blue-700",
    tagline: "Operate the business.",
    items: [
      { icon: Briefcase, title: "Employees and permissions", text: "Invite staff and managers and choose exactly what each person can access." },
      { icon: FileText, title: "Documents", text: "Keep invoices, contracts and records in one place." },
      { icon: Activity, title: "Activity log", text: "See who did what across your business." },
      { icon: Sparkles, title: "Intelligence", text: "Ask questions about your business and get insights." },
    ],
  },
  {
    key: "GROW",
    badge: "bg-emerald-100 text-emerald-700",
    tagline: "Build relationships and commercial activity.",
    items: [
      { icon: Users, title: "Customers", text: "Customer records with tags and follow-up flags." },
      { icon: CreditCard, title: "Payments", text: "Send payment requests with a shareable link and record payments." },
      { icon: Package, title: "Products", text: "List your products and services with photos and prices." },
      { icon: Megaphone, title: "Marketing", text: "Create campaigns with AI-generated copy and track the results." },
    ],
  },
  {
    key: "CONNECT",
    badge: "bg-slate-200 text-slate-700",
    tagline: "Connect the business to customers and other systems.",
    items: [
      { icon: MessageCircle, title: "Customer contact", text: "WhatsApp and call buttons, with every tap tracked." },
      { icon: Plug, title: "Integrations", text: "WhatsApp Business API, analytics tools and custom webhooks." },
      { icon: Code, title: "Developer API", text: "API keys and a Trust-Score API for your own systems." },
    ],
  },
];

const AI_POINTS = [
  "Ask Cloutinet about your business: how it is performing, which customers to follow up with, what to improve this week.",
  "Insights appear on your dashboard, so you see what matters without digging through pages.",
  "Generate taglines, service lists and marketing copy for your campaigns.",
];

const AI_SUGGESTIONS = [
  "How is my business performing?",
  "Find customers I should follow up with",
  "Create a marketing message for new stock",
  "What should I improve this week?",
];

const JOURNEY = [
  { title: "Share your business", text: "A business page with your products, services and contact details that you can share with customers." },
  { title: "Get contacted", text: "Customers reach you by WhatsApp or phone. Page views and WhatsApp taps are tracked." },
  { title: "Keep the relationship", text: "Save customers, tag them and see who is due a follow-up." },
  { title: "Get paid", text: "Send payment requests with a shareable link and record payments as they arrive." },
  { title: "Know what changed", text: "Your dashboard brief summarises revenue, customers and visits. The activity log shows who did what." },
];

const SCALE_POINTS = [
  { icon: Building2, title: "Multiple locations", text: "Add branches and limit employees and data to a location." },
  { icon: Briefcase, title: "Roles and permissions", text: "Staff and manager roles, with access chosen feature by feature." },
  { icon: Layers, title: "Centralized data", text: "Customers, payments, documents and products live in one business record." },
  { icon: Activity, title: "Activity log", text: "A record of who did what, visible to the business owner." },
  { icon: Code, title: "API and webhooks", text: "API keys, a Trust-Score API and custom webhooks." },
  { icon: Users, title: "Seats that grow with you", text: "Employee seats rise with each plan, unlimited on Enterprise." },
];

const PLANS = [
  {
    name: "Free",
    price: "₦0",
    period: "",
    description: "For businesses just getting started online.",
    features: [
      "1 shareable business page",
      "Up to 5 products or services",
      "WhatsApp contact button",
      "Basic visibility score",
      "10 AI content generations/month",
    ],
    cta: "Start Free",
    href: "/auth?plan=free",
    highlighted: false,
  },
  {
    name: "Startup",
    price: "₦15,000",
    period: "/month",
    description: "For early-stage businesses with one location.",
    features: [
      "Everything in Free",
      "Up to 40 products or services",
      "Full visibility score + tips",
      "Customer records (CRM)",
      "70 AI content generations/month",
    ],
    cta: "Start Startup Plan",
    href: "/auth?plan=startup",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₦40,000",
    period: "/month",
    description: "For scaling teams ready to grow.",
    features: [
      "Everything in Startup",
      "Employee accounts (up to 5 seats)",
      "Payments module",
      "Document management",
      "Marketing campaigns with AI-generated copy",
      "180 AI content generations/month",
    ],
    cta: "Start Growth Plan",
    href: "/auth?plan=growth",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "₦75,000",
    period: "/month",
    description: "For companies managing multiple locations.",
    features: [
      "Everything in Growth",
      "Unlimited locations",
      "Up to 20 employee seats",
      "Advanced AI tools",
      "Priority support",
      "600 AI content generations/month",
    ],
    cta: "Start Scale Plan",
    href: "/auth?plan=scale",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-branch companies and custom needs.",
    features: [
      "Everything in Scale",
      "Unlimited employee seats",
      "Dedicated onboarding & support",
      "Custom integrations (webhooks, API)",
      "SLA-backed uptime & support",
      "Trust-Score API access (pay-as-you-go)",
    ],
    cta: "Talk to Sales",
    href: "/contact?topic=enterprise-plan",
    highlighted: false,
  },
];

const API_PRICING = [
  { range: "0 – 1,000 calls / month", price: "₦15", unit: "per call" },
  { range: "1,001 – 10,000 calls / month", price: "₦10", unit: "per call" },
  { range: "10,001+ calls / month", price: "₦6", unit: "per call, or contact sales" },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "#platform" },
      { label: "AI", href: "#ai" },
      { label: "Pricing", href: "#pricing" },
      { label: "Check Score", href: "/checker" },
      { label: "Trust-Score API", href: "/docs/trust-score" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
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
      <Problem />
      <Platform />
      <AiSection />
      <Workflow />
      <Scale />
      <Pricing />
      <ApiPricing />
      <UserQuote />
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
          <span className="text-2xl font-black tracking-tight text-white sm:text-3xl">
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
            href="/contact?topic=demo"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
          >
            Book a Demo
          </a>
          <a
            href="/auth"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Start Free
          </a>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <a
            href="/auth"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Start Free
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-[#0A0E27] pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-28 lg:pt-20"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 700px 500px at 10% -10%, rgba(29,78,216,0.35), transparent 70%), radial-gradient(ellipse 600px 600px at 100% 0%, rgba(37,99,235,0.28), transparent 70%)",
      }}
    >
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:gap-14 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div className="text-center lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-medium text-emerald-400 sm:mb-6 sm:px-4 sm:text-xs">
            One connected platform
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Run your whole business{" "}
            <span className="text-emerald-400">from one place.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:mt-6 sm:text-base lg:mx-0 lg:text-lg">
            Manage your team, payments, documents and AI assistant in one
            system, built for growing businesses.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="/auth"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:py-3.5"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/contact?topic=demo"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:py-3.5"
            >
              Book a Demo
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-400 sm:mt-7 sm:gap-x-6 sm:text-xs lg:justify-start">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Free plan available
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              No credit card required
            </span>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-white/15 ${className}`} />;
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-blue-600/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0D1230] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-slate-300">
            Product preview
          </span>
        </div>

        <div className="flex">
          <div className="hidden w-32 shrink-0 border-r border-white/10 p-3 sm:block">
            <p className="text-[11px] font-bold text-white">Cloutinet</p>
            {[
              { group: "Run", items: ["Documents", "Employees"] },
              { group: "Grow", items: ["Customers", "Payments"] },
              { group: "Connect", items: ["Integrations", "API"] },
            ].map((g) => (
              <div key={g.group} className="mt-3">
                <p className="text-[10px] font-semibold text-slate-500">{g.group}</p>
                {g.items.map((item) => (
                  <p key={item} className="mt-1.5 text-[11px] text-slate-400">
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-600/20 to-transparent p-4">
              <p className="text-sm font-semibold text-white">
                Here is what changed in your business
              </p>
              <div className="mt-3 space-y-2.5 text-[12px] leading-snug text-slate-300">
                <p className="border-t border-white/10 pt-2.5">
                  Payments recorded over the last 30 days.
                </p>
                <p className="border-t border-white/10 pt-2.5">
                  A payment request is waiting to be paid.
                </p>
                <p className="border-t border-white/10 pt-2.5">
                  New customers were added this week.
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {["Revenue", "Customers", "Pending", "Documents"].map((label) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                  <p className="text-[9px] text-slate-500 sm:text-[10px]">{label}</p>
                  <Skeleton className="mt-2 h-3 w-8" />
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03]">
              <p className="px-3 pt-3 text-[11px] font-semibold text-white">
                Needs your attention
              </p>
              {["Payment request past due", "Customer not contacted in 30+ days"].map((row) => (
                <div key={row} className="mt-2 flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {row}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400">Review</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Problem() {
  return (
    <section className="bg-white py-14 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Your business shouldn&apos;t run across ten disconnected tools.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
            Most businesses keep customers in one app, payments in another,
            documents in a folder and staff on a group chat. Nothing talks to
            anything else, and nobody sees the whole picture.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900 sm:text-base">
            Cloutinet connects these workflows.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOOLS.map((tool) => (
            <div
              key={tool}
              className="rounded-xl border border-dashed border-slate-300 bg-[#F5F7FB] px-3 py-4 text-center text-sm font-medium text-slate-600"
            >
              {tool}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Platform() {
  return (
    <section id="platform" className="bg-[#F5F7FB] py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            One operating system. <span className="text-blue-600">Every part of your business.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Three areas, one login, one set of business data.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 lg:grid-cols-3">
          {AREAS.map((area) => (
            <div key={area.key} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${area.badge}`}>
                {area.key}
              </span>
              <p className="mt-3 text-lg font-semibold text-slate-900">{area.tagline}</p>

              <ul className="mt-5 space-y-4">
                {area.items.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                      <span className="block text-sm leading-relaxed text-slate-500">{item.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiSection() {
  return (
    <section id="ai" className="bg-[#0A0E27] py-14 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300 sm:text-xs">
            <Sparkles className="h-3 w-3" />
            Cloutinet Intelligence
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            AI that works across your business.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            Cloutinet AI understands the customers, payments and activity in
            your account, so it can help you act on them instead of just
            writing text.
          </p>

          <ul className="mt-6 space-y-3">
            {AI_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-slate-500">
            AI features and monthly generation limits depend on your plan.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <p className="text-xs font-semibold text-slate-400">Ask Cloutinet</p>
          <div className="mt-3 rounded-lg border border-white/10 bg-[#0A0E27] px-4 py-3 text-sm text-slate-500">
            Ask Cloutinet anything about your business...
          </div>
          <p className="mt-5 text-xs font-semibold text-slate-400">Suggested</p>
          <div className="mt-2 space-y-2">
            {AI_SUGGESTIONS.map((s) => (
              <div key={s} className="rounded-lg border border-white/10 px-4 py-3 text-sm text-slate-200">
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section id="workflow" className="bg-white py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            From first contact to <span className="text-blue-600">business insight</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            The same system carries a customer from first contact to payment,
            and shows you what happened along the way.
          </p>
        </div>

        <div className="relative mt-10 grid grid-cols-1 gap-8 sm:mt-14 lg:grid-cols-5 lg:gap-6">
          <div aria-hidden className="absolute left-0 right-0 top-4 hidden border-t-2 border-dashed border-slate-200 lg:block" />
          {JOURNEY.map((step, i) => (
            <div key={step.title} className="relative">
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Scale() {
  return (
    <section className="bg-[#0A0E27] py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Built for the way companies <span className="text-emerald-400">grow</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            Add people, locations and connections without moving to a new system.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {SCALE_POINTS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.text}</p>
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
            Start free. Upgrade when you need more people, locations and tools.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 md:grid-cols-2 xl:grid-cols-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-blue-600 bg-blue-600 text-white shadow-xl"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className={`text-sm font-semibold ${plan.highlighted ? "text-blue-100" : "text-slate-500"}`}>
                {plan.name}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? "text-blue-100" : "text-slate-400"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`mt-2 text-sm leading-relaxed ${plan.highlighted ? "text-blue-100" : "text-slate-500"}`}>
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

function ApiPricing() {
  return (
    <section className="bg-[#F5F7FB] py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 sm:text-xs">
            <Zap className="h-3 w-3 fill-current" />
            PAY AS YOU GO
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:mt-4 sm:text-3xl lg:text-4xl">
            Trust-Score API
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Let your own systems check a business&apos;s Cloutinet visibility score programmatically. Only pay for what you actually call, with no bundles and no waste.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:mt-14">
          {API_PRICING.map((tier, i) => (
            <div
              key={tier.range}
              className={`flex items-center justify-between px-6 py-4 sm:px-8 ${
                i !== API_PRICING.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <span className="text-sm text-slate-600">{tier.range}</span>
              <span className="text-sm font-semibold text-slate-900">
                {tier.price} <span className="font-normal text-slate-400">{tier.unit}</span>
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Available as an add-on from the Startup plan and above. Billed monthly based on actual usage.
        </p>

        <div className="mt-6 flex justify-center">
          <a
            href="/docs/trust-score"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
          >
            View API Documentation
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function UserQuote() {
  return (
    <section className="bg-white py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Real customer quote, verified via Cloutinet feedback. Name and words unchanged. */}
        <div className="rounded-2xl border border-slate-200 bg-[#F5F7FB] p-6 sm:p-8">
          <Quote className="h-6 w-6 text-blue-600" />
          <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
            Cloutinet made it easy to have an online presence. I was able to create a professional business page, showcase my products, and share it with customers in just a few minutes.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              MO
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Michael Obi</p>
              <p className="text-xs text-slate-500">Cloutinet user</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="get-started" className="bg-white pb-14 sm:pb-20 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#0A0E27] px-5 py-12 text-center sm:rounded-3xl sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-blue-700/25 blur-[110px]"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Run your whole business from one place.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
              Start free, then add customers, payments, documents and your team as you grow.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/auth"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/contact?topic=demo"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                Book a Demo
              </a>
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
        <div className="grid grid-cols-2 gap-8 pb-10 sm:grid-cols-3 sm:gap-10 sm:pb-12 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="text-lg font-black text-white">Cloutinet</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Run your whole business from one place. Team, payments, documents and AI in one connected platform.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-500 transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 py-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Cloutinet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
