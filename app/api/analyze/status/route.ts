// app/api/analyze/status/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getRun, getItems, startActor } from '@/lib/apify';
import {
  extractHashtags,
  captionSentiment,
  commentsSentiment,
  wordsForCloud,
} from '@/lib/analytics';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postRunId = searchParams.get('postRunId') || '';
  const commentsRunId = searchParams.get('commentsRunId') || '';
  const wantFollowers = searchParams.get('followers') === '1';

  try {
    // 1) Poll post & comments runs
    const [postRun, commentsRun] = await Promise.all([
      getRun(postRunId),
      getRun(commentsRunId),
    ]);

    // 2) If still running, return status only
    if (postRun.status !== 'SUCCEEDED' || commentsRun.status !== 'SUCCEEDED') {
      return NextResponse.json({
        status: { post: postRun.status, comments: commentsRun.status },
      });
    }

    // 3) Get dataset IDs
    const postDataset = postRun.defaultDatasetId!;
    const commentsDataset = commentsRun.defaultDatasetId!;
    const [posts, rawComments] = await Promise.all([
      getItems(postDataset, 1),
      getItems(commentsDataset, 200),
    ]);
    const post = posts[0] as any;
    const comments = Array.isArray(rawComments) ? rawComments : [];

    // 4) Compute analytics
    const hashtags = extractHashtags(post.caption);
    const capSent = captionSentiment(post.caption);
    const commSent = commentsSentiment(
      comments
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 20)
    );
    const cloud = wordsForCloud(commSent.items.map((c) => c.text));

    // 5) Optional: fetch followers count
    let followersCount: number | null = null;
    if (wantFollowers && post.ownerUsername) {
      try {
        const profileStart = await startActor(
          'apify/instagram-profile-scraper',
          { usernames: [post.ownerUsername], resultsLimit: 1 }
        );
        // poll up to ~6 seconds
        for (let i = 0; i < 5; i++) {
          const profileRun = await getRun(profileStart.id);
          if (
            profileRun.status === 'SUCCEEDED' &&
            profileRun.defaultDatasetId
          ) {
            const profItems = await getItems(
              profileRun.defaultDatasetId,
              1
            );
            followersCount =
              Number(profItems[0]?.followersCount ?? null) || null;
            break;
          }
          if (['FAILED', 'ABORTED'].includes(profileRun.status)) break;
          await new Promise((r) => setTimeout(r, 1200));
        }
      } catch (err) {
        console.warn(
          'Followers lookup failed, continuing without it:',
          (err as any).message
        );
      }
    }

    // 6) Build final JSON
    return NextResponse.json({
      status: { post: postRun.status, comments: commentsRun.status },
      reel: {
        ownerUsername: post.ownerUsername,
        ownerFullName: post.ownerFullName,
        profilePic: post.profilePicUrl,
        timing: {
          publishedAt: post.timestamp,
          since: post.timestamp
            ? new Date(post.timestamp).toISOString()
            : null,
        },
        media: { durationSec: post.videoDuration },
        metrics: {
          likes: post.likesCount,
          comments: post.commentsCount,
          views: post.videoViewCount,
          engagementByViews:
            post.videoViewCount && post.videoViewCount > 0
              ? ((post.likesCount + post.commentsCount) /
                  post.videoViewCount) *
                100
              : null,
          engagementByFollowers:
            followersCount && followersCount > 0
              ? ((post.likesCount + post.commentsCount) /
                  followersCount) *
                100
              : null,
          followersCount,
        },
        hashtags,
      },
      sentiment: {
        caption: capSent,
        comments: {
          breakdown: commSent.breakdown,
          overallScore: commSent.overallScore,
          top20: commSent.items,
          wordCloud: cloud,
        },
      },
    });
  } catch (err: any) {
    console.error('STATUS_ROUTE_ERROR', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
