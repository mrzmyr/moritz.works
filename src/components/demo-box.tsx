import { cn } from "@/lib/utils";

export const DemoBox = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"bg-white dark:bg-neutral-800 rounded-lg p-6 py-4 border border-neutral-200 dark:border-neutral-700 shadow-nice overflow-hidden",
				className,
			)}
		>
			{children}
		</div>
	);
};
