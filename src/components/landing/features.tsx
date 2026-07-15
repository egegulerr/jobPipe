import { landingAssets } from "@/components/landing/figma-assets";
import { LandingAssetImage } from "@/components/landing/landing-asset-image";
import {
  landingContainerClass,
  landingFeatureCardClass,
  landingHeadingFont,
} from "@/components/landing/styles";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <section id="features" className="bg-[#0b0e14] py-20 sm:py-24">
      <div className={landingContainerClass}>
        <div className="mb-16 flex max-w-3xl flex-col gap-4">
          <h2 className={cn(landingHeadingFont, "text-3xl font-bold text-white sm:text-4xl sm:leading-10")}>
            The Intelligent Conduit
          </h2>
          <p className="max-w-xl text-base leading-6 text-[#c7c4d7]">
            We replace the manual grind with high-velocity, automated pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-6 lg:grid-rows-[minmax(0,auto)_minmax(0,auto)]">
          <div
            className={cn(
              landingFeatureCardClass,
              "relative order-1 overflow-hidden lg:col-span-4 lg:row-start-1 lg:min-h-[234px]"
            )}
          >
            <div className="pointer-events-none absolute -bottom-16 -right-16 opacity-20">
              <div className="rotate-12">
                <LandingAssetImage
                  src={landingAssets.abstractNetwork}
                  alt=""
                  width={256}
                  height={256}
                  className="size-64 object-contain"
                />
              </div>
            </div>
            <div className="relative z-10 flex max-w-lg flex-col gap-3">
              <LandingAssetImage
                src={landingAssets.featureScraping}
                alt=""
                width={30}
                height={29}
                className="h-[29px] w-[30px] shrink-0 self-start object-contain object-left"
              />
              <h3 className={cn(landingHeadingFont, "pt-1 text-2xl font-bold text-white")}>Automated Scraping</h3>
              <p className="text-base leading-6 text-[#c7c4d7]">
                Our agent scan job platforms, bypass bot detection, and find the &quot;invisible&quot;
                roles before they hit the major boards.
              </p>
            </div>
          </div>

          <div className={cn(landingFeatureCardClass, "order-2 flex flex-col gap-[11px] lg:col-span-2 lg:row-start-1 lg:min-h-[234px]")}>
            <LandingAssetImage
              src={landingAssets.featureSmartMatching}
              alt=""
              width={24}
              height={25}
              className="h-[25px] w-6 shrink-0 self-start object-contain object-left"
            />
            <h3 className={cn(landingHeadingFont, "pt-1 text-xl font-bold text-white")}>Smart Matching</h3>
            <p className="text-sm leading-[1.45] text-[#c7c4d7]">
              Beyond keywords. We analyze company culture, tech stacks, and growth trajectories to ensure a perfect fit.
            </p>
          </div>

          <div className={cn(landingFeatureCardClass, "order-3 flex flex-col gap-[11px] lg:col-span-2 lg:row-start-2")}>
            <LandingAssetImage
              src={landingAssets.featureSmartDocs}
              alt=""
              width={20}
              height={25}
              className="h-[25px] w-5 shrink-0 self-start object-contain object-left"
            />
            <h3 className={cn(landingHeadingFont, "pt-1 text-xl font-bold text-white")}>Smart-Generated Docs</h3>
            <p className="text-sm leading-[1.45] text-[#c7c4d7]">
              Custom resumes and cover letters crafted specifically for every single application, maintaining your
              unique editorial voice.
            </p>
          </div>

          <div
            className={cn(
              landingFeatureCardClass,
              "order-4 flex flex-col gap-8 lg:col-span-4 lg:row-start-2 lg:min-h-[226px] lg:flex-row lg:items-center lg:gap-8"
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <LandingAssetImage
                src={landingAssets.featurePipeline}
                alt=""
                width={23}
                height={23}
                className="size-[22.5px] shrink-0 self-start object-contain"
              />
              <h3 className={cn(landingHeadingFont, "pt-1 text-2xl font-bold text-white")}>Pipeline Transparency</h3>
              <p className="text-base leading-6 text-[#c7c4d7]">
                Track every application, interview, and follow-up in a unified high-tech command center. Never lose a
                lead again.
              </p>
            </div>
            <div className="flex w-full max-w-[192px] shrink-0 flex-col gap-2">
              <div className="h-2 w-full rounded-full bg-[#32353c]" />
              <div className="h-2 w-[80%] rounded-full bg-[#32353c]" />
              <div className="h-2 w-[60%] rounded-full bg-[rgba(78,222,163,0.4)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
