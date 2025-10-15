import { siteConfig } from "@/config/app";

export const getAbsolutePostUrl = ({ slug }: { slug: string }) => {
  return `${siteConfig.url}/${getPostUrl({ slug })}`;
};

export const getPostUrl = ({ slug }: { slug: string }) => {
  return `/blog/${slug}`;
};
