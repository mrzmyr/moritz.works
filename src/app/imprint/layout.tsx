import { Footer } from "@/components/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto pt-8 pb-12 px-4 h-full">
      {children}

      <Footer />
    </div>
  );
}
