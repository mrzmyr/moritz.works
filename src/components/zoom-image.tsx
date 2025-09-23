"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import Image, { type ImageProps } from "next/image";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & Partial<ImageProps>;

/**
 * Works with both <img> and Next.js <Image>.
 * If width/height are provided, we render <Image>; otherwise we render <img>.
 */
export function ZoomImage(props: Props) {
  const { width, height, alt = "", ...rest } = props;

  const canUseNextImage =
    typeof width === "number" &&
    typeof height === "number" &&
    // Next/Image needs src as string
    typeof (rest as any).src === "string";

  return (
    <Zoom>
      {canUseNextImage ? (
        <Image
          alt={alt}
          width={width as number}
          height={height as number}
          {...(rest as any)}
        />
      ) : (
        <img alt={alt} {...rest} />
      )}
    </Zoom>
  );
}
