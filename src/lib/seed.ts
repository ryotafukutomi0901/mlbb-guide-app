export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededFloat(seed: string, min: number, max: number, decimals = 1): number {
  const n = hashSeed(seed) / 4294967295;
  const value = min + n * (max - min);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function seededInt(seed: string, min: number, max: number): number {
  return Math.floor(seededFloat(seed, min, max + 0.999, 3));
}

export function seededPick<T>(seed: string, pool: readonly T[], count: number, exclude?: T): T[] {
  const picked: T[] = [];
  let i = 0;
  while (picked.length < count && i < pool.length * 4) {
    const candidate = pool[seededInt(`${seed}:${i}`, 0, pool.length - 1)];
    if (candidate !== exclude && !picked.includes(candidate)) picked.push(candidate);
    i++;
  }
  return picked;
}
