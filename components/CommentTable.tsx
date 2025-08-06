type C = { id: string; username?: string; text: string; likes?: number; sentimentScore?: number };

export function CommentTable({ comments }: { comments: C[] }) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">User</th>
          <th className="border px-2 py-1">Comment</th>
          <th className="border px-2 py-1">Likes</th>
          <th className="border px-2 py-1">Sentiment</th>
        </tr>
      </thead>
      <tbody>
        {comments.map(c => (
          <tr key={c.id}>
            <td className="border px-2 py-1">{c.username || '—'}</td>
            <td className="border px-2 py-1">{c.text}</td>
            <td className="border px-2 py-1">{c.likes ?? 0}</td>
            <td className="border px-2 py-1">{c.sentimentScore}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
