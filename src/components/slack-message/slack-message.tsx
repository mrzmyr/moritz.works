import Image from "next/image";
import { cn } from "@/lib/utils";
import { IMAGE_MAP } from "./config";

export const SlackMessage = ({
  name,
  children,
  date,
}: {
  name: string;
  date?: string;
  children: React.ReactNode;
}) => {
  const image = IMAGE_MAP[name as keyof typeof IMAGE_MAP] || null;

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 py-1">
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-200 text-neutral-800 font-bold text-lg dark:bg-neutral-800/50 dark:text-neutral-200",
          )}
        >
          {image && (
            <Image
              className="grayscale"
              src={image}
              alt={name}
              width={32}
              height={32}
            />
          )}
        </span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {name}
          </span>
          <span className="text-xs text-neutral-500">
            {date
              ? new Date(date).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
          </span>
        </div>
        <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
};
