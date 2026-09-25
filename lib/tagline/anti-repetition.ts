import type { RawCandidate } from "./candidate-generator";

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function openingWords(text: string, n = 2): string {
  return normalize(text).split(" ").slice(0, n).join(" ");
}

/**
 * Tracks accepted candidates during one generation call and rejects
 * exact duplicates and candidates that share both a generation "shape"
 * and an opening phrase with something already accepted — the actual
 * repetition risk (many category-appropriate taglines legitimately
 * share a topic word; they shouldn't share structure AND opening too).
 */
export function createRepetitionGuard() {
  const seenNormalized = new Set<string>();
  const seenShapeOpening = new Set<string>();

  return {
    accepts(candidate: RawCandidate): boolean {
      const norm = normalize(candidate.text);
      if (seenNormalized.has(norm)) return false;

      const shapeOpeningKey = `${candidate.shapeId}::${openingWords(candidate.text)}`;
      return !seenShapeOpening.has(shapeOpeningKey);
    },
    record(candidate: RawCandidate): void {
      seenNormalized.add(normalize(candidate.text));
      seenShapeOpening.add(`${candidate.shapeId}::${openingWords(candidate.text)}`);
    },
  };
}
