import Image from "next/image";
import Link from "next/link";

const ProjectListItem = ({
  image,
  name,
  description,
  href,
  from,
  to,
}: {
  image: string;
  name: string;
  description: string;
  href?: string;
  from: string;
  to?: string;
}) => {
  const content = (
    <div className="flex flex-col sm:flex-row justify-between items-start">
      <div className="flex flex-row items-start gap-2">
        {/* <div className="w-5 h-5 rounded-[3px] overflow-hidden shrink-0 grayscale group-hover:grayscale-0 duration-200 ease-out">
          <Image src={image} alt={name} width={20} height={20} />
        </div> */}
        <div className="flex flex-col gap-1">
          <div className="dark:text-white">{name}</div>
          <div className="text-neutral-400 dark:text-neutral-400 text-sm">
            {description}
          </div>
        </div>
      </div>
      <div className="text-sm text-neutral-400 dark:text-neutral-400 mt-2 sm:mt-0 shrink-0">
        {from}
        {to ? ` - ${to}` : ""}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="block hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2.5 rounded-md group"
      >
        {content}
      </Link>
    );
  }

  return <div className="px-4 py-2.5">{content}</div>;
};

const ProjectList = () => {
  return (
    <div className="flex flex-col">
      <ProjectListItem
        image="/static/images/llm-ops-logo.png"
        name="LLM Ops"
        description="Collection of tools for running LLMs in production"
        href="/llm-ops"
        from="2025"
        to="today"
      />
      <ProjectListItem
        image="/static/images/gigaohm-logo.png"
        name="GIGA Ω"
        description="Unified API for German energy grid data"
        href="https://www.gigaohm.de"
        from="2025"
        to="today"
      />
      <ProjectListItem
        image="/static/images/astra-logo.png"
        name="Astra"
        description="AI companion with 30+ agentic tools"
        from="2025"
        to="2026"
      />
      <ProjectListItem
        image="/static/images/pixy-logo.png"
        name="Pixy"
        description="Mood tracker app with 50k+ users"
        href="https://pixy.day"
        from="2021"
        to="2024"
      />
      <ProjectListItem
        image="/static/images/gibtherapie-logo.svg"
        name="GibTherapie"
        description="Therapist search with 600k visits/month"
        href="https://gibtherapie.de"
        from="2022"
        to="2024"
      />
    </div>
  );
};

export default ProjectList;
