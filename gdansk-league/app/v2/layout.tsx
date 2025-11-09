import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals-v2.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gdańsk League Hub - V2",
  description: "Poland's first ever LoL player hub - Minimal Design",
};

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
