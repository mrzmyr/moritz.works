import Link from "next/link";
import { SiX } from "react-icons/si";

export const Footer = () => {
  return (
    <footer className="mt-12 flex justify-end">
      <Link
        href="https://x.com/mrzmyr"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SiX className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
      </Link>
    </footer>
  );
};
