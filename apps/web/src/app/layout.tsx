import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memoria",
  description: "Secure file upload dashboard",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
