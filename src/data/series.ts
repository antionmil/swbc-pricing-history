/** The corpus.
 *
 *  Every row here was read by hand out of an archived pricing page on
 *  web.archive.org and checked against that page. Nothing is estimated and
 *  nothing is interpolated: if the archive holds no readable capture for a
 *  period, there is no point for that period and the wire simply spans it.
 *
 *  `price` is the published list price for ONE seat per month, in US dollars.
 *  Where a page showed both a monthly and an annual rate, the annual per-month
 *  rate is used, because that is the number the page leads with.
 *  `price: null` means the page published no seat price at all in that period
 *  (Vercel's 2018 usage-billing era), which is different from a price of zero.
 *
 *  Source of truth for the full 222-row table, including every plan rather
 *  than the headline one: ../../prep/prices.json
 */

export type Point = {
  /** capture date, YYYY-MM-DD */
  date: string;
  /** dollars per seat per month; 0 = free; null = no seat price published */
  price: number | null;
  /** Wayback timestamp — with `origin` this rebuilds the exact snapshot URL */
  ts: string;
  /** shown under the chart when it explains a step or a gap */
  note?: string;
};

export type Series = {
  tool: string;
  /** which plan this line follows, in the words the page used */
  plan: string;
  /** the live pricing page today */
  site: string;
  /** the URL as archived; some tools changed domain (Vercel was ZEIT) */
  origin: string;
  points: Point[];
  /** a plan whose price is a percentage cannot share a dollar axis */
  kind: "seat";
  note?: string;
};

export type PercentSeries = {
  tool: string;
  plan: string;
  site: string;
  origin: string;
  kind: "percent";
  /** the rate exactly as the page printed it */
  points: { date: string; rate: string; ts: string; note?: string }[];
  note?: string;
};

