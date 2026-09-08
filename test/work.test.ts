import { expect, test, describe } from "bun:test";
import { clampWork } from "../src/work";

describe("clampWork", () => {
  test("rejects junk", () => {
    expect(clampWork(null)).toBe(0);
    expect(clampWork("abc")).toBe(0);
    expect(clampWork("-5")).toBe(0);
  });
  test("clamps to the ceiling", () => {
    expect(clampWork("999999999")).toBe(3_000_000);
  });
  test("floors decimals", () => {
    expect(clampWork("100.9")).toBe(100);
  });
});
