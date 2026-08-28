import { describe, expect, it } from "vitest";
import { displayValue, resultLetter } from "./format";
import { matches } from "./demo-data";
describe("veri gösterimi", () => {
  it("bilinmeyen sayıyı sıfır yapmaz", () =>
    expect(displayValue(null)).toBe("Bilinmiyor"));
  it("maç sonucunu forma dönüştürür", () =>
    expect(resultLetter(matches[0])).toBe("G"));
});
