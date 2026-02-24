"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "@/lib/auth-client";

export const AuthButton = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (session) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? ""}
            width={18}
            height={18}
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
    );
  }

  return (
    <button
      type="button"
      onClick={() => signIn.social({ provider: "github", callbackURL: "/" })}
      className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
    >
      Sign in
    </button>
  );
};
