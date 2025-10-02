import Link from "next/link";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";
import { GITHUB_URL, LINKEDIN_URL, X_URL } from "@/config/app";

export const Footer = () => {
  return (
    <footer className="mt-12 flex justify-end gap-4">
      <Link href={X_URL} target="_blank" rel="noopener noreferrer">
        <SiX className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
      </Link>
      <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
        <SiGithub className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
      </Link>
      <Link href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
        <SiLinkedin className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
      </Link>
    </footer>
  );
};
