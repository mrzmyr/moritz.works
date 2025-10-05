import { Footer } from "@/components/footer";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="max-w-3xl mx-auto pt-8 pb-12 px-4 h-full">
      {children}

      <Footer />
    </div>
  );
}
