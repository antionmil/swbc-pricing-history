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
  let y = Math.floor(days / 365);
  let m = Math.round((days % 365) / 30.44);
  // rounding can push months to 12, which must roll into a year rather than
  // print "2y 12m"
  if (m >= 12) {
    y += 1;
    m = 0;
  }
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

/** A record is stale when its newest readable capture is well over a year old.
 *  Zoom is the case that forced this: every capture from 2022 on is an empty
 *  JavaScript shell, so its record stops in 2020. Measuring "held for" or
 *  "never raised" against TODAY on a record like that invents six years of
 *  evidence that does not exist, and would have ranked Zoom first on the wall. */
const STALE_DAYS = 400;

/** A run of identical prices only proves a hold if the captures are close
 *  enough together to leave no room for a change in between. Captures are
 *  yearly, so one missing year is tolerable; a five-year hole is not.
 *  Slack forced this: it reads $6.67 in 2015-2020 and $7.25 in 2026, with no
 *  readable capture between. Spanning that gap claimed an 11-year hold for a
 *  price we cannot see for five of those years — and the plan was renamed in
 *  the gap, so it is not even the same plan. */
const MAX_GAP_DAYS = 800;

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
}

export function recordEnds(s: Series): string {
  return s.points[s.points.length - 1].date;
}

export function isStale(s: Series): boolean {
  const d = (new Date(AS_OF).getTime() - new Date(recordEnds(s)).getTime()) / 86_400_000;
  return d > STALE_DAYS;
}

/** The horizon a claim about this tool may be measured to: today when the
 *  record is current, otherwise the last capture that actually says something. */
export function horizon(s: Series): string {
  return isStale(s) ? recordEnds(s) : AS_OF;
}

/** The longest stretch at one price, measured to the day the price actually
 *  CHANGED — not to the last time we sampled it. Sampling to the last capture
 *  under-reports every hold, which is the whole point of the page. An open-ended
 *  run ends at the horizon, so a stale record never claims to reach today. */
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
    while (
      j + 1 < pts.length &&
      pts[j + 1].price === pts[i].price &&
      daysBetween(pts[j].date, pts[j + 1].date) <= MAX_GAP_DAYS
    )
      j++;
    const next = pts.slice(j + 1).find((p) => p.price !== null);
    // If the next readable price is on the far side of a long gap, the run
    // ends at the last capture that showed it, not at that distant point.
    const to =
      next && daysBetween(pts[j].date, next.date) <= MAX_GAP_DAYS
        ? next.date
        : next
          ? pts[j].date
          : horizon(s);
    const days = (new Date(to).getTime() - new Date(pts[i].date).getTime()) / 86_400_000;
    if (!best || days > best.days) {
      best = { days, price: pts[i].price!, from: pts[i].date, to, ongoing: !next && !isStale(s) };
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
  //
  // Measured to the HORIZON, not to today. A record that stops in 2020 cannot
  // earn credit for the six years since; otherwise the tool with the worst
  // archive coverage wins the page, which is the opposite of the truth.
  const from = d ?? s.points[0].date;
  return (new Date(horizon(s)).getTime() - new Date(from).getTime()) / 86_400_000 / 365;
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
  for (let y = 2016; y <= 2026; y += 1) out.push(y);
  return out;
}
