import { describe, expect, it } from "vitest";
import { normalizeTags } from "../utils/tags.js";

describe("normalizeTags", () => {
  it("deduplicates and sanitizes comma separated input", () => {
    expect(normalizeTags("Finance, #Finance, personal docs, odd!*")).toEqual(["finance", "personal-docs", "odd"]);
  });

  it("accepts JSON array input from multipart forms", () => {
    expect(normalizeTags("[\"Tax\", \" invoices \"]")).toEqual(["tax", "invoices"]);
  });
});
