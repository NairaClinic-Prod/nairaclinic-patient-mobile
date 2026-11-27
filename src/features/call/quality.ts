import type { LinkQuality } from './network';

export type Tier = 'hd' | 'sd' | 'low' | 'audio';
export type Verdict = 'good' | 'fair' | 'poor';

export type Sample = {
  lossPct: number;
  latencyMs: number;
  jitterMs: number;
  zoom: LinkQuality;
};

export type Ladder = {
  tier: Tier;
  good: number;
  fair: number;
  poor: number;
  changedAt: number;
};

export const SAMPLE_MS = 2_000;

const ORDER: Tier[] = ['audio', 'low', 'sd', 'hd'];
const DOWN_AFTER_POOR = 2;
const AUDIO_AFTER_POOR = 5;
const HD_DOWN_AFTER_FAIR = 3;
const UP_AFTER_GOOD = 5;
const RECOVER_AFTER_FAIR = 6;
const MIN_HOLD_DOWN_MS = 4_000;
const MIN_HOLD_UP_MS = 10_000;

// turns raw numbers from zoom into good, fair or poor
export function judge(sample: Sample): Verdict {
  const { lossPct, latencyMs, jitterMs, zoom } = sample;
  if (zoom === 'poor' || lossPct >= 8 || latencyMs >= 700) return 'poor';
  if (zoom === 'fair' || lossPct >= 2.5 || latencyMs >= 350 || jitterMs >= 80) return 'fair';
  return 'good';
}

export function startLadder(tier: Tier, now: number): Ladder {
  return { tier, good: 0, fair: 0, poor: 0, changedAt: now };
}

const move = (ladder: Ladder, by: number, now: number): Ladder => {
  const index = Math.min(ORDER.length - 1, Math.max(0, ORDER.indexOf(ladder.tier) + by));
  const tier = ORDER[index]!;
  return tier === ladder.tier ? ladder : { tier, good: 0, fair: 0, poor: 0, changedAt: now };
};

// drops quality quickly when the line is bad and climbs back slowly so the picture never flickers
export function climb(ladder: Ladder, verdict: Verdict, now: number): Ladder {
  const held = now - ladder.changedAt;
  if (verdict === 'poor') {
    const next = { ...ladder, poor: ladder.poor + 1, good: 0, fair: 0 };
    if (next.tier === 'low' && next.poor >= AUDIO_AFTER_POOR) return move(next, -1, now);
    if (
      next.tier !== 'low' &&
      next.tier !== 'audio' &&
      next.poor >= DOWN_AFTER_POOR &&
      held >= MIN_HOLD_DOWN_MS
    )
      return move(next, -1, now);
    return next;
  }
  if (verdict === 'fair') {
    const next = { ...ladder, fair: ladder.fair + 1, good: 0, poor: 0 };
    if (next.tier === 'hd' && next.fair >= HD_DOWN_AFTER_FAIR && held >= MIN_HOLD_DOWN_MS)
      return move(next, -1, now);
    if (
      (next.tier === 'audio' || next.tier === 'low') &&
      next.fair >= RECOVER_AFTER_FAIR &&
      held >= MIN_HOLD_UP_MS
    )
      return move(next, 1, now);
    return next;
  }
  const next = { ...ladder, good: ladder.good + 1, fair: 0, poor: 0 };
  if (next.good >= UP_AFTER_GOOD && held >= MIN_HOLD_UP_MS) return move(next, 1, now);
  return next;
}

export const VIDEO_PREFERENCE: Record<Exclude<Tier, 'audio'>, { min: number; max: number }> = {
  hd: { min: 24, max: 30 },
  sd: { min: 15, max: 30 },
  low: { min: 8, max: 15 },
};

// where to begin before zoom has measured anything
export function firstTier(network: { slow: boolean; kind: string | null | undefined }): Tier {
  if (network.slow) return 'low';
  return 'hd';
}
