import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import ClientAuthProvider from "@/components/ClientAuthProvider";
import { constructMetadata } from "./metadata";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="icon" href="/images/nuqtalogo.webp" />
        <link rel="apple-touch-icon" href="/images/nuqtalogo.webp" />
        <meta name="theme-color" content="#111827" />
      </head>
      <body className={`${tajawal.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
} 