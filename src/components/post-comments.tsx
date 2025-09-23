"use client";

import { useEffect, useRef } from "react";

export const PostComments = ({ slug }: { slug: string }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Remove any previous script to avoid duplicates
    while (ref.current.firstChild) {
      ref.current.removeChild(ref.current.firstChild);
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "mrzmyr/moritz.works");
    script.setAttribute("data-repo-id", "R_kgDOGgu49w");
    script.setAttribute("data-category", "Comments");
    script.setAttribute("data-category-id", "DIC_kwDOGgu4984CvylO");
    script.setAttribute("data-mapping", slug);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "1");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");

    ref.current.appendChild(script);
  }, []);

  return <div className="-mt-4" ref={ref} />;
};
