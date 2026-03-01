"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "@/lib/auth-client";

const CANVAS_PATHS = ["/agent-ops", "/llm-ops"];

export const Header = () => {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const isCanvasPage = CANVAS_PATHS.includes(pathname);

  if (isPending) return null;

  return (
    <header className="fixed top-0 right-0 z-50 p-4">
      {session ? (
        <div className="flex items-center gap-2">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? ""}
              width={22}
              height={22}
              className="rounded-full"
            />
          )}
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {isCanvasPage && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Sign in to edit
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              signIn.social({ provider: "github", callbackURL: pathname })
            }
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            Sign in
          </button>
        </div>
      )}
    </header>
  );
};
