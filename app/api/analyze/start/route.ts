export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { startActor } from '@/lib/apify';

export async function POST(req: Request) {
  const { url, commentsLimit = 100 } = await req.json();
  if (!/^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?/.test(url)) {
    return NextResponse.json({ error: 'Invalid Reel URL' }, { status: 400 });
  }
  const postRun = await startActor('apify/instagram-api-scraper', {
    directUrls: [url], maxResults: 1,
  });
  const commentsRun = await startActor('apify/instagram-comment-scraper', {
    directUrls: [url], resultsLimit: commentsLimit,
  });
  return NextResponse.json({
    postRunId: postRun.id,
    commentsRunId: commentsRun.id,
  });
}
