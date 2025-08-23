import { tryCatch } from "./utils";

export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  authors: { id: number; name: string; image_url: string }[];
  publishedDate?: string;
  isbn10?: string;
  isbn13?: string;
  description?: string;
  descriptionMd?: string;
  pageCount?: number;
  language?: string;
  imageLinks: { thumbnail: string };
  purchaseLinks?: { store: string; url: string }[];
  ratings?: {
    source: string;
    score: number;
    max_score: number | null;
    count: number;
    updated: string;
  }[];
  thumbnail?: string;
  slug: string;
  workId?: string;
  addedAt?: string;
};

export async function getBooks() {
  return tryCatch<{ books: Book[] }>(
    fetch(
      "https://oku.club/api/collections/user/jadann/reading?format=json"
    ).then((res) => res.json())
  );
}
