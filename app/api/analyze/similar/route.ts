// app/api/similar/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { startActor, getRun, getItems } from '@/lib/apify';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  }

  try {
    // 1) Start the profile scraper
    const run = await startActor('apify/instagram-profile-scraper', {
      usernames: [username],
      resultsLimit: 5,
    });

    // 2) Poll until it succeeds (or fails)
    let profileRun: any;
    for (let i = 0; i < 5; i++) {
      profileRun = await getRun(run.id);
      if (profileRun.status === 'SUCCEEDED') break;
      if (['FAILED','ABORTED'].includes(profileRun.status)) {
        throw new Error(`Actor ${profileRun.status}`);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (profileRun.status !== 'SUCCEEDED') {
      return NextResponse.json({ error: 'Profile scrape did not finish' }, { status: 202 });
    }

    // 3) Fetch dataset items
    const items = await getItems(profileRun.defaultDatasetId, 5);

    // 4) Return them
    return NextResponse.json({ similar: items });
  } catch (err: any) {
    console.error('API /api/similar error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
