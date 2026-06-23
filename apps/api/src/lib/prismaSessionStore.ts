import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import session, { type SessionData } from "express-session";

type Callback<T = unknown> = (err?: unknown, data?: T | null) => void;

export class PrismaSessionStore extends session.Store {
  private readonly ttlMs: number;

  constructor(
    private readonly prisma: PrismaClient,
    ttlMs: number
  ) {
    super();
    this.ttlMs = ttlMs;
  }

  get(sid: string, callback: Callback<SessionData>): void {
    void this.prisma.session
      .findUnique({ where: { sid } })
      .then(async (record) => {
        if (!record) {
          callback(null, null);
          return;
        }

        if (record.expiresAt.getTime() <= Date.now()) {
          await this.prisma.session.deleteMany({ where: { sid } });
          callback(null, null);
          return;
        }

        callback(null, record.data as unknown as SessionData);
      })
      .catch((error) => callback(error));
  }

  set(sid: string, sessionData: SessionData, callback?: Callback): void {
    const expiresAt = this.getExpiresAt(sessionData);

    void this.prisma.session
      .upsert({
        where: { sid },
        create: {
          sid,
          data: sessionData as unknown as Prisma.InputJsonValue,
          expiresAt
        },
        update: {
          data: sessionData as unknown as Prisma.InputJsonValue,
          expiresAt
        }
      })
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }

  destroy(sid: string, callback?: Callback): void {
    void this.prisma.session
      .deleteMany({ where: { sid } })
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }

  touch(sid: string, sessionData: SessionData, callback?: Callback): void {
    void this.prisma.session
      .updateMany({
        where: { sid },
        data: { expiresAt: this.getExpiresAt(sessionData) }
      })
      .then(() => callback?.(null))
      .catch((error) => callback?.(error));
  }

  clearExpired(): Promise<{ count: number }> {
    return this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
  }

  private getExpiresAt(sessionData: SessionData): Date {
    const cookieExpires = sessionData.cookie?.expires;
    if (cookieExpires) {
      return new Date(cookieExpires);
    }

    return new Date(Date.now() + this.ttlMs);
  }
}
