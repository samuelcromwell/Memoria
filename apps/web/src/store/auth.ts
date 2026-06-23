"use client";

import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import type { User } from "@/types/api";

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setupPassword: (password: string, confirmPassword: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  async fetchMe() {
    set({ loading: true });
    try {
      const response = await apiFetch<{ user: User }>("/api/auth/me");
      set({ user: response.user, loading: false, initialized: true });
    } catch {
      set({ user: null, loading: false, initialized: true });
    }
  },
  async login(email, password) {
    set({ loading: true });
    try {
      const response = await apiFetch<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: { email, password }
      });
      set({ user: response.user, loading: false, initialized: true });
    } catch (error) {
      set({ loading: false, initialized: true });
      throw error;
    }
  },
  async logout() {
    await apiFetch<void>("/api/auth/logout", { method: "POST" });
    set({ user: null, initialized: true });
  },
  async setupPassword(password, confirmPassword) {
    set({ loading: true });
    try {
      const response = await apiFetch<{ user: User }>("/api/auth/setup-password", {
        method: "POST",
        body: { password, confirmPassword }
      });
      set({ user: response.user, loading: false, initialized: true });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  }
}));
