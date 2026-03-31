import { cn } from "@/lib/utils";

interface BlinkProps {
  children: React.ReactNode;
  color: string;
  className?: string;
}

export const Blink = ({ children, color, className }: BlinkProps) => {
  return (
    <>
      <style>{`
        @keyframes terminal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        h2:hover .blink-cursor {
          animation: terminal-blink 1s step-end infinite;
        }
      `}</style>
      <span
        className={cn("blink-cursor inline-block", className)}
        style={{ color }}
      >
        {children}
      </span>
    </>
  );
};
