import Image from "next/image";

export const StackItem = (
  props:
    | {
        query: string;
        title: string;
        imgClassName?: string;
      }
    | {
        src: string;
        title: string;
        imgClassName?: string;
      },
) => {
  return (
    <div className="p-2 flex flex-col items-center gap-2 select-none">
      <div className="rounded-2xl overflow-hidden w-18 h-18 shadow-lg">
        {"query" in props && (
          <Image
            src={`https://cdn.brandfetch.io/${props.query}?c=1id5pNSx4z5GN49Aj4x`}
            alt="Logo by Brandfetch"
            width={72}
            height={72}
            className={props.imgClassName}
            {...props}
          />
        )}
        {"src" in props && (
          <Image
            src={props.src}
            alt={props.title}
            width={72}
            height={72}
            className={props.imgClassName}
          />
        )}
      </div>
      <div className="text-sm text-white text-shadow-xs text-shadow-black font-medium text-center">
        {props.title}
      </div>
    </div>
  );
};
