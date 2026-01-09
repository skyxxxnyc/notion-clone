import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StoreInitializer } from "@/components/layout/StoreInitializer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Notion Clone",
  description: "A full-featured Notion clone built with Next.js",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
