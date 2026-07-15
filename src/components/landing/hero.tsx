import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  landingHeadingFont,
  landingPrimaryCtaHeroClass,
  landingSecondaryOutlineCtaClass,
} from "@/components/landing/styles";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36">
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 76% 50% at 50% 45%, rgba(128,131,255,0.12) 0%, rgba(128,131,255,0) 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[896px] flex-col items-center gap-10 px-6 text-center">
        <h1
          className={cn(
            landingHeadingFont,
            "max-w-[min(100%,36rem)] text-balance text-4xl font-extrabold tracking-[-0.025em] text-white sm:text-6xl lg:text-[5.5rem] lg:leading-[1.05]"
          )}
        >
          <span className="block">Your Career,</span>
          <span className="block bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] bg-clip-text text-transparent">
            Automated.
          </span>
        </h1>

        <p className="max-w-[42rem] text-pretty text-lg leading-relaxed text-[#c7c4d7] sm:text-xl sm:leading-[2rem]">
          Editorial Precision for the Modern Job Search. Deploy your automated pipeline to handle scraping,
          smart matching, and document generation in one seamless flow.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-4 pt-2 sm:flex-row sm:gap-4">
          <Button asChild size="lg" className={cn(landingHeadingFont, landingPrimaryCtaHeroClass)}>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className={cn(landingHeadingFont, landingSecondaryOutlineCtaClass)}
          >
            <Link href="/#how-it-works">How it Works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
