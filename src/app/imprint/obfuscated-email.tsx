"use client";

import { useEffect, useState } from "react";

const user = "hi";
const domain = "moritz.works";

export function ObfuscatedEmail() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>[javascript required]</span>;
  }

  const email = `${user}@${domain}`;

  return (
    <a
      href={`mailto:${email}`}
      className="underline hover:text-neutral-600 dark:hover:text-neutral-300"
    >
      {email}
    </a>
  );
}
