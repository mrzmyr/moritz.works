import { Figure, FigureCaption, FigureContent } from "@/components/figure";
import { FigureEditor } from "@/components/figure-editor";

const statusIndicatorCode = `
import { Check } from "lucide-react";

type StatusValues = "backlog" | "todo" | "in_progress" | "in_review" | "done";

const SIZE = 100;

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
  const startAngle = startPercent * 360 - 90; // start at 12 o'clock
  const endAngle = percent * 360 - 90;
  const rad = (deg: number) => (Math.PI / 180) * deg;

  const point = (angle: number) => ({
    x: cx + r * Math.cos(rad(angle)),
    y: cy + r * Math.sin(rad(angle)),
  });

  const start = point(endAngle);
  const end = point(startAngle);
  const largeArc = percent - startPercent > 0.5 ? 1 : 0;

  return \`M \${cx} \${cy} L \${end.x} \${end.y} A \${r} \${r} 0 \${largeArc} 1 \${start.x} \${start.y} Z\`;
}

const COLOR_MAPPING: Record<StatusValues, string> = {
  backlog: "#A8A8A8",
  todo: "#A8A8A8",
  in_progress: "#F1BF00",
  in_review: "#E99243",
  done: "#27A644",
};

export const DoneCircle = () => {
  const circleRadius = SIZE / 2;
  const gap = SIZE * 0.1;

  return (
    <div
      className={\`bg-[#5F6AD3] rounded-full flex items-center justify-center relative\`}
      style={{
        width: \`\${circleRadius * 2}px\`,
        height: \`\${circleRadius * 2}px\`,
      }}
    >
      <Check
        className={\`stroke-[3px] pt-[1px] text-white translate-y-[5%]\`}
        style={{
          width: \`\${circleRadius * 2 - gap}px\`,
          height: \`\${circleRadius * 2 - gap}px\`,
        }}
      />
    </div>
  );
};

const getStatusByPercent = (percent: number) => {
  if (percent >= 1) return "done";
  if (percent >= 0.75) return "in_review";
  if (percent >= 0.5) return "in_progress";
  if (percent > 0) return "todo";
  if (percent == 0) return "backlog";
};

export const StatusIndicator = ({
  percent = 0.5,
}: { percent?: number }) => {
  const status = getStatusByPercent(percent);
  const color = COLOR_MAPPING[status];

  // Set stroke width as a percentage of SIZE, e.g. 10% of SIZE
  const strokeWidth = SIZE * 0.1;

  // The radius should account for the stroke width so the circle fits inside the SVG
  const circleRadius = SIZE / 2 - strokeWidth / 2;

  // Add spacing between the arc and the outer circle
  const arcGap = 10; // pixels of space between arc and outer circle
  const arcRadius = circleRadius - arcGap;

  const d = arc({
    cx: SIZE / 2,
    cy: SIZE / 2,
    r: arcRadius,
    percent,
  });

  const fill = color;

  return (
    <div className="p-12">
      <div className="scale-125">
        <div className="flex items-center justify-center">
            {status === "done" || percent === 1 ? <DoneCircle /> : (
                <svg
                    viewBox={\`\${SIZE} \${SIZE}\`}
                    width={SIZE}
                    height={SIZE}
                >
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={circleRadius}
                        fill="transparent"
                        stroke={fill}
                        strokeWidth={strokeWidth}
                        strokeDasharray={status === "backlog" ? "1.5,2" : undefined}
                    />
                    <path d={d} fill={fill} />
                </svg>
            )}
        </div>
      </div>
    </div>
  );
};
`.trim();

export async function FigureStatusIndicatorEditor() {
  const files = {
    "App.js": `
import React, { useState } from "react";
import { StatusIndicator } from "./status-indicator";

export default function App() {
  const [percent, setPercent] = useState(0.5);

  return (
  <div className="flex h-screen justify-center items-center dark:bg-neutral-900">
    <div className="flex flex-col items-center gap-8">
      <StatusIndicator percent={percent} />
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <label className="w-full">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={percent}
            onChange={event => {
              const value = Number(event.target.value);
              if (isNaN(value) || value < 0 || value > 1) {
                return;
              }
              setPercent(value);
            }}
            className="w-full"
          />
        </label>
      </div>
      </div>
    </div>
  );
}
  `.trim(),
    "status-indicator.tsx": statusIndicatorCode,
  };

  return (
    <Figure className="lg:-mx-32 xl:-mx-56">
      <FigureContent className="max-w-7xl p-0">
        <FigureEditor
          template="react-ts"
          files={files}
          options={{
            activeFile: "status-indicator.tsx",
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
          customSetup={{
            dependencies: {
              "lucide-react": "latest",
            },
          }}
        />
      </FigureContent>
    </Figure>
  );
}
