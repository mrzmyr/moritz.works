import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiX } from "react-icons/si";
import { GITHUB_URL, LINKEDIN_URL, X_URL } from "@/config/app";

export const Footer = () => {
  return (
    <footer className="mt-32 flex items-center justify-between">
      <Link
        href="/imprint"
        className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        Imprint
      </Link>
      <div className="flex gap-4">
        <Link href={X_URL} target="_blank" rel="noopener noreferrer">
          <SiX className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
        </Link>
        <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <SiGithub className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
        </Link>
        <Link href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
        </Link>
      </div>
    </footer>
  );
};
