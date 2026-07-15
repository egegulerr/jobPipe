import Image from "next/image";
import type { ComponentProps } from "react";

type LandingAssetImageProps = Omit<ComponentProps<typeof Image>, "alt"> & {
  alt?: string;
};

export function LandingAssetImage({ alt = "", ...props }: LandingAssetImageProps) {
  return <Image alt={alt} unoptimized {...props} />;
}
