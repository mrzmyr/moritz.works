"use client";

import { useEffect, useRef } from "react";

export const PostComments = ({ slug }: { slug: string }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scriptElement = document.createElement("script");
    scriptElement.async = true;
    scriptElement.crossOrigin = "anonymous";
    scriptElement.src = "https://utteranc.es/client.js";

    scriptElement.setAttribute("issue-term", slug);
    scriptElement.setAttribute("label", "comment");
    scriptElement.setAttribute("repo", "mrzmyr/moritz.works");
    scriptElement.setAttribute("theme", "preferred-color-scheme");

    ref.current?.appendChild(scriptElement);
  }, [slug]);

  return <div className="-mt-4" ref={ref} />;
};
