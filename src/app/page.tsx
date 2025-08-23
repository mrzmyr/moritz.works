import Link from "next/link";
import ActivityIndicator from "../components/activity-indicator";
import BookPreview from "../components/book-preview";
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
          I originally studied Usability Engineering and I built web apps for
          now over 15 years.
        </div>
        <div className="leading-7">
          I{" "}
          <Link href="/blog" className="font-semibold underline">
            write
          </Link>{" "}
          down little realizations I made on my way.
        </div>
      </div>
      <div className="relative flex items-center mt-16 mb-8">
        <div className="flex-grow border-t border-gray-200 dark:border-neutral-800"></div>
        <span className="flex-shrink mx-4 text-black dark:text-white font-medium">
          Currently Reading
        </span>
        <div className="flex-grow border-t border-gray-200 dark:border-neutral-800"></div>
      </div>
      <div className="">
        {!data && <ActivityIndicator />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {!error &&
            data &&
            data.books.map((book) => <BookPreview key={book.id} book={book} />)}
        </div>
      </div>
    </div>
  );
}
