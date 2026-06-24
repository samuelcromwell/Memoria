import type { PrismaClient } from "@prisma/client";
import type { SessionData } from "express-session";
import { describe, expect, it, vi } from "vitest";
import { PrismaSessionStore } from "../lib/prismaSessionStore.js";

describe("PrismaSessionStore", () => {
  it("serializes session cookie dates before writing JSON to Prisma", async () => {
    const upsert = vi.fn().mockResolvedValue({});
    const prisma = {
      session: {
        upsert
      }
    } as unknown as PrismaClient;
    const store = new PrismaSessionStore(prisma, 1000);
    const expires = new Date("2026-06-24T10:00:00.000Z");

    await new Promise<void>((resolve, reject) => {
      store.set("sid", { cookie: { expires } } as unknown as SessionData, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    expect(upsert).toHaveBeenCalledWith({
      where: { sid: "sid" },
      create: {
        sid: "sid",
        data: { cookie: { expires: "2026-06-24T10:00:00.000Z" } },
        expiresAt: expires
      },
      update: {
        data: { cookie: { expires: "2026-06-24T10:00:00.000Z" } },
        expiresAt: expires
      }
    });
  });
});
