import type { BusinessProfile } from "./concept-engine";
import type { RawCandidate } from "./candidate-generator";

// Honest disclosure: this is a rule-based scorer (weighted heuristics),
// not a trained model. It ranks candidates so the strongest few survive
// out of the larger generated pool.

export const CLICHE_PHRASES = [
  "elevate your",
  "transform your",
  "experience the best",
  "discover excellence",
  "your trusted partner",
  "quality you can trust",
  "where quality meets",
  "unleash your",
  "take your business to the next level",
  "best in",
  "#1",
  "no.1",
  "number one",
  "guaranteed",
  "leading provider",
  "world class",
  "world-class",
];

export interface ScoredCandidate extends RawCandidate {
  score: number;
  reasons: string[];
}

function wordCount(text: string): number {
  return text.replace(/[.]+$/, "").trim().split(/\s+/).length;
}

export function scoreCandidate(candidate: RawCandidate, profile: BusinessProfile): ScoredCandidate {
  const text = candidate.text;
  const lower = text.toLowerCase();
  const words = wordCount(text);
  const reasons: string[] = [];
  let score = 50;

  if (words < 2 || words > 12) return { ...candidate, score: 0, reasons: ["out of length bounds"] };
  if (words >= 3 && words <= 8) {
    score += 15;
    reasons.push("ideal length");
  } else {
    score -= 5;
    reasons.push("longer than ideal");
  }

  for (const phrase of CLICHE_PHRASES) {
    if (lower.includes(phrase)) {
      return { ...candidate, score: 0, reasons: [`cliche: "${phrase}"`] };
    }
  }

  const usesConcept = profile.concepts.some((c) => lower.includes(c.toLowerCase()));
  if (usesConcept) {
    score += 15;
    reasons.push("uses business concept");
  }
  const usesProductNoun = profile.productNouns.some((p) => lower.includes(p.toLowerCase()));
  if (usesProductNoun) {
    score += 10;
    reasons.push("references actual product");
  }

  const usesEmotion = profile.emotions.some((e) => lower.includes(e.toLowerCase()));
  if (usesEmotion) {
    score += 8;
    reasons.push("emotional resonance");
  }

  if (profile.businessName && lower.includes(profile.businessName.toLowerCase())) {
    score -= 6;
    reasons.push("includes business name (fine occasionally, penalized to limit overuse)");
  }
  if (profile.location && lower.includes(profile.location.toLowerCase())) {
    score -= 8;
    reasons.push("leans on location as an SEO keyword");
  }

  if (/[.!?]{2,}/.test(text)) {
    score -= 20;
    reasons.push("punctuation artifact");
  }
  if (/\s{2,}/.test(text)) {
    score -= 20;
    reasons.push("spacing artifact");
  }
  const letters = text.replace(/[^a-zA-Z]/g, "");
  const upper = letters.replace(/[^A-Z]/g, "");
  if (letters.length > 0 && upper.length / letters.length > 0.6) {
    score -= 15;
    reasons.push("shouting/caps");
  }

  if (words <= 4) {
    score += 5;
    reasons.push("punchy/memorable length");
  }

  return { ...candidate, score: Math.max(0, Math.min(100, score)), reasons };
}
