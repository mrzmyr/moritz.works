import { type BundledLanguage, codeToHtml } from "shiki";

interface Props {
  children: string;
  lang: BundledLanguage;
}

export const SimpleCodeBlock = async ({ children, lang }: Props) => {
  const out = await codeToHtml(children, {
    lang: lang,
    themes: {
      light: "github-light",
      dark: "github-dark-default",
    },
  });

  return (
    <span
      className="not-prose inline-block"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Kinda how Shiki works"
      dangerouslySetInnerHTML={{ __html: out }}
    />
  );
};
