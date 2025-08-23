import { ExtendedRecordMap } from "notion-types";

export type Post = {
  id: string;
  title: string;
  icon: {
    emoji: string;
    type: string;
  };
  excerpt?: string;
  slug: string | null;
  blocks?: [];
  createdAt: string;
  updatedAt: string;
  recordMap: ExtendedRecordMap;
};
