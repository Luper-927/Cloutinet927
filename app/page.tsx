import type { Metadata, Viewport } from "next";
import SearchBar from "./components/SearchBar";
import {
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
  Quote,
  ClipboardList,
  Rocket,
  Users,
  Search,
  Megaphone,
  Plug,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloutinet — Get Found on Google. Get More Customers.",
  description:
    "Cloutinet is Nigeria's business visibility operating system — a Google-searchable page, AI-powered marketing campaigns, and the tools to run and grow your business, all in one place.",
  alternates: {
    canonical: '/',
  },
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
    icon: BarChart3,
    iconBg: "bg-rose-100 text-rose-600",
    title: "Visibility Score",
    description:
      "Get a score and actionable tips to improve your visibility on Google.",
  },
  {
    icon: Megaphone,
    iconBg: "bg-orange-100 text-orange-600",
    title: "Marketing Campaigns",
    description:
      "Create AI-generated promotional campaigns and track views, clicks and
