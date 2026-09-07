import { SEAT, AS_OF, type Series, type Plan, type Point } from "@/data/series";

/* The axis ends TODAY, not at a rounded year boundary. When it ran to
   2026-10-01 the "now" marker sat to the RIGHT of the 2026 tick, which read as
   though now were some time after 2026 — in 2026. Now is the right-hand edge,
   and the newest tag on a current record is the price being charged today. */
export const T0 = new Date("2016-01-01").getTime();
export const T1 = new Date(AS_OF).getTime();
const SPAN = T1 - T0;
const DAY = 86_400_000;

/** x position as a percentage of the decade the wall covers.
 *  Kept for the hero and anything that wants the shared decade. */
export function fx(date: string): number {
  return ((new Date(date).getTime() - T0) / SPAN) * 100;
}

/** Each rail spans only ITS OWN record.
 *
 *  Every rail used to start at 2016 whatever the tool. Notion's first readable
 *  capture is April 2021, so its rail opened on five blank years with ticks and
 *  gridlines and nothing on them, which reads as missing data rather than as a
 *  record that simply starts later.
 *
 *  The right edge stays TODAY for every tool, so "scroll left to go back" and
 *  the live-price edge behave the same everywhere. Only the left edge moves. */
export function domain(p: Plan): { t0: number; t1: number; years: number } {
  const first = new Date(p.points[0].date).getTime();
  // a little air before the first capture so its box is not flush to the edge
  const t0 = first - 150 * DAY;
  const t1 = new Date(AS_OF).getTime();
  return { t0, t1, years: (t1 - t0) / DAY / 365 };
}

export function fxIn(date: string, d: { t0: number; t1: number }): number {
  return ((new Date(date).getTime() - d.t0) / (d.t1 - d.t0)) * 100;
}

/** Rail width in px: enough room per year to read, and never so wide that a
 *  two-year record is stretched across a screen and a half. */
export function railWidth(d: { years: number }): number {
  return Math.round(Math.min(1720, Math.max(520, d.years * 152)));
}

/** Only the year ticks that fall inside this rail's own domain. */
export function ticksIn(d: { t0: number; t1: number }): number[] {
  const y0 = new Date(d.t0).getUTCFullYear();
  const y1 = new Date(d.t1).getUTCFullYear();
  const out: number[] = [];
  for (let y = y0; y <= y1; y++) {
    const t = new Date(`${y}-01-01`).getTime();
    // drop a tick that would sit within 3% of either edge, where it collides
    // with the first box or with the "today" marker
    const k = (t - d.t0) / (d.t1 - d.t0);
    if (k >= 0.03 && k <= 0.94) out.push(y);
  }
  return out;
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

/** The tool's entry price today: the newest price on its cheapest paid plan.
 *  That is the number a reader means by "what does this cost". */
export function entryPrice(s: Series): number {
  const h = headline(s);
  return h.points[h.points.length - 1].price;
}

/** Change from the first PAID price on the headline plan to the newest one.
 *  Measured off the first paid price, not off a free tier, or every tool that
 *  ever had a free plan would read as an infinite increase. */
export function totalChange(s: Series): number | null {
  const h = headline(s);
  const first = h.points.find((p) => p.price > 0);
  const last = h.points[h.points.length - 1];
  if (!first || first.price === 0 || first === last) return null;
  return (last.price - first.price) / first.price;
}

export type SortKey = "record" | "price" | "change";
export type Audience = "all" | "work" | "consumer";

export function audienceOf(s: Series): "work" | "consumer" {
  return s.audience ?? "work";
}

/** Every order the wall offers. `record` is the default and has no direction:
 *  a worse-evidenced exhibit is never what someone is looking for. */
export function order(key: SortKey, desc: boolean, who: Audience = "all"): Series[] {
  const list = SEAT.filter((s) => who === "all" || audienceOf(s) === who);
  if (key === "record") return list.sort((a, b) => quality(b) - quality(a) || a.tool.localeCompare(b.tool));
  const val = key === "price" ? entryPrice : (s: Series) => totalChange(s) ?? 0;
  return list.sort((a, b) => {
    const d = val(a) - val(b);
    return (desc ? -d : d) || a.tool.localeCompare(b.tool);
  });
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
