import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("health route", () => {
  it("returns ok", async () => {
    const app = createApp();
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({ status: "ok" });
  });
});
