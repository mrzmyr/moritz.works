"use client";

import { createElement } from "react";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const Headline = ({
  children,
  as = "h2",
  className,
  id,
  ...props
}: {
  children?: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  id?: string;
  [key: string]: any;
}) => {
  // Generate id from children if not provided
  const _id =
    id ||
    slugify(
      typeof children === "string"
        ? children
        : Array.isArray(children)
        ? children.filter((c) => typeof c === "string").join(" ")
        : ""
    );

  // Dynamically render as <as><a ...></a></as>
  const HeadingTag = as;

  return (
    <HeadingTag className={className} {...props}>
      <a href={`#${_id}`} id={_id} className="no-underline cursor-default">
        {children}
      </a>
    </HeadingTag>
  );
};

export const H1 = (props: React.ComponentProps<"h1">) => {
  return <Headline as="h1" {...props} />;
};

export const H2 = (props: React.ComponentProps<"h2">) => {
  return <Headline as="h2" {...props} />;
};

export const H3 = (props: React.ComponentProps<"h3">) => {
  return <Headline as="h3" {...props} />;
};

export const H4 = (props: React.ComponentProps<"h4">) => {
  return <Headline as="h4" {...props} />;
};

export const H5 = (props: React.ComponentProps<"h5">) => {
  return <Headline as="h5" {...props} />;
};

export const H6 = (props: React.ComponentProps<"h6">) => {
  return <Headline as="h6" {...props} />;
};
