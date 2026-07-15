/** Shared class strings for marketing / landing sections (fonts wired in `(landing)/layout`). */

export const landingHeadingFont =
  "font-[family-name:var(--font-landing-manrope),ui-sans-serif,sans-serif]";

export const landingLabelFont =
  "font-[family-name:var(--font-landing-space),ui-sans-serif,sans-serif]";

export const landingContainerClass = "mx-auto max-w-[1280px] px-6";

export const landingFeatureCardClass =
  "rounded-2xl border border-white/[0.05] bg-[#1d2026] p-8 sm:p-[33px]";

/** Header + compact primary actions */
export const landingPrimaryCtaHeaderClass =
  "rounded-xl border-0 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] px-6 py-2.5 font-bold text-[#1000a9] shadow-none hover:opacity-90";

export const landingPrimaryCtaHeaderMobileClass =
  "w-full rounded-xl bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] font-bold text-[#1000a9]";

/** Hero primary CTA */
export const landingPrimaryCtaHeroClass =
  "h-auto min-w-[200px] rounded-2xl border-0 bg-gradient-to-br from-[#c0c1ff] to-[#8083ff] px-10 py-4 text-lg font-bold text-[#1000a9] shadow-none hover:opacity-90";

/** Overrides Button `outline` variant accent hover text on dark landing surfaces. */
const landingOutlineCtaBaseClass =
  "border border-[rgba(70,69,84,0.3)] bg-transparent shadow-none hover:bg-white/5 hover:text-white";

export const landingSecondaryOutlineCtaClass =
  `${landingOutlineCtaBaseClass} h-auto min-w-[180px] rounded-2xl px-10 py-4 text-lg font-bold text-white`;
