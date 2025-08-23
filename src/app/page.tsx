import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LastPosts } from "@/components/last-posts";
import ActivityIndicator from "../components/activity-indicator";
import { getBooks } from "../lib/get-books";

export default async function Page() {
	const { data, error } = await getBooks();

	return (
		<div>
			<div className="text-neutral-800 leading-7 space-y-6">
				<div className="flex items-center gap-6 mb-6">
					<div className="flex flex-col">
						<span className="font-semibold tracking-tight">Moritz Meyer</span>
						<span className="opacity-50 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 rounded text-sm">
							he/him
						</span>
					</div>
				</div>
				<div className="leading-7 lg:mt-36">
					Hey, I&apos;m Moritz. I work in the triangle{" "}
					<span className="text-[12px] px-0.5">◢</span> of Software Engineering,
					User Experience, and Engineering Management. Currently, I&apos;m work
					as <span className="font-semibold">Engineering Manager</span> at{" "}
					<span className="font-semibold">1KOMMA5°</span> in the Climate Tech
					space, mostly focused on customer experience in delivery processes.
				</div>
				<div className="leading-7">
					I{" "}
					<Link href="/blog" className="font-semibold underline">
						write
					</Link>{" "}
					down little realizations I make on my way.
				</div>
			</div>
			<div className="mt-12">
				<div className="font-medium dark:text-white">Recent Posts</div>

				<div className="mt-2">
					<Suspense fallback={<ActivityIndicator />}>
						<LastPosts />
					</Suspense>
				</div>
			</div>
			<div className="mt-12">
				<div className="font-medium dark:text-white">Currently Reading</div>

				<div className="-ml-4">
					{!data && <ActivityIndicator />}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
						{!error &&
							data &&
							data.books.map((book) => (
								<Link
									href={`https://oku.club/book/${book.slug}`}
									target="_blank"
									rel="noopener noreferrer"
									key={book.id}
									className="flex items-center justify-between group item-start hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-lg relative"
								>
									<div className="flex items-center gap-4">
										{book.imageLinks.thumbnail && (
											<Image
												src={book.imageLinks.thumbnail}
												className="rounded shadow-md"
												alt={book.title}
												width={60}
												height={60}
											/>
										)}
										<div className="flex flex-col gap-1">
											<div className="dark:text-white">{book.title}</div>
											<div className="text-neutral-400 dark:text-neutral-400 text-sm">
												{book.authors.map((author) => author.name).join(", ")}
											</div>
										</div>
									</div>
									<ExternalLink className="w-4 h-4 top-3 right-3 text-neutral-500 dark:text-neutral-400 absolute hidden group-hover:block stroke-1" />
								</Link>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
