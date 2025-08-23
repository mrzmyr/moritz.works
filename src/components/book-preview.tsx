import Image from "next/image";
import { Book } from "../lib/get-books";
import Link from "next/link";

export default function BookPreview({ book }: { book: Book }) {
  return (
    <div className="flex flex-col items-center">
      <Link
        href={`https://oku.club/book/${book.slug}`}
        className="group flex flex-col items-center"
      >
        <div className="h-48 w-32 relative rounded shadow-md group-hover:grayscale-0 transform transition-all grayscale duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-lg dark:shadow-neutral-800">
          {book.imageLinks.thumbnail && (
            <Image
              src={book.imageLinks.thumbnail}
              className="rounded"
              alt={book.title}
              fill
              style={{
                objectFit: "cover",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                transition: "all 0.1s ease",
              }}
            />
          )}
        </div>
        <div className="mt-4 text-center max-w-[180px]">
          <div className="text-base line-clamp-2 font-medium group-hover:underline dark:text-white">
            {book.title}
          </div>
          <div className="mt-1 text-sm opacity-60 dark:text-neutral-400">
            {book.authors.map((author) => author.name).join(", ")}
          </div>
        </div>
      </Link>
    </div>
  );
}
