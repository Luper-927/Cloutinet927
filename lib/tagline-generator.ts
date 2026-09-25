import { buildBusinessProfile, type BusinessProfileInput } from "./tagline/concept-engine";
import { generateRawCandidates } from "./tagline/candidate-generator";
import { scoreCandidate } from "./tagline/scorer";
import { createRepetitionGuard } from "./tagline/anti-repetition";

const POOL_SIZE = 32;
const RESULT_COUNT = 5; // 1 tagline + up to 4 alternatives

export interface GenerateTaglineInput extends BusinessProfileInput {
  /** Stable business identifier, used to seed deterministic output. Falls back to businessName if omitted. */
  businessId?: string;
  businessName: string;
  /**
   * Increment this (e.g. 0, 1, 2, ...) to get a different deterministic
   * result for "Generate Another". Same attempt + same inputs = same output.
   */
  attempt?: number;
}

export interface TaglineResult {
  tagline: string;
  alternatives: string[];
  source: "cloutinet-local-engine";
}

/**
 * Generates a tagline entirely from local concepts, positioning logic,
 * and a scored/deduplicated candidate pool. No network request, no AI
 * API, no cost. Runs in well under a millisecond.
 */
export function generateTagline(input: GenerateTaglineInput): TaglineResult {
  const businessName = input.businessName?.trim() || "Your business";
  const profile = buildBusinessProfile({ ...input, businessName });

  const rawCandidates = generateRawCandidates(
    { businessId: input.businessId, businessName, category: input.category, location: input.location, attempt: input.attempt },
    profile,
    POOL_SIZE
  );

  const guard = createRepetitionGuard();
  const scored = [];

  for (const candidate of rawCandidates) {
    if (!guard.accepts(candidate)) continue;
    const result = scoreCandidate(candidate, profile);
    if (result.score <= 0) continue;
    guard.record(candidate);
    scored.push(result);
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, RESULT_COUNT);

  if (top.length === 0) {
    // Effectively unreachable given the generic fallback category, but
    // the feature must never crash even so.
    return { tagline: "Quality service, done right.", alternatives: [], source: "cloutinet-local-engine" };
  }

  return {
    tagline: top[0].text,
    alternatives: top.slice(1).map((c) => c.text),
    source: "cloutinet-local-engine",
  };
}
