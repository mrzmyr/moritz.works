import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type React from "react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
	title: "moritz.works",
	description: "Where I write down little realizations I make on my way.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark:bg-neutral-900 antialiased">
			<body className="bg-neutral-50 dark:bg-neutral-900 antialiased">
				<div className="max-w-2xl lg:max-w-3xl mx-auto pt-8 pb-12 px-4 h-full">
					{children}
				</div>
				<Analytics />
				<Toaster position="bottom-center" />
			</body>
		</html>
	);
}
