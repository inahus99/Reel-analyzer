// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AnalyticsCard } from '@/components/AnalyticsCard';
import { CommentTable } from '@/components/CommentTable';
import { HashtagList } from '@/components/HashtagList';
import { WordCloud } from '@/components/WordCloud';
import { SimilarCreators } from '@/components/SimilarCreators';

type Job = { postRunId: string; commentsRunId: string };

export default function Home() {
  const [url, setUrl] = useState('');
  const [job, setJob] = useState<Job | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* START NEW ANALYSIS */
  async function start() {
    // clear previous state
    setError(null);
    setData(null);
    setJob(null);

    setLoading(true);
    try {
      const res = await fetch('/api/analyze/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, commentsLimit: 50 }),
      });
      const j = await res.json();
      if (!res.ok) {
        throw new Error(j.error || 'Failed to start analysis');
      }
      console.log('New job started:', j);
      setJob(j);
    } catch (e: any) {
      console.error('Start error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* POLL FOR STATUS */
  useEffect(() => {
    if (!job) return;
    console.log('Polling status for job:', job);

    const id = setInterval(async () => {
      const query = new URLSearchParams({
        postRunId: job.postRunId,
        commentsRunId: job.commentsRunId,
        followers: '1',
      }).toString();

      try {
        const res = await fetch(`/api/analyze/status?${query}`);
        const j = await res.json();
        console.log('Status response:', j);

        if (j.reel) {
          setData(j);
          clearInterval(id);
        }
      } catch (e) {
        console.warn('Status fetch failed:', e);
      }
    }, 3000);

    return () => clearInterval(id);
  }, [job]);

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      <h1 className="text-3xl font-bold">Instagram Reel Analyzer</h1>

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-4 py-2"
          placeholder="Instagram Reel URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={start}
          disabled={!url || loading}
          className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Starting…' : 'Analyze'}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Loading Indicator */}
      {job && !data && !error && <p>Crunching… polling every 3s…</p>}

      {/* Results */}
      {data && (
        <>
          {/* User Detection */}
          <header className="flex items-center gap-4">
            <img
              src={data.reel.profilePic || '/avatar.svg'}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <div className="text-xl font-semibold">
                @{data.reel.ownerUsername}
              </div>
              {data.reel.ownerFullName && (
                <div className="text-gray-600">
                  {data.reel.ownerFullName}
                </div>
              )}
              {data.reel.timing?.since && (
                <div className="text-sm text-gray-500">
                  Posted {data.reel.timing.since}
                </div>
              )}
            </div>
          </header>

          {/* Performance Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnalyticsCard label="Likes" value={data.reel.metrics.likes} />
            <AnalyticsCard label="Comments" value={data.reel.metrics.comments} />
            <AnalyticsCard label="Views" value={data.reel.metrics.views} />
            <AnalyticsCard
              label="Eng. (views)"
              value={`${data.reel.metrics.engagementByViews?.toFixed(1)}%`}
            />
            {data.reel.metrics.engagementByFollowers != null && (
              <AnalyticsCard
                label="Eng. (followers)"
                value={`${data.reel.metrics.engagementByFollowers.toFixed(1)}%`}
              />
            )}
            <AnalyticsCard
              label="Duration"
              value={`${Math.round(data.reel.media.durationSec)}s`}
            />
          </div>

          {/* Sentiment Analysis */}
          <section>
            <h2 className="text-2xl font-medium mb-2">Sentiment</h2>
            <div className="flex gap-4">
              <AnalyticsCard
                label="Caption Score"
                value={data.sentiment.caption.score}
              />
              <AnalyticsCard
                label="+/–/0"
                value={`${data.sentiment.comments.breakdown.positive}/${data.sentiment.comments.breakdown.negative}/${data.sentiment.comments.breakdown.neutral}`}
              />
              <AnalyticsCard
                label="Avg Comment Score"
                value={data.sentiment.comments.overallScore.toFixed(2)}
              />
            </div>
          </section>

          {/* Top Comments */}
          <section>
            <h2 className="text-2xl font-medium mb-2">Top Comments</h2>
            <CommentTable comments={data.sentiment.comments.top20} />
          </section>

          {/* Word Cloud */}
          <section>
            <h2 className="text-2xl font-medium mb-2">Word Cloud</h2>
            <WordCloud data={data.sentiment.comments.wordCloud} />
          </section>

          {/* Hashtags */}
          {data.reel.hashtags.length > 0 && (
            <section>
              <h2 className="text-2xl font-medium mb-2">Hashtags</h2>
              <HashtagList tags={data.reel.hashtags} />
            </section>
          )}

          {/* Similar Creators */}
          <section>
            <h2 className="text-2xl font-medium mb-2">Similar Creators</h2>
            <SimilarCreators username={data.reel.ownerUsername} />
          </section>
        </>
      )}
    </main>
  );
}
