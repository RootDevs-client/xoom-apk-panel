"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

interface CustomCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  itemClassName?: string;
  responsive?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  autoplay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  hideHeader?: boolean;
  loop?: boolean;
}

export function CustomCarousel<T>({
  items,
  renderItem,
  className,
  itemClassName,
  title,
  description,
  responsive = { base: 1, md: 2, lg: 3 },
  autoplay = false,
  interval = 4000,
  showArrows = true,
  showDots = false,
  hideHeader = false,
  loop = false,
}: CustomCarouselProps<T>) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [visibleCount, setVisibleCount] = React.useState(responsive.base || 1);

  // responsive handling
  React.useEffect(() => {
    const updateVisible = () => {
      const width = window.innerWidth;
      if (width >= 1280 && responsive.xl) setVisibleCount(responsive.xl);
      else if (width >= 1024 && responsive.lg) setVisibleCount(responsive.lg);
      else if (width >= 768 && responsive.md) setVisibleCount(responsive.md);
      else if (width >= 640 && responsive.sm) setVisibleCount(responsive.sm);
      else setVisibleCount(responsive.base || 1);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, [responsive]);

  // carousel select handling
  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // autoplay effect
  React.useEffect(() => {
    if (!autoplay || !api) return;
    const timer = setInterval(() => {
      if (loop) {
        api.scrollNext();
      } else {
        if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length)
          api.scrollTo(0);
        else api.scrollNext();
      }
    }, interval);
    return () => clearInterval(timer);
  }, [api, autoplay, interval, loop]);

  return (
    <div className={cn("relative w-full", className)}>
      {!hideHeader && (
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-4">
            {/* {IconComponent && (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-gray-200" />
              </div>
            )} */}
            <h3 className="lg:text-[32px] md:text-[24px] text-lg helvetica-neue-medium  text-[#1F1F1F] dark:text-[#F9FAFB] capitalize">
              {title}
            </h3>
          </div>
          {description && (
            <p className="p-text-18 montserrat-semibold text-[#141414] dark:text-white mb-10">
              {description}
            </p>
          )}
        </div>
      )}

      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem
              key={index}
              className={cn(
                `basis-1/${visibleCount} px-2 md:px-3`,
                itemClassName,
              )}
            >
              {renderItem(item, index)}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {showArrows && (
        <div className="absolute top-0 right-0 flex gap-2 z-10">
          <button
            // variant="outline"
            // size="icon"
            aria-label="Previous"
            disabled={!api || api.selectedScrollSnap() === 0}
            onClick={() => api?.scrollPrev()}
            className={cn(
              "items-center hover:bg-transparent border rounded-[5px] h-[30px] w-[30px]",
              !api || api.selectedScrollSnap() === 0
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100",
            )}
          >
            {/* <Icons.leftChevron className="" /> */}
            {/* <ChevronsRightLeftIcon /> */}
            <ChevronLeft className="h-7 w-7 text-[#6B7280] dark:text-[#9CA3AF]" />
          </button>

          <button
            // variant="outline"
            // size="icon"
            aria-label="Next"
            disabled={!api || api.selectedScrollSnap() === count - 1}
            onClick={() => api?.scrollNext()}
            className={cn(
              "items-center hover:bg-transparent border rounded-[5px] h-[30px] w-[30px]",
              !api || api.selectedScrollSnap() === count - 1
                ? "opacity-50 cursor-not-allowed"
                : "opacity-100",
            )}
          >
            {/* <Icons.rightChevron className="dark:text-[#F9FAFB]" /> */}
            <ChevronRight className="h-7 w-7 text-[#6B7280] dark:text-[#9CA3AF]" />
          </button>
        </div>
      )}

      {showDots && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-3.5 w-3.5 rounded-full border-2 border-gray-400 dark:border-primary transition-colors",
                current === index + 1 && "border-primary bg-primary",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
