import { SEAT, AS_OF, type Series, type Plan, type Point } from "@/data/series";

/* The axis ends TODAY, not at a rounded year boundary. When it ran to
   2026-10-01 the "now" marker sat to the RIGHT of the 2026 tick, which read as
   though now were some time after 2026 — in 2026. Now is the right-hand edge,
   and the newest tag on a current record is the price being charged today. */
export const T0 = new Date("2016-01-01").getTime();
export const T1 = new Date(AS_OF).getTime();
const SPAN = T1 - T0;
const DAY = 86_400_000;

/** x position as a percentage of the decade the wall covers */
export function fx(date: string): number {
  return ((new Date(date).getTime() - T0) / SPAN) * 100;
}

export function snapshotUrl(s: { origin: string }, ts: string): string {
  return `https://web.archive.org/web/${ts}/${s.origin}`;
}

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / DAY;
}

/** Human span between two dates, e.g. "7y 7m". Rounds months, never inflates. */
export function span(from: string, to: string): string {
  const days = daysBetween(from, to);
  let y = Math.floor(days / 365);
  let m = Math.round((days % 365) / 30.44);
  if (m >= 12) {
    y += 1;
    m = 0;
  }
  if (y && m) return `${y}y ${m}m`;
  if (y) return `${y}y`;
  return `${m}m`;
}

/** A record is stale when its newest readable capture is well over a year old.
 *  Zoom is the case that forced this: every capture from 2022 on is an empty
 *  JavaScript shell, so its record stops in 2020. Measuring "held for" or
 *  "never raised" against TODAY on a record like that invents six years of
 *  evidence that does not exist, and once ranked Zoom first on the wall. */
const STALE_DAYS = 400;

/** A run of identical prices only proves a hold if the captures are close
 *  enough together to leave no room for a change in between. Captures are
 *  yearly, so one missing year is tolerable; a five-year hole is not. Slack
 *  forced this: it reads $6.67 in 2015-2020 and $7.25 in 2026, with no readable
 *  capture between, and the plan was renamed inside that gap. */
const MAX_GAP_DAYS = 800;

/* ---------- per plan ---------- */

export function planEnds(p: Plan): string {
  return p.points[p.points.length - 1].date;
}

export function planIsStale(p: Plan): boolean {
  return daysBetween(planEnds(p), AS_OF) > STALE_DAYS;
}

export function planHorizon(p: Plan): string {
  return planIsStale(p) ? planEnds(p) : AS_OF;
}

export type Move = "first" | "rise" | "cut" | "hold" | "free";

