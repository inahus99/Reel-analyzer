import Sentiment from 'sentiment';
import { removeStopwords } from 'stopword';

const sentiment = new Sentiment();

export function extractHashtags(text?: string): string[] {
  if (!text) return [];
  return (text.match(/#[\p{L}\p{N}_]+/gu) || []).map(h => h.toLowerCase());
}

export function captionSentiment(text?: string) {
  const res = text ? sentiment.analyze(text) : { score: 0, positive: [], negative: [] };
  return { score: res.score, positive: res.positive, negative: res.negative };
}

export function commentsSentiment(items: any[]) {
  const analyzed = items.map(c => {
    const s = sentiment.analyze(c.text || '');
    return { ...c, sentimentScore: s.score };
  });
  const scores = analyzed.map(a => a.sentimentScore);
  const positive = scores.filter(s => s > 0).length;
  const negative = scores.filter(s => s < 0).length;
  const neutral = scores.length - positive - negative;
  const overall = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
  return {
    breakdown: { positive, neutral, negative },
    overallScore: overall,
    items: analyzed,
  };
}

export function wordsForCloud(texts: string[]) {
  const tokens = texts
    .flatMap((t) => (t || '').toLowerCase().match(/[a-z0-9\u0900-\u097F']+/gi) || []);
  // Named import: removeStopwords
  const filtered: string[] = removeStopwords(tokens);
  const freq = new Map<string, number>();
  filtered.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([text, value]) => ({ text, value }));
}