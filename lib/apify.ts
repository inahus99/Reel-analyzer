import { ApifyClient } from 'apify-client';

if (!process.env.APIFY_TOKEN) {
  console.warn('⚠️ APIFY_TOKEN missing in .env.local');
}

export const apify = new ApifyClient({
  token: process.env.APIFY_TOKEN!,
});

export async function startActor(actorId: string, input: any) {
  return apify.actor(actorId).start(input);
}

export async function getRun(runId: string): Promise<any> {
  return apify.run(runId).get() as any;
}

export async function getItems(datasetId: string, limit = 1000): Promise<any[]> {
  const { items } = await apify.dataset(datasetId).listItems({ limit, clean: true });
  return items as any[];
}
