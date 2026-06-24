import { describe, expect, it } from "vitest";
import { normalizeDatabaseUrl } from "../config/databaseUrl.js";

describe("normalizeDatabaseUrl", () => {
  it("appends SSL for Railway public hosts in production", () => {
    const url = "mysql://user:pass@containers-us-west-123.railway.app:6543/memoria";
    expect(normalizeDatabaseUrl(url, "production")).toBe(`${url}?sslaccept=strict`);
  });

  it("does not append SSL when already configured", () => {
    const url = "mysql://user:pass@host:3306/memoria?sslaccept=strict";
    expect(normalizeDatabaseUrl(url, "production")).toBe(url);
  });

  it("does not append SSL for localhost", () => {
    const url = "mysql://memoria:memoria@localhost:3306/memoria";
    expect(normalizeDatabaseUrl(url, "production")).toBe(url);
  });
});
