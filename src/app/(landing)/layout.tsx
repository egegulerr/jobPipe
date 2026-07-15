import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-landing-manrope",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-landing-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-landing-space",
  weight: ["500"],
});

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`min-h-screen flex flex-col bg-[#10131a] text-white antialiased ${manrope.variable} ${inter.variable} ${spaceGrotesk.variable} [font-family:var(--font-landing-inter),ui-sans-serif,system-ui,sans-serif]`}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
