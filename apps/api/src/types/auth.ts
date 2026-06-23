import type { User } from "@prisma/client";

export type SafeUser = {
  id: number;
  email: string;
  displayName: string | null;
  hasPassword: boolean;
  createdAt: string;
};

export function toSafeUser(user: Pick<User, "id" | "email" | "displayName" | "passwordHash" | "createdAt">): SafeUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    hasPassword: Boolean(user.passwordHash),
    createdAt: user.createdAt.toISOString()
  };
}
