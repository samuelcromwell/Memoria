declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      displayName: string | null;
      hasPassword: boolean;
      createdAt: string;
    }
  }
}

export {};