export const SEAT: Series[] = [
  {
    tool: "Figma",
    plan: "Professional · per editor",
    site: "https://www.figma.com/pricing/",
    origin: "https://www.figma.com/pricing/",
    kind: "seat",
    points: [
      { date: "2016-03-10", price: 0, ts: "20160310052258", note: "no paid plan existed; the page read “Figma is free during the Preview Release”" },
      { date: "2018-06-21", price: 12, ts: "20180621170352", note: "the first paid plan" },
      { date: "2019-01-07", price: 12, ts: "20190107060504" },
      { date: "2020-03-12", price: 12, ts: "20200312083402" },
      { date: "2021-01-10", price: 12, ts: "20210110152949" },
      { date: "2022-01-11", price: 12, ts: "20220111060415" },
      { date: "2023-01-10", price: 12, ts: "20230110220322" },
      { date: "2024-01-10", price: 12, ts: "20240110202527" },
      { date: "2025-01-09", price: 12, ts: "20250109022853" },
      { date: "2026-01-05", price: 16, ts: "20260105144450", note: "the seat splits into Full, Dev and Collab; Full is $16" },
    ],
  },
  {
    tool: "Vercel",
    plan: "Pro · per member",
    site: "https://vercel.com/pricing",
    origin: "https://vercel.com/pricing",
    kind: "seat",
    note: "Captures before April 2020 are zeit.co/pricing. The company was called ZEIT and the product was Now.",
    points: [
      { date: "2017-05-11", price: 50, ts: "20170511054635", note: "ZEIT Pro was a flat monthly fee, not a seat" },
      { date: "2018-06-04", price: 50, ts: "20180604134907" },
      { date: "2018-12-03", price: null, ts: "20181203094940", note: "Now 2.0 dropped the tiers entirely and charged by usage" },
      { date: "2019-10-20", price: 20, ts: "20191020005226", note: "named tiers return, and Pro is $20 for the first time" },
      { date: "2020-04-22", price: 20, ts: "20200422121817", note: "ZEIT becomes Vercel; Pro becomes per-member" },
      { date: "2021-01-21", price: 20, ts: "20210121022648" },
      { date: "2022-01-11", price: 20, ts: "20220111055513" },
      { date: "2023-01-02", price: 20, ts: "20230102185032" },
      { date: "2024-01-02", price: 20, ts: "20240102222518" },
      { date: "2025-01-08", price: 20, ts: "20250108100011" },
      { date: "2026-01-01", price: 20, ts: "20260101230202", note: "still $20, but the seat now carries a usage meter with $20 of included credit" },
    ],
  },
  {
    tool: "Linear",
    plan: "Basic · per user",
    site: "https://linear.app/pricing",
    origin: "https://linear.app/pricing",
    kind: "seat",
    points: [
      { date: "2020-07-01", price: 8, ts: "20200701053740", note: "the plan was called Standard" },
      { date: "2021-01-11", price: 8, ts: "20210111152002" },
      { date: "2022-01-29", price: 8, ts: "20220129033140" },
      { date: "2023-01-17", price: 8, ts: "20230117232341" },
      { date: "2024-01-28", price: 8, ts: "20240128004838" },
      { date: "2024-08-23", price: 8, ts: "20240823154705", note: "renamed Basic; Plus became Business at the same time" },
      { date: "2025-01-16", price: 8, ts: "20250116002909" },
      { date: "2026-01-03", price: 10, ts: "20260103201538", note: "the first rise in five and a half years" },
    ],
  },
  {
    tool: "Notion",
    plan: "Plus · per member",
    site: "https://www.notion.so/pricing",
    origin: "https://www.notion.so/pricing",
    kind: "seat",
    note: "Notion's pricing page was rendered in the browser until early 2021, so every capture before then is an empty shell. There is no readable record of what Notion charged from 2017 to 2020.",
    points: [
      { date: "2021-04-10", price: 8, ts: "20210410012057", note: "the plan was called Team" },
      { date: "2021-12-03", price: 8, ts: "20211203154408" },
      { date: "2022-07-01", price: 8, ts: "20220701163325" },
      { date: "2023-01-07", price: 8, ts: "20230107100153", note: "renamed Plus; a new Business tier appeared above it at $15" },
      { date: "2024-01-09", price: 8, ts: "20240109023505" },
      { date: "2026-03-16", price: 10, ts: "20260316012409", note: "every 2025 capture was crawled from Europe and shows euros, so 2025 has no dollar record" },
    ],
  },
];

/** Priced as a share of the transaction, so these cannot share a dollar axis
 *  with the seat plans. They get their own section rather than a distorted
 *  scale. Populated once each rate is verified against its own snapshot. */
export const PERCENT: PercentSeries[] = [
  {
    tool: "Stripe",
    plan: "Standard card payment · per transaction",
    site: "https://stripe.com/pricing",
    origin: "https://stripe.com/pricing",
    kind: "percent",
    note: "Eight yearly captures were readable, back to 2019. Seven of them print the same rate. The archive holds no readable stripe.com/pricing capture before 2019, so nothing is claimed about the years before it.",
    points: [
      { date: "2019-05-07", rate: "2.7% + 5¢", ts: "20190507010838", note: "the European card rate — this capture was crawled from Europe, the same trap that cost Notion its 2025 dollar record" },
      { date: "2020-01-04", rate: "2.9% + 30¢", ts: "20200104165645" },
      { date: "2021-01-01", rate: "2.9% + 30¢", ts: "20210101031113" },
      { date: "2022-01-04", rate: "2.9% + 30¢", ts: "20220104004114" },
      { date: "2023-01-01", rate: "2.9% + 30¢", ts: "20230101181851" },
      { date: "2024-01-04", rate: "2.9% + 30¢", ts: "20240104213453" },
      { date: "2025-01-01", rate: "2.9% + 30¢", ts: "20250101130720" },
      { date: "2026-01-01", rate: "2.9% + 30¢", ts: "20260101141014" },
    ],
  },
];

/** Today, for "and counting" spans. Set at build time, not request time — the
 *  page is static and a request-time date would opt it out of prerendering. */
export const AS_OF = "2026-09-07";
