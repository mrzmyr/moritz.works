import { type BundledLanguage, codeToHtml } from "shiki";
import { Figure, FigureContent } from "./figure";

interface Props {
  children: string | string[] | React.ReactNode;
  lang: BundledLanguage;
}

export const SimpleCodeBlock = async ({ children, lang }: Props) => {
  const str = (
    (Array.isArray(children) ? children.join("\n") : children) as string
  ).trim();
  const out = await codeToHtml(str, {
    lang: lang,
    themes: {
      light: "github-light",
      dark: "github-dark-default",
    },
    colorReplacements: {
      "github-dark-default": {
        "#0d1117": "#101010",
      },
    },
    defaultColor: false,
  });

  return (
    <Figure>
      <FigureContent>
        <div
          className="not-prose text-[13px]"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Kinda how Shiki works"
          dangerouslySetInnerHTML={{ __html: out }}
        />
      </FigureContent>
    </Figure>
  );
};
