import Image from "next/image";
import { IMAGE_MAP } from "./config";

export const SlackMessageReply = ({
  replies,
  date,
}: {
  date?: string;
  replies?: { name: string; date: string }[];
}) => {
  const dateString = date
    ? new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

  const count = replies?.length || 0;

  return (
    <div className="flex items-center gap-2">
      {/* Avatars */}
      <div className="flex -space-x-3">
        {replies?.map((reply, index) => (
          <div
            key={`${reply.name}-${index}`}
            className="inline-block h-7 w-7 rounded-md border-2 border-white bg-neutral-300"
          >
            <Image
              className="grayscale"
              src={IMAGE_MAP[reply.name as keyof typeof IMAGE_MAP]}
              alt={reply.name}
              width={32}
              height={32}
            />
          </div>
        ))}
      </div>
      {/* Replies link */}
      <div className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
        {count} replies
      </div>
      {/* Last reply info */}
      <span className="text-sm text-neutral-500">
        Last reply today at {dateString}
      </span>
    </div>
  );
};
