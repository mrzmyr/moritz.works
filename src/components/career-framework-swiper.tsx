"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Children, isValidElement, useEffect, useState } from "react";
import { A11y, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CareerFrameworkSwiperProps = {
  children: React.ReactNode;
  className?: string;
};

type CareerFrameworkSwiperSlideProps = {
  children: React.ReactNode;
  id: string;
  title: string;
};

const CareerFrameworkSwiperControls = ({
  swiper,
}: {
  swiper: SwiperInstance | null;
}) => {
  const [state, setState] = useState({
    isBeginning: true,
    isEnd: false,
  });

  useEffect(() => {
    if (!swiper) {
      return;
    }

    const updateState = () => {
      setState({
        isBeginning: swiper.isBeginning,
        isEnd: swiper.isEnd,
      });
    };

    updateState();
    swiper.on("slideChange", updateState);
    swiper.on("reachBeginning", updateState);
    swiper.on("reachEnd", updateState);
    swiper.on("fromEdge", updateState);
    swiper.on("resize", updateState);

    return () => {
      swiper.off("slideChange", updateState);
      swiper.off("reachBeginning", updateState);
      swiper.off("reachEnd", updateState);
      swiper.off("fromEdge", updateState);
      swiper.off("resize", updateState);
    };
  }, [swiper]);

  return (
    <>
      <div
        aria-hidden="true"
        className="career-framework-control-fade pointer-events-none absolute top-2 right-0 z-10 h-14 w-28 bg-linear-to-l from-neutral-50 via-neutral-50/95 to-transparent dark:from-[#090909] dark:via-[#090909]/95 sm:hidden"
      />
      <div
        aria-hidden="true"
        className="career-framework-control-fade pointer-events-none absolute top-1/2 left-0 z-10 hidden h-28 w-28 -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-neutral-50 via-neutral-50/95 to-transparent dark:from-[#090909] dark:via-[#090909]/95 sm:block xl:w-36"
      />
      <div
        aria-hidden="true"
        className="career-framework-control-fade pointer-events-none absolute top-1/2 right-0 z-10 hidden h-28 w-28 translate-x-1/2 -translate-y-1/2 bg-linear-to-l from-neutral-50 via-neutral-50/95 to-transparent dark:from-[#090909] dark:via-[#090909]/95 sm:block xl:w-36"
      />
      <Button
        aria-label="Previous section"
        className={cn(
          "absolute top-4 right-14 z-20 rounded-full bg-background/90 shadow-sm backdrop-blur sm:top-1/2 sm:right-auto sm:left-4 sm:-translate-y-1/2 xl:-left-12",
          (!swiper || state.isBeginning) && "opacity-40",
        )}
        disabled={!swiper || state.isBeginning}
        onClick={() => swiper?.slidePrev()}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <Button
        aria-label="Next section"
        className={cn(
          "absolute top-4 right-3 z-20 rounded-full bg-background/90 shadow-sm backdrop-blur sm:top-1/2 sm:right-4 sm:-translate-y-1/2 xl:-right-12",
          (!swiper || state.isEnd) && "opacity-40",
        )}
        disabled={!swiper || state.isEnd}
        onClick={() => swiper?.slideNext()}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </>
  );
};

export const CareerFrameworkSwiperSlide = ({
  children,
  id,
  title,
}: CareerFrameworkSwiperSlideProps) => {
  return (
    <section aria-labelledby={id}>
      <h3 className="mt-0 mb-4 font-semibold text-base text-primary">
        <a className="cursor-default no-underline" href={`#${id}`} id={id}>
          {title}
        </a>
      </h3>
      {children}
    </section>
  );
};

export const CareerFrameworkSwiper = ({
  children,
  className,
}: CareerFrameworkSwiperProps) => {
  const slides = Children.toArray(children).filter(isValidElement);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);

  return (
    <div
      className={cn(
        "career-framework-swiper not-prose relative my-8 w-full overflow-visible",
        "[&_tbody_td]:align-top [&_tbody_tr]:h-28 sm:[&_tbody_tr]:h-[5.5rem]",
        "[&_ul]:my-0 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:my-0.5 [&_li::marker]:text-muted-foreground",
        className,
      )}
    >
      <Swiper
        autoHeight
        className="!overflow-visible"
        keyboard={{ enabled: true }}
        modules={[A11y, Keyboard]}
        onSwiper={setSwiper}
        slidesPerView={1}
        spaceBetween={16}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.key}>{slide}</SwiperSlide>
        ))}
      </Swiper>
      <CareerFrameworkSwiperControls swiper={swiper} />
    </div>
  );
};
