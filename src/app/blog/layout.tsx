import { Footer } from "@/components/footer";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto pt-8 pb-12 px-4 h-full">
      <KeyboardShortcuts />
      {children}

      <Footer />
    </div>
  );
}
