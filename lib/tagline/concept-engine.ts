import { CATEGORIES, GENERIC, type CategoryKnowledge } from "./category-knowledge";

export interface BusinessProfileInput {
  businessName: string;
  category?: string | null;
  location?: string | null;
  products?: string[] | null;
}

export interface BusinessProfile extends CategoryKnowledge {
  businessName: string;
  location: string | null;
  productNouns: string[];
}

interface PositioningLanguageEntry {
  adjective: string;
  builtTo: string;
  verb: string;
}

// One entry per positioning word used anywhere in CATEGORIES (see
// category-knowledge.ts). candidate-generator.ts falls back to Quality
// if a positioning word isn't found here, so this doesn't strictly
// need to be exhaustive — but keeping it complete avoids everything
// quietly collapsing onto the same "Quality" phrasing.
export const POSITIONING_LANGUAGE: Record<string, PositioningLanguageEntry> = {
  Comfort: { adjective: "comfortable", builtTo: "last", verb: "embrace" },
  Craftsmanship: { adjective: "crafted", builtTo: "endure", verb: "craft" },
  Personalization: { adjective: "personal", builtTo: "fit you", verb: "tailor" },
  Quality: { adjective: "quality", builtTo: "last", verb: "deliver" },
  Style: { adjective: "stylish", builtTo: "turn heads", verb: "define" },
  Trust: { adjective: "trusted", builtTo: "earn trust", verb: "trust" },
  Reliability: { adjective: "reliable", builtTo: "hold up", verb: "rely on" },
  Value: { adjective: "affordable", builtTo: "deliver value", verb: "value" },
  Innovation: { adjective: "innovative", builtTo: "lead", verb: "innovate" },
  Speed: { adjective: "fast", builtTo: "move fast", verb: "deliver" },
  Convenience: { adjective: "convenient", builtTo: "simplify life", verb: "simplify" },
  Freshness: { adjective: "fresh", builtTo: "stay fresh", verb: "deliver" },
  Experience: { adjective: "memorable", builtTo: "leave a mark", verb: "create" },
  Confidence: { adjective: "confident", builtTo: "build confidence", verb: "empower" },
  Results: { adjective: "proven", builtTo: "deliver results", verb: "deliver" },
  "Local expertise": { adjective: "trusted", builtTo: "know the terrain", verb: "guide" },
  Simplicity: { adjective: "simple", builtTo: "keep it simple", verb: "simplify" },
};

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function matchCategory(category?: string | null): CategoryKnowledge {
  if (!category) return GENERIC;
  const needle = normalize(category);
  if (!needle) return GENERIC;

  for (const key of Object.keys(CATEGORIES)) {
    const entry = CATEGORIES[key];
    if (needle === normalize(key)) return entry;
    if (
      entry.aliases.some(
        (alias) =>
          needle === normalize(alias) ||
          needle.includes(normalize(alias)) ||
          normalize(alias).includes(needle)
      )
    ) {
      return entry;
    }
  }
  return GENERIC;
}

function buildProductNouns(products?: string[] | null): string[] {
  if (!products || !products.length) return [];
  return products.map((p) => (p || "").trim()).filter(Boolean).slice(0, 8);
}

/**
 * Resolves a business's free-text category into reusable concept
 * material (concepts, desires, positioning language, etc.), falling
 * back to a generic profile for anything unrecognized. Pure and
 * synchronous — no network, no DB.
 */
export function buildBusinessProfile(input: BusinessProfileInput): BusinessProfile {
  const knowledge = matchCategory(input.category);
  return {
    ...knowledge,
    businessName: (input.businessName || "").trim(),
    location: input.location?.trim() || null,
    productNouns: buildProductNouns(input.products),
  };
}
