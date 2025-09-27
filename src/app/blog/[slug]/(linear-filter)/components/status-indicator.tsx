import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusValues } from "../types";

const COLOR_MAPPING: Record<StatusValues, string> = {
  backlog: "#A8A8A8",
  todo: "#A8A8A8",
  in_progress: "#F1BF00",
  in_review: "#E99243",
  done: "#27A644",
};

const PERCENT_MAPPING: Record<StatusValues, number> = {
  backlog: 1,
  todo: 0,
  in_progress: 0.5,
  in_review: 0.75,
  done: 1,
};

const DoneCircle = () => {
  return (
    <div
      className={cn(
        "bg-[#5F6AD3] rounded-full flex items-center justify-center",
        `w-[14px] h-[14px]`
      )}
    >
      <Check className={`size-3 stroke-[3px] pt-[1px] text-white`} />
    </div>
  );
};

export const StatusIndicator = ({ status }: { status: StatusValues }) => {
  const size = 14;

  const percent = PERCENT_MAPPING[status];
  const color = COLOR_MAPPING[status];

  if (status === "done") {
    return <DoneCircle size={size} />;
  }

  function arc({
    cx,
    cy,
    r,
    percent,
  }: {
    cx: number;
    cy: number;
    r: number;
    percent: number;
  }) {
    const startPercent = 0;
    const startAngle = startPercent * 360 - 90; // start at 12 o’clock
    const endAngle = percent * 360 - 90;
    const rad = (deg: number) => (Math.PI / 180) * deg;

    const point = (angle: number) => ({
      x: cx + r * Math.cos(rad(angle)),
      y: cy + r * Math.sin(rad(angle)),
    });

    const start = point(endAngle);
    const end = point(startAngle);
    const largeArc = percent - startPercent > 0.5 ? 1 : 0;

    return `M ${cx} ${cy} L ${end.x} ${end.y} A ${r} ${r} 0 ${largeArc} 1 ${start.x} ${start.y} Z`;
  }

  const d = arc({
    cx: size / 2,
    cy: size / 2,
    r: size / 2 - 3,
    percent,
  });

  const fill = color;

  return (
    <svg
      id={`chart-${status}`}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pie chart"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={6}
        fill="transparent"
        stroke={fill}
        strokeWidth={2}
        strokeDasharray={status === "backlog" ? "1.5,2" : undefined}
      />
      <path d={d} fill={fill} />
    </svg>
  );
};
