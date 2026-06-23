import type { PrismaClient, User } from "@prisma/client";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env, googleOAuthEnabled } from "./env.js";
import { toSafeUser } from "../types/auth.js";

export function configurePassport(prisma: PrismaClient): void {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser<number>(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user ? toSafeUser(user) : false);
    } catch (error) {
      done(error);
    }
  });

  if (!googleOAuthEnabled) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
        callbackURL: env.GOOGLE_CALLBACK_URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            done(new Error("Google account did not provide an email address."));
            return;
          }

          const displayName = profile.displayName || email;
          const oauthId = profile.id;
          const existing = await prisma.user.findFirst({
            where: {
              OR: [{ oauthId }, { email }]
            }
          });

          let user: User;
          if (existing) {
            user = await prisma.user.update({
              where: { id: existing.id },
              data: {
                oauthId: existing.oauthId ?? oauthId,
                displayName: existing.displayName ?? displayName
              }
            });
          } else {
            user = await prisma.user.create({
              data: {
                email,
                oauthId,
                displayName
              }
            });
          }

          done(null, toSafeUser(user));
        } catch (error) {
          done(error);
        }
      }
    )
  );
}
