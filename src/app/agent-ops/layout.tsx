import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Operations",
};

export default function AgentOpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
