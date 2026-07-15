import { landingAssets } from "@/components/landing/figma-assets";
import { LandingAssetImage } from "@/components/landing/landing-asset-image";
import { landingContainerClass, landingHeadingFont, landingLabelFont } from "@/components/landing/styles";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    title: "Upload Resume",
    description: "Import your base experience. Our system parses your career history instantly.",
    icon: landingAssets.stepUpload,
    iconW: 20,
    iconH: 25,
  },
  {
    step: "02",
    title: "Set Parameters",
    description: "Define your ideal role, salary floor, and target industries.",
    icon: landingAssets.stepParameters,
    iconW: 23,
    iconH: 23,
  },
  {
    step: "03",
    title: "Automated Matching",
    description: "The agent deploys, filtering thousands of roles down to high-signal opportunities.",
    icon: landingAssets.stepMatching,
    iconW: 25,
    iconH: 25,
  },
  {
    step: "04",
    title: "Tailored Documents",
    description: "Receive ready-to-send artifacts optimized for ATS and human readers.",
    icon: landingAssets.stepDocuments,
    iconW: 25,
    iconH: 25,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#10131a] py-20 sm:py-24">
      <div className={landingContainerClass}>
        <div className="mb-16 flex flex-col items-center gap-6 text-center sm:mb-20">
          <h2
            className={cn(
              landingHeadingFont,
              "text-3xl font-bold tracking-[-0.025em] text-white sm:text-5xl sm:leading-none"
            )}
          >
            The Flow Engine
          </h2>
          <div className="h-1 w-24 rounded-full bg-[#c0c1ff]" aria-hidden />
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-[rgba(70,69,84,0.3)] to-transparent lg:block"
            aria-hidden
          />

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {steps.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center lg:pt-0">
                <div className="mb-6 flex size-20 items-center justify-center rounded-full border border-white/[0.05] bg-[#1d2026] p-px">
                  <LandingAssetImage
                    src={item.icon}
                    alt=""
                    width={item.iconW}
                    height={item.iconH}
                    className="object-contain"
                  />
                </div>
                <div className="flex w-full max-w-[17rem] flex-col gap-2">
                  <p
                    className={cn(
                      landingLabelFont,
                      "text-[10px] font-medium uppercase tracking-[0.2em] text-[#c7c4d7]"
                    )}
                  >
                    Step {item.step}
                  </p>
                  <h3 className={cn(landingHeadingFont, "text-xl font-bold text-white")}>{item.title}</h3>
                  <p className="pt-1 text-sm leading-5 text-[#c7c4d7]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
