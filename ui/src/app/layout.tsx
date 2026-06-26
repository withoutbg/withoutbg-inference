import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "devicon/devicon.min.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Background Removal",
  description:
    "Open-source background removal editor. Upload any image and get a clean cutout.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="bg-wbg-page text-gray-900 dark:text-gray-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