/** What happened at this point relative to the previous published price. */
export function classify(points: Point[]): Move[] {
  let prev: number | null = null;
  return points.map((p) => {
    let m: Move;
    if (p.price === 0 && prev === null) m = "free";
    else if (p.price === 0) m = prev === 0 ? "hold" : "cut";
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
 *  CHANGED — not to the last time we sampled it, which under-reports every
 *  hold. A run never spans a gap in evidence, and an open-ended run ends at the
 *  horizon, so a stale record never claims to reach today. */
export function longestHold(p: Plan) {
  const pts = p.points;
  let best: { days: number; price: number; from: string; to: string; ongoing: boolean } | null = null;
  let i = 0;
  while (i < pts.length) {
    let j = i;
    while (
      j + 1 < pts.length &&
      pts[j + 1].price === pts[i].price &&
      daysBetween(pts[j].date, pts[j + 1].date) <= MAX_GAP_DAYS
    )
      j++;
    const next = pts[j + 1];
    const to =
      next && daysBetween(pts[j].date, next.date) <= MAX_GAP_DAYS
        ? next.date
        : next
          ? pts[j].date
          : planHorizon(p);
    const days = daysBetween(pts[i].date, to);
    if (!best || days > best.days) {
      best = { days, price: pts[i].price, from: pts[i].date, to, ongoing: !next && !planIsStale(p) };
    }
    i = j + 1;
  }
  return best;
}

/** Consecutive captures at the SAME price, collapsed into one run.
 *
 *  A rail was drawing ten identical "$12 held" boxes across five years, which
 *  is ten times the ink for one fact. One box per run says it once and the
 *  drop lines show how many captures stand behind it.
 *
 *  A run breaks on the same gap rule the hold claim uses: captures either side
 *  of a five-year hole are not one continuous run, because nobody can see what
 *  the price did in between. */
export type Run = {
  /** every capture in the run, in order — each keeps its own snapshot link */
  points: Point[];
  price: number;
  /** what happened at the START of the run, relative to the price before it */
  move: Move;
  /** the price immediately before this run, for the percentage */
  prev: number | null;
};

export function runs(points: Point[]): Run[] {
  const moves = classify(points);
  const out: Run[] = [];
  let i = 0;
  while (i < points.length) {
    let j = i;
    while (
      j + 1 < points.length &&
      points[j + 1].price === points[i].price &&
      daysBetween(points[j].date, points[j + 1].date) <= MAX_GAP_DAYS
    )
      j++;
    out.push({
      points: points.slice(i, j + 1),
      price: points[i].price,
      move: moves[i],
      prev: i > 0 ? points[i - 1].price : null,
    });
    i = j + 1;
  }
  return out;
}

/** The date of the most recent RISE. A cut is not a rise, and a rename is not
 *  a rise. Null means this plan has never raised its published price. */
export function lastRise(p: Plan): string | null {
  const moves = classify(p.points);
  for (let i = p.points.length - 1; i >= 0; i--) {
    if (moves[i] === "rise") return p.points[i].date;
  }
  return null;
}

/* ---------- per tool ---------- */

/** The plan a tool leads with: the cheapest paid plan, because that is the one
 *  most readers are actually on. A free tier is a line you can switch to, not
 *  the headline — a flat $0 wire says nothing about what a tool costs. */
export function headline(s: Series): Plan {
  const paid = s.plans.filter((p) => p.points.some((q) => q.price > 0));
  if (!paid.length) return s.plans[0];
  return paid.reduce((a, b) => {
    const av = a.points.find((q) => q.price > 0)!.price;
    const bv = b.points.find((q) => q.price > 0)!.price;
    return bv < av ? b : a;
  });
}

export function recordEnds(s: Series): string {
  return s.plans.map(planEnds).sort().slice(-1)[0];
}

export function isStale(s: Series): boolean {
  return daysBetween(recordEnds(s), AS_OF) > STALE_DAYS;
}

/** How good the record actually is, 0-100.
 *
 *  The wall leads with the exhibits worth looking at, and "worth looking at" is
 *  not a matter of taste — it is how much of the tool's life the archive caught,
 *  how densely, how recently, how many plans it caught, and whether the price
 *  ever did anything. A ten-point line running to this year beats a two-point
 *  line that stopped in 2022, and it is ordered that way without anyone deciding.
 *
 *  Five parts, each capped so no single one can carry a weak record:
 *    reach     how many years the record spans          up to 26
 *    density   captures per year of that span           up to 22
 *    currency  how recent the last readable capture is  up to 26
 *    breadth   how many plans were readable             up to 12
 *    movement  whether any price ever changed           up to 14
 */
export function quality(s: Series): number {
  const h = headline(s);
  const first = new Date(h.points[0].date).getTime();
  const last = new Date(recordEnds(s)).getTime();
  const years = (last - first) / DAY / 365;

  const reach = Math.min(26, (years / 10) * 26);

  const perYear = h.points.length / Math.max(1, years);
  const density = Math.min(22, (perYear / 1.1) * 22);

  const staleYears = (new Date(AS_OF).getTime() - last) / DAY / 365;
  const currency = Math.max(0, 26 - staleYears * 10);

  const breadth = Math.min(12, (s.plans.length - 1) * 6);

  const moves = s.plans.reduce(
    (n, p) => n + classify(p.points).filter((m) => m === "rise" || m === "cut").length,
    0,
  );
  const movement = Math.min(14, moves * 5);

  return Math.round(reach + density + currency + breadth + movement);
}

/** Default order: the best-evidenced exhibits first. */
export function sorted(): Series[] {
  return [...SEAT].sort((a, b) => quality(b) - quality(a) || a.tool.localeCompare(b.tool));
}

export function tickYears(): number[] {
  const out: number[] = [];
  // 2026 is dropped: the rail already ends on a "today" label sitting in 2026,
  // and a 2026 tick eight months to its left reads as two different nows.
  for (let y = 2016; y <= 2025; y += 1) out.push(y);
  return out;
}

/** Every rise and cut across every plan — the headline counts. */
export function allMoves() {
  let rises = 0;
  let cuts = 0;
  for (const s of SEAT) {
    for (const p of s.plans) {
      const m = classify(p.points);
      m.forEach((v) => {
        if (v === "rise") rises++;
        else if (v === "cut") cuts++;
      });
    }
  }
  return { rises, cuts };
}

export function totalPoints(): number {
  return SEAT.reduce((n, s) => n + s.plans.reduce((k, p) => k + p.points.length, 0), 0);
}
