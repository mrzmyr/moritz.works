import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LLM Operations",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
