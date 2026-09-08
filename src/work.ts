import { config } from "./config";

export function clampWork(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), config.maxWork);
}

export function burn(iterations: number): void {
  let acc = 0n;
  for (let i = 0; i < iterations; i++) {
    acc = BigInt(Bun.hash(String(acc + BigInt(i)))) & 0xffffffffffffffffn;
  }
  if (acc === -1n) console.log("unreachable");
}
