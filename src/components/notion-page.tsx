"use client";

import { Post } from "@/app/types/post";
import Image from "next/image";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { NotionRenderer } from "react-notion-x";

import { Code } from "react-notion-x/build/third-party/code";
import { Collection } from "react-notion-x/build/third-party/collection";

export const NotionPage: FC<{
  recordMap: Post["recordMap"];
  darkMode?: boolean;
}> = ({ recordMap }) => {
  const [theme, setTheme] = useState("");

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  if (!recordMap) {
    return null;
  }

  return (
    <NotionRenderer
      recordMap={recordMap}
      darkMode={theme === "dark"}
      components={{
        nextImage: Image,
        nextLink: Link,
        Code,
        Collection,
        Property: () => null,
      }}
    />
  );
};
