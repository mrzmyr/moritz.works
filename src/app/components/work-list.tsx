import Image from "next/image";

const WorkListItem = ({
  image,
  title,
  name,
  from,
  to,
  country,
}: {
  image?: string;
  title: string;
  name: string;
  from: string;
  to?: string;
  country?: string;
}) => {
  return (
    <div className="grayscale flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 sm:items-center w-full">
      <div className="flex flex-row items-center gap-2">
        <div className="w-5 h-5 rounded-[3px] overflow-hidden dark:border-neutral-800 border border-neutral-200">
          {image && <Image src={image} alt={name} width={20} height={20} />}
          {!image && (
            <div className="w-5 h-5 rounded-[3px] bg-neutral-700 dark:bg-neutral-700" />
          )}
        </div>
        <div className="font-medium text-neutral-800 dark:text-neutral-200">
          {name}
        </div>
      </div>
      <div className="flex-1 px-2">
        <div className="border-b border-dashed border-neutral-200 dark:border-neutral-700" />
      </div>
      <div className="flex flex-row gap-2">
        <div className="text-sm text-neutral-400 dark:text-neutral-400">
          {title}
        </div>
        <div className="text-sm text-neutral-400 dark:text-neutral-400">
          {country ? `${country} • ` : ""}
          {from}
          {to ? ` - ${to}` : ""}
        </div>
      </div>
    </div>
  );
};

const WorkList = () => {
  return (
    <div className="flex flex-col gap-3">
      <WorkListItem
        image="/static/images/1komma5-logo.jpeg"
        title="Engineering Manager"
        country="DE"
        name="1KOMMA5°"
        from="2024"
        to="today"
      />
      <WorkListItem
        image="/static/images/1komma5-logo.jpeg"
        title="Software Engineer"
        country="DE"
        name="1KOMMA5°"
        from="2023"
      />
      <WorkListItem
        image="/static/images/twain-logo.png"
        title="Lead Engineer"
        country="DE"
        name="Twain"
        from="2022"
      />
      <WorkListItem
        image="/static/images/bemer-logo.png"
        title="Project Manager"
        country="CH"
        name="BEMER"
        from="2019"
        to="2021"
      />
      <WorkListItem
        title="Software Engineer"
        country="DE"
        name="Freelance"
        from="2011"
        to="2019"
      />
      <WorkListItem
        image="/static/images/tonic-logo.jpeg"
        title="Front End Engineer"
        country="AU"
        name="Tonic"
        from="2014"
      />
    </div>
  );
};

export default WorkList;
