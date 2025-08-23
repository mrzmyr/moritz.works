export const PostMetadata = ({
  createdAt,
  updatedAt,
}: {
  createdAt: Date;
  updatedAt: Date;
}) => {
  return (
    <div className="mt-2 text-neutral-500 dark:text-neutral-400">
      Published {createdAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })} · Updated{" "}
      {updatedAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </div>
  );
};
