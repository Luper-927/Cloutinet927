import { POSITIONING_LANGUAGE, type BusinessProfile } from "./concept-engine";

// --- Seeded randomness (deterministic per business+attempt, no Math.random) ---

export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = (hash * 33) ^ str.charCodeAt(i);
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function pickTwoDistinct<T>(rng: () => number, arr: T[]): [T, T] {
  if (arr.length < 2) return [arr[0], arr[0]];
  const a = pick(rng, arr);
  let b = pick(rng, arr);
  let guard = 0;
  while (b === a && guard++ < 10) b = pick(rng, arr);
  return [a, b];
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function finish(text: string): string {
  return `${text.replace(/[.]+$/, "")}.`;
}

function plainNoun(noun: string): string {
  return noun.replace(/^your\s+|^the\s+/i, "");
}

function sharesWord(a: string, b: string): boolean {
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  return b.toLowerCase().split(/\s+/).some((w) => wordsA.has(w));
}

function pickAvoiding(rng: () => number, arr: string[], avoidText: string, maxTries = 6): string {
  let choice = pick(rng, arr);
  let tries = 0;
  while (sharesWord(avoidText, choice) && tries++ < maxTries && arr.length > 1) {
    choice = pick(rng, arr);
  }
  return choice;
}

function langFor(profile: BusinessProfile, rng: () => number): { angle: string } & typeof POSITIONING_LANGUAGE[string] {
  const pool = profile.positioning.slice(0, 4).length ? profile.positioning.slice(0, 4) : ["Quality"];
  const angle = pick(rng, pool);
  return { angle, ...(POSITIONING_LANGUAGE[angle] || POSITIONING_LANGUAGE.Quality) };
}

const GENERIC_SUBJECTS = ["your life", "your day", "you", "every visit"];
const CLOSERS = ["reimagined", "made real", "done right", "delivered"];
const DIFFERENTIATORS = ["sets you apart", "feels right", "makes you, you"];
const SHORT_VERBS = ["remember", "love", "trust", "recommend"];
// Deliberately small & neutral so subject-verb pairing never sounds
// like the (often inanimate) noun has agency ("Products that value...").
const SAFE_DELIVER_VERBS = ["deliver", "bring", "keep"];

export interface RawCandidate {
  shapeId: string;
  text: string;
}

type Shape = (profile: BusinessProfile, rng: () => number) => string | null;

// Each shape produces one sentence structure. Together they give the
// engine ~14 distinct ways to phrase an idea, so output isn't obviously
// one fill-in-the-blank template repeated with different words.
const SHAPES: Record<string, Shape> = {
  conceptFragmentPair(profile, rng) {
    const [c1, c2] = pickTwoDistinct(rng, profile.concepts);
    const second = rng() < 0.5 ? c2 : pick(rng, CLOSERS);
    return finish(`${cap(c1)}. ${cap(second)}`);
  },
  nounThatDelivers(profile, rng) {
    // "made to <verb>" stays grammatical regardless of whether the noun
    // is singular, plural, or a mass noun ("Car", "Meals", "Beauty") —
    // avoids subject-verb agreement bugs like "Car that keep trust."
    const noun = plainNoun(pick(rng, profile.nouns));
    const verb = pick(rng, SAFE_DELIVER_VERBS);
    const desire = pickAvoiding(rng, profile.desires, noun);
    return finish(`${cap(noun)}, made to ${verb} ${desire}`);
  },
  whereConceptTakesShape(profile, rng) {
    const concept = pick(rng, profile.concepts);
    return finish(`Where ${concept} takes shape`);
  },
  adjectiveNounForDesire(profile, rng) {
    const { adjective } = langFor(profile, rng);
    const noun = pick(rng, profile.nouns);
    const desire = pick(rng, profile.desires);
    return finish(`${cap(adjective)} ${noun}, made for ${desire}`);
  },
  madeForBuiltTo(profile, rng) {
    const desire = pick(rng, profile.desires);
    const { builtTo } = langFor(profile, rng);
    return finish(`Made for ${desire}, built to ${builtTo}`);
  },
  nounMadeAroundSubject(profile, rng) {
    const noun = plainNoun(pick(rng, profile.nouns));
    const subject = pick(rng, GENERIC_SUBJECTS);
    return finish(`${cap(noun)} made around ${subject}`);
  },
  conceptMeetsConcept(profile, rng) {
    const [c1, c2] = pickTwoDistinct(rng, profile.concepts);
    return finish(`${cap(c1)} meets ${c2}`);
  },
  verbWhatDifferentiator(profile, rng) {
    const { verb } = langFor(profile, rng);
    const diff = pick(rng, DIFFERENTIATORS);
    return finish(`${cap(verb)} what ${diff}`);
  },
  nounYoullVerb(profile, rng) {
    const noun = plainNoun(pick(rng, profile.nouns));
    const verb = pick(rng, SHORT_VERBS);
    return finish(`${cap(noun)} you'll ${verb}`);
  },
  benefitWithoutPain(profile, rng) {
    const benefit = pick(rng, [...profile.benefits, ...profile.desires]);
    const pain = pick(rng, profile.painPoints);
    return finish(`${cap(benefit)}, without ${pain}`);
  },
  adjectiveProductForSubject(profile, rng) {
    if (!profile.productNouns.length) return null;
    const product = pick(rng, profile.productNouns);
    const subjectPool = profile.desires.length ? profile.desires : GENERIC_SUBJECTS;
    const subject = pickAvoiding(rng, subjectPool, product);
    // Skip the adjective if the product text already starts with it
    // (e.g. product "custom suits" + adjective "custom" would read
    // "Custom custom suits") rather than force a redundant word in.
    const { adjective } = langFor(profile, rng);
    const prefix = product.toLowerCase().startsWith(adjective.toLowerCase()) ? "" : `${cap(adjective)} `;
    const productText = prefix ? product : cap(product);
    return finish(`${prefix}${productText} for ${subject}`);
  },
  conceptFirstConceptAlways(profile, rng) {
    const [c1, c2] = pickTwoDistinct(rng, profile.concepts);
    return finish(`${cap(c1)} first. ${cap(c2)} always`);
  },
  businessNameKeepsIt(profile, rng) {
    if (!profile.businessName || profile.businessName.split(/\s+/).length > 4) return null;
    const { adjective } = langFor(profile, rng);
    return finish(`${profile.businessName} keeps it ${adjective}`);
  },
  businessNameConceptAlways(profile, rng) {
    if (!profile.businessName || profile.businessName.split(/\s+/).length > 4) return null;
    const concept = pick(rng, profile.concepts);
    return finish(`${profile.businessName}. ${cap(concept)}, always`);
  },
};

// Different attempts emphasize different shape families, so
// regeneration feels like a genuinely different pass rather than
// noise on top of the same one.
const STRATEGY_GROUPS: string[][] = [
  ["conceptFragmentPair", "whereConceptTakesShape", "conceptMeetsConcept", "conceptFirstConceptAlways"],
  ["nounThatDelivers", "adjectiveNounForDesire", "madeForBuiltTo", "nounMadeAroundSubject"],
  ["verbWhatDifferentiator", "nounYoullVerb", "benefitWithoutPain", "adjectiveProductForSubject", "businessNameKeepsIt", "businessNameConceptAlways"],
];

export interface CandidateGenerationInput {
  businessId?: string;
  businessName: string;
  category?: string | null;
  location?: string | null;
  attempt?: number;
}

function buildSeedKey(input: CandidateGenerationInput): string {
  return [input.businessId || input.businessName, input.category || "", input.location || "", input.attempt || 0].join("|");
}

/**
 * Generates a large pool of raw candidates for the scorer /
 * anti-repetition stage to work with.
 */
export function generateRawCandidates(
  input: CandidateGenerationInput,
  profile: BusinessProfile,
  poolSize = 32
): RawCandidate[] {
  const seed = hashString(buildSeedKey(input));
  const rng = mulberry32(seed);

  const attempt = input.attempt || 0;
  const primaryGroup = STRATEGY_GROUPS[attempt % STRATEGY_GROUPS.length];
  // Primary group gets emphasis (tried more often), but all shapes
  // stay in the pool so results are still varied within one call.
  const weightedShapeIds = [
    ...primaryGroup, ...primaryGroup, ...primaryGroup,
    ...Object.keys(SHAPES),
  ];

  const candidates: RawCandidate[] = [];
  let iterations = 0;
  const maxIterations = poolSize * 6;

  while (candidates.length < poolSize && iterations < maxIterations) {
    iterations++;
    const shapeId = pick(rng, weightedShapeIds);
    const text = SHAPES[shapeId](profile, rng);
    if (!text) continue;
    candidates.push({ shapeId, text });
  }

  return candidates;
}
