import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

import "@/app/globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Job Pipe — Your Career, Automated",
  description:
    "Editorial precision for the modern job search. Automated scraping, smart matching, and tailored documents in one flow.",
  keywords: ["job search", "AI", "resume", "cover letter", "automation", "LinkedIn", "Indeed"],
  authors: [{ name: "Job Pipe" }],
  openGraph: {
    title: "Job Pipe — Your Career, Automated",
    description:
      "Editorial precision for the modern job search. Automated scraping, smart matching, and tailored documents in one flow.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
