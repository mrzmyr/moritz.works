export type PostData = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  draft?: boolean;
  content: string;
};

export type PostModule = { default: React.ReactNode };

export type PostContent = {
  content: React.ReactNode;
};
