'use client';

import { useEffect, useState } from 'react';

type Profile = {
  username: string;
  profilePicUrl: string;
  fullName?: string;
};

export function SimilarCreators({ username }: { username: string }) {
  const [profiles, setProfiles] = useState<Profile[]|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`/api/similar?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((j) => {
        setProfiles(j.similar || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div>Loading similar creators…</div>;
  if (!profiles) return null;

  return (
    <div className="flex gap-4 overflow-auto">
      {profiles.map((p) => (
        <div key={p.username} className="text-center">
          <img
            src={p.profilePicUrl}
            alt={p.username}
            className="w-12 h-12 rounded-full mx-auto"
          />
          <div>@{p.username}</div>
          {p.fullName && <div className="text-xs text-gray-600">{p.fullName}</div>}
        </div>
      ))}
    </div>
  );
}
