import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getBooks } from "@/lib/get-books";

export const Books = async () => {
  const { data, error } = await getBooks();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {error && <div>Error loading books</div>}
      {!error &&
        data &&
        data.books.map((book) => (
          <Link
            href={`https://oku.club/book/${book.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            key={book.id}
            className="flex items-center justify-between group item-start hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-lg relative grayscale hover:grayscale-0 duration-300 ease-out"
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
  );
};

export const BooksSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div className="flex items-center justify-between group item-start px-4 py-2.5 rounded-lg relative gap-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="rounded shadow-md bg-neutral-200 dark:bg-neutral-700 w-[40px] h-[60px]" />
          <div className="flex flex-col gap-2">
            <div className="h-[20px] w-48 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-[16px] w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
