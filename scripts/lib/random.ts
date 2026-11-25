/**
 * Small seeded pseudo-random number generator used by the dataset generator.
 * Deterministic output is a hard requirement: the same seed must always
 * produce byte-identical CSV/JSON files.
 */

export interface Rng {
  /** Float in the range [0, 1). */
  next(): number;
  /** Integer in the inclusive range [min, max]. */
  int(min: number, max: number): number;
  /** True with the given probability (0..1). */
  chance(probability: number): boolean;
  /** Pick a single element from a non-empty array. */
  pick<T>(values: readonly T[]): T;
  /** Pick `count` unique elements (without replacement). */
  sample<T>(values: readonly T[], count: number): T[];
  /** Return a shuffled copy of the input. */
  shuffled<T>(values: readonly T[]): T[];
  /** Pick an element based on relative weights. */
  weighted<T>(entries: readonly (readonly [T, number])[]): T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number =>
    Math.floor(next() * (max - min + 1)) + min;

  const pick = <T,>(values: readonly T[]): T => {
    if (values.length === 0) {
      throw new Error('Cannot pick from an empty array');
    }
    return values[Math.floor(next() * values.length)] as T;
  };

  const shuffled = <T,>(values: readonly T[]): T[] => {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(next() * (i + 1));
      const a = copy[i] as T;
      const b = copy[j] as T;
      copy[i] = b;
      copy[j] = a;
    }
    return copy;
  };

  const sample = <T,>(values: readonly T[], count: number): T[] =>
    shuffled(values).slice(0, Math.max(0, Math.min(count, values.length)));

  const weighted = <T,>(entries: readonly (readonly [T, number])[]): T => {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = next() * total;
    for (const [value, weight] of entries) {
      roll -= weight;
      if (roll <= 0) {
        return value;
      }
    }
    return entries[entries.length - 1]![0];
  };

  return {
    next,
    int,
    chance: (probability) => next() < probability,
    pick,
    sample,
    shuffled,
    weighted,
  };
}
