export function HashtagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <span key={tag} className="text-xs bg-gray-100 rounded px-2 py-1">
          {tag}
        </span>
      ))}
    </div>
  );
}
