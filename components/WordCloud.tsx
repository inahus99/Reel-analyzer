// components/WordCloud.tsx
import React from 'react';

export function WordCloud({
  data,
}: {
  data: Array<{ text: string; value: number }>;
}) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500">No words to display</div>;
  }

  // Normalize font sizes between 12px and 32px
  const values = data.map((w) => w.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const scale = (v: number) =>
    12 + ((v - min) / (max - min || 1)) * (32 - 12);

  return (
    <div className="flex flex-wrap gap-2 p-4 border rounded">
      {data.map((w) => (
        <span
          key={w.text}
          style={{ fontSize: `${scale(w.value).toFixed(1)}px` }}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}
