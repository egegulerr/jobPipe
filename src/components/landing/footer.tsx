import Link from "next/link";
import { footerProductLinks } from "@/components/landing/footer-links";
import { landingContainerClass, landingHeadingFont, landingLabelFont } from "@/components/landing/styles";
import { cn } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#0f172a] bg-[#020617] pb-10 pt-16 sm:pt-20">
      <div className={landingContainerClass}>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className={cn(landingHeadingFont, "inline-block text-2xl font-bold tracking-[-0.05em] text-white")}
            >
              Job Pipe
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-[#64748b]">
              The ultimate automated career engine designed for editorial precision and high-velocity job seeking. Join
              the next generation of professionals.
            </p>
          </div>

          <div>
            <h4 className={cn(landingLabelFont, "mb-6 text-xs font-medium uppercase tracking-[0.1em] text-indigo-500")}>
              Product
            </h4>
            <ul className="flex flex-col gap-4">
              {footerProductLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#94a3b8] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-[#0f172a] pt-10 sm:flex-row sm:items-center">
          <p
            className={cn(
              landingLabelFont,
              "text-[10px] font-medium uppercase tracking-[0.1em] text-[#64748b]"
            )}
          >
            © {year} Job Pipe. Editorial Precision for Careers.
          </p>
          <div className="flex items-center gap-6 text-sm text-[#94a3b8]">
            <Link href="/about" className="transition-colors hover:text-white">
              About
            </Link>
            <Link href="/setup" className="transition-colors hover:text-white">
              Local setup
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
