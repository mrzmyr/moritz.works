import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiX } from "react-icons/si";
import { ShortcutHint } from "@/components/shortcut-hint";
import { GITHUB_URL, LINKEDIN_URL, X_URL } from "@/config/app";

export const Footer = () => {
  return (
    <footer className="mt-32 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/imprint"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          data-hotkey="i"
        >
          Imprint
          <ShortcutHint keys="i" />
        </Link>
        <Link
          href="/rss.xml"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          data-hotkey="f"
        >
          RSS
          <ShortcutHint keys="f" />
        </Link>
      </div>
      <div className="flex gap-4">
        <Link
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-hotkey="x"
          className="inline-flex items-center gap-1"
        >
          <SiX className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
          <ShortcutHint keys="x" />
        </Link>
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-hotkey="g"
          className="inline-flex items-center gap-1"
        >
          <SiGithub className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
          <ShortcutHint keys="g" />
        </Link>
        <Link
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-hotkey="l"
          className="inline-flex items-center gap-1"
        >
          <FaLinkedin className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
          <ShortcutHint keys="l" />
        </Link>
      </div>
    </footer>
  );
};
