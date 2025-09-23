import { siteConfig } from "@/config/app";

interface PostStructuredDataProps {
  type?: "website" | "article" | "person";
  title?: string;
  description?: string;
  url?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}

export function PostStructuredData({
  type = "website",
  title,
  description,
  url,
  datePublished,
  dateModified,
  image,
}: PostStructuredDataProps) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type":
      type === "website"
        ? "WebSite"
        : type === "article"
        ? "Article"
        : "Person",
    name: title || siteConfig.title,
    description: description || siteConfig.description,
    url: url || siteConfig.url,
    image: image || `${siteConfig.url}/static/og/default.png`,
  };

  if (type === "website") {
    return (
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: allowed
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...baseSchema,
            author: {
              "@type": "Person",
              name: siteConfig.author.name,
              url: siteConfig.url,
              sameAs: [
                `https://github.com/${siteConfig.author.github}`,
                `https://twitter.com/${siteConfig.author.twitter.replace(
                  "@",
                  ""
                )}`,
              ],
            },
            publisher: {
              "@type": "Person",
              name: siteConfig.author.name,
            },
          }),
        }}
      />
    );
  }

  if (type === "article") {
    return (
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: allowed
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...baseSchema,
            "@type": "BlogPosting",
            headline: title,
            datePublished,
            dateModified,
            author: {
              "@type": "Person",
              name: siteConfig.author.name,
              url: siteConfig.url,
            },
            publisher: {
              "@type": "Person",
              name: siteConfig.author.name,
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url,
            },
          }),
        }}
      />
    );
  }

  if (type === "person") {
    return (
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: allowed
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: siteConfig.author.name,
            url: siteConfig.url,
            image: `${siteConfig.url}/static/images/profile.jpg`,
            jobTitle: "Engineering Manager",
            worksFor: {
              "@type": "Organization",
              name: "1KOMMA5°",
            },
            knowsAbout: [
              "Software Engineering",
              "Engineering Management",
              "User Experience",
              "Climate Technology",
              "Product Management",
            ],
            sameAs: [
              `https://github.com/${siteConfig.author.github}`,
              `https://twitter.com/${siteConfig.author.twitter.replace(
                "@",
                ""
              )}`,
            ],
          }),
        }}
      />
    );
  }

  return null;
}
