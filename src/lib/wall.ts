import { SEAT, AS_OF, type Series, type Point } from "@/data/series";

export const T0 = new Date("2016-01-01").getTime();
export const T1 = new Date("2026-10-01").getTime();
const SPAN = T1 - T0;

/** x position as a percentage of the decade the wall covers */
export function fx(date: string): number {
  return ((new Date(date).getTime() - T0) / SPAN) * 100;
}

export function snapshotUrl(s: { origin: string }, ts: string): string {
  return `https://web.archive.org/web/${ts}/${s.origin}`;
}

/** Human span between two dates, e.g. "7y 7m". Rounds months, never inflates:
 *  a run that is 11.6 months reads "12m", not "1y". */
export function span(from: string, to: string): string {
  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
  const y = Math.floor(days / 365);
  const m = Math.round((days % 365) / 30.44);
  if (y && m) return `${y}y ${m}m`;
  if (y) return `${y}y`;
  return `${m}m`;
}

export type Move = "first" | "rise" | "cut" | "hold" | "free" | "none";

/** What happened at this point relative to the last PUBLISHED price. A period
 *  with no seat price (`price: null`) is skipped, not treated as zero — it
 *  must not read as a 100% cut followed by a huge rise. */
export function classify(points: Point[]): Move[] {
  let prev: number | null = null;
  return points.map((p) => {
    if (p.price === null) return "none";
    let m: Move;
    if (p.price === 0) m = "free";
    else if (prev === null || prev === 0) m = "first";
    else if (p.price > prev) m = "rise";
    else if (p.price < prev) m = "cut";
    else m = "hold";
    prev = p.price;
    return m;
  });
}

export function pct(from: number, to: number): string {
  const d = Math.round(((to - from) / from) * 100);
  return d > 0 ? `+${d}%` : `−${Math.abs(d)}%`;
}

/** The longest stretch at one price, measured to the day the price actually
 *  CHANGED — not to the last time we sampled it. Sampling to the last capture
 *  under-reports every hold, which is the whole point of the page. */
export function longestHold(s: Series) {
  const pts = s.points;
  let best: { days: number; price: number; from: string; to: string; ongoing: boolean } | null = null;
  let i = 0;
  while (i < pts.length) {
    if (pts[i].price === null) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 < pts.length && pts[j + 1].price === pts[i].price) j++;
    const next = pts.slice(j + 1).find((p) => p.price !== null);
    const to = next ? next.date : AS_OF;
    const days = (new Date(to).getTime() - new Date(pts[i].date).getTime()) / 86_400_000;
    if (!best || days > best.days) {
      best = { days, price: pts[i].price!, from: pts[i].date, to, ongoing: !next };
    }
    i = j + 1;
  }
  return best;
}

/** The date of the most recent RISE. A cut is not a rise, and a rename is not
 *  a rise. Null means this tool has never raised its published price. */
export function lastRise(s: Series): string | null {
  const moves = classify(s.points);
  for (let i = s.points.length - 1; i >= 0; i--) {
    if (moves[i] === "rise") return s.points[i].date;
  }
  return null;
}

export function yearsSinceRise(s: Series): number {
  const d = lastRise(s);
  // Never raised ranks above everything that has. Use the length of the whole
  // published record so "never raised, but only listed last year" does not
  // outrank "never raised in nine years".
  const from = d ?? s.points[0].date;
  return (new Date(AS_OF).getTime() - new Date(from).getTime()) / 86_400_000 / 365;
}

/** Sorted the way the page argues: longest since a rise at the top. Tools that
 *  have never raised sort above tools that have, by how long their record runs. */
export function sorted(): Series[] {
  return [...SEAT].sort((a, b) => {
    const an = lastRise(a) === null ? 1 : 0;
    const bn = lastRise(b) === null ? 1 : 0;
    if (an !== bn) return bn - an;
    return yearsSinceRise(b) - yearsSinceRise(a);
  });
}

export function tickYears(): number[] {
  const out: number[] = [];
  for (let y = 2016; y <= 2026; y += 2) out.push(y);
  return out;
}
