/** The corpus.
 *
 *  Every row here was read by hand out of an archived pricing page on
 *  web.archive.org and checked against that page. Nothing is estimated and
 *  nothing is interpolated: if the archive holds no readable capture for a
 *  period, there is no point for that period and the wire simply spans it.
 *
 *  Each tool carries one line PER PLAN. A plan keeps one line across a rename
 *  where it is plainly the same slot in the lineup — Linear's Standard became
 *  Basic, Notion's Team became Plus — and gets a note saying so. It does NOT
 *  keep one line across a plan that merely shares a word: ZEIT sold a $15
 *  "Premium" tier that is not the ancestor of today's Vercel Pro, and folding
 *  it in reported Pro as $15 in 2017 when the page said $50.
 *
 *  `price` is the published list price for ONE seat per month, in US dollars.
 *  Where a page showed both a monthly and an annual rate, the annual per-month
 *  rate is used, because that is the number the page leads with.
 *
 *  Source of truth for the four deep tools, all plans, every capture:
 *  ../../prep/prices.json
 */

export type Point = {
  /** capture date, YYYY-MM-DD */
  date: string;
  /** dollars per seat per month; 0 = free */
  price: number;
  /** Wayback timestamp — with `origin` this rebuilds the exact snapshot URL */
  ts: string;
  /** shown in the collapsed notes when it explains a step or a gap */
  note?: string;
  /** Overrides the tool's `origin` for THIS capture. Needed when a tool changed
   *  domain: Vercel's pre-April-2020 captures are of zeit.co/pricing, and
   *  pointing them at vercel.com/pricing sent the reader to a page that never
   *  carried those prices. Caught by re-fetching a sample and failing to find
   *  the price we claim is on it. */
  origin?: string;
};

export type Plan = {
  /** the plan's name, in the words the page used */
  name: string;
  points: Point[];
};

export type Series = {
  tool: string;
  /** who pays for it. Defaults to "work" — the tools this crowd expenses.
   *  "consumer" is the subscription you pay for out of your own pocket. */
  audience?: "work" | "consumer";
  /** the live pricing page today */
  site: string;
  /** the URL as archived; some tools changed domain (Vercel was ZEIT) */
  origin: string;
  plans: Plan[];
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
    site: "https://www.figma.com/pricing/",
    origin: "https://www.figma.com/pricing/",
    note: "Figma had no paid plan at all in 2016 — the page read “free during the Preview Release”. The 2017 capture is a JavaScript shell with no content.",
    plans: [
      {
        name: "Starter",
        points: [
          { date: "2016-03-10", price: 0, ts: "20160310052258" },
          { date: "2018-06-21", price: 0, ts: "20180621170352" },
          { date: "2018-07-02", price: 0, ts: "20180702010538" },
          { date: "2019-01-07", price: 0, ts: "20190107060504" },
          { date: "2019-07-01", price: 0, ts: "20190701210933" },
          { date: "2020-03-12", price: 0, ts: "20200312083402" },
          { date: "2020-07-01", price: 0, ts: "20200701183541" },
          { date: "2021-01-10", price: 0, ts: "20210110152949" },
          { date: "2021-07-18", price: 0, ts: "20210718184555" },
          { date: "2022-01-11", price: 0, ts: "20220111060415" },
          { date: "2022-07-24", price: 0, ts: "20220724203711" },
          { date: "2023-01-10", price: 0, ts: "20230110220322" },
          { date: "2023-07-03", price: 0, ts: "20230703124226" },
          { date: "2024-01-10", price: 0, ts: "20240110202527" },
          { date: "2024-07-06", price: 0, ts: "20240706163801" },
          { date: "2025-01-09", price: 0, ts: "20250109022853" },
          { date: "2026-01-05", price: 0, ts: "20260105144450" },
          { date: "2026-07-07", price: 0, ts: "20260707204815" },
        ],
      },
      {
        name: "Professional",
        points: [
          { date: "2018-06-21", price: 12, ts: "20180621170352", note: "the first paid plan" },
          { date: "2018-07-02", price: 12, ts: "20180702010538" },
          { date: "2019-01-07", price: 12, ts: "20190107060504" },
          { date: "2019-07-01", price: 12, ts: "20190701210933" },
          { date: "2020-03-12", price: 12, ts: "20200312083402" },
          { date: "2020-07-01", price: 12, ts: "20200701183541" },
          { date: "2021-01-10", price: 12, ts: "20210110152949" },
          { date: "2021-07-18", price: 12, ts: "20210718184555" },
          { date: "2022-01-11", price: 12, ts: "20220111060415" },
          { date: "2022-07-24", price: 12, ts: "20220724203711" },
          { date: "2023-01-10", price: 12, ts: "20230110220322" },
          { date: "2023-07-03", price: 12, ts: "20230703124226" },
          { date: "2024-01-10", price: 12, ts: "20240110202527" },
          { date: "2024-07-06", price: 12, ts: "20240706163801" },
          { date: "2025-01-09", price: 12, ts: "20250109022853" },
          { date: "2026-01-05", price: 16, ts: "20260105144450", note: "the seat splits into Full, Dev and Collab; Full is $16" },
          { date: "2026-07-07", price: 16, ts: "20260707204815" },
        ],
      },
      {
        name: "Organization",
        points: [
          { date: "2018-06-21", price: 45, ts: "20180621170352" },
          { date: "2018-07-02", price: 45, ts: "20180702010538" },
          { date: "2019-01-07", price: 45, ts: "20190107060504" },
          { date: "2019-07-01", price: 45, ts: "20190701210933" },
          { date: "2020-03-12", price: 45, ts: "20200312083402" },
          { date: "2020-07-01", price: 45, ts: "20200701183541" },
          { date: "2021-01-10", price: 45, ts: "20210110152949" },
          { date: "2021-07-18", price: 45, ts: "20210718184555" },
          { date: "2022-01-11", price: 45, ts: "20220111060415" },
          { date: "2022-07-24", price: 45, ts: "20220724203711" },
          { date: "2023-01-10", price: 45, ts: "20230110220322" },
          { date: "2023-07-03", price: 45, ts: "20230703124226" },
          { date: "2024-01-10", price: 45, ts: "20240110202527" },
          { date: "2024-07-06", price: 45, ts: "20240706163801" },
          { date: "2025-01-09", price: 45, ts: "20250109022853" },
          { date: "2026-01-05", price: 55, ts: "20260105144450" },
          { date: "2026-07-07", price: 55, ts: "20260707204815" },
        ],
      },
      {
        name: "Enterprise",
        points: [
          { date: "2022-07-24", price: 75, ts: "20220724203711" },
          { date: "2023-01-10", price: 75, ts: "20230110220322" },
          { date: "2023-07-03", price: 75, ts: "20230703124226" },
          { date: "2024-01-10", price: 75, ts: "20240110202527" },
          { date: "2024-07-06", price: 75, ts: "20240706163801" },
          { date: "2025-01-09", price: 75, ts: "20250109022853" },
          { date: "2026-01-05", price: 90, ts: "20260105144450" },
          { date: "2026-07-07", price: 90, ts: "20260707204815" },
        ],
      },
    ],
  },
  {
    tool: "Notion",
    site: "https://www.notion.so/pricing",
    origin: "https://www.notion.so/pricing",
    note: "Notion's pricing page was rendered in the browser until early 2021, so every capture before then is an empty shell. Every 2025 capture was crawled from Europe and prints euros, so 2025 has no dollar record.",
    plans: [
      {
        name: "Free",
        points: [
          { date: "2021-04-10", price: 0, ts: "20210410012057" },
          { date: "2021-12-03", price: 0, ts: "20211203154408" },
          { date: "2022-01-11", price: 0, ts: "20220111091610" },
          { date: "2022-07-01", price: 0, ts: "20220701163325" },
          { date: "2023-01-07", price: 0, ts: "20230107100153" },
          { date: "2024-01-09", price: 0, ts: "20240109023505" },
          { date: "2026-03-16", price: 0, ts: "20260316012409" },
          { date: "2026-07-31", price: 0, ts: "20260731113200" },
        ],
      },
      {
        name: "Plus",
        points: [
          { date: "2021-04-10", price: 8, ts: "20210410012057", note: "called Team" },
          { date: "2021-12-03", price: 8, ts: "20211203154408" },
          { date: "2022-01-11", price: 8, ts: "20220111091610" },
          { date: "2022-07-01", price: 8, ts: "20220701163325" },
          { date: "2023-01-07", price: 8, ts: "20230107100153", note: "renamed Plus" },
          { date: "2024-01-09", price: 8, ts: "20240109023505" },
          { date: "2026-03-16", price: 10, ts: "20260316012409" },
          { date: "2026-07-31", price: 10, ts: "20260731113200" },
        ],
      },
      {
        name: "Business",
        points: [
          { date: "2023-01-07", price: 15, ts: "20230107100153" },
          { date: "2024-01-09", price: 15, ts: "20240109023505" },
          { date: "2026-03-16", price: 20, ts: "20260316012409" },
          { date: "2026-07-31", price: 20, ts: "20260731113200" },
        ],
      },
    ],
  },
  {
    tool: "Linear",
    site: "https://linear.app/pricing",
    origin: "https://linear.app/pricing",
    plans: [
      {
        name: "Free",
        points: [
          { date: "2020-07-01", price: 0, ts: "20200701053740" },
          { date: "2021-01-11", price: 0, ts: "20210111152002" },
          { date: "2021-08-04", price: 0, ts: "20210804045410" },
          { date: "2022-01-29", price: 0, ts: "20220129033140" },
          { date: "2022-07-25", price: 0, ts: "20220725144111" },
          { date: "2023-01-17", price: 0, ts: "20230117232341" },
          { date: "2023-08-18", price: 0, ts: "20230818072256" },
          { date: "2024-01-28", price: 0, ts: "20240128004838" },
          { date: "2024-08-23", price: 0, ts: "20240823154705" },
          { date: "2025-01-16", price: 0, ts: "20250116002909" },
          { date: "2025-07-13", price: 0, ts: "20250713101933" },
          { date: "2026-01-03", price: 0, ts: "20260103201538" },
          { date: "2026-07-01", price: 0, ts: "20260701010606" },
        ],
      },
      {
        name: "Basic",
        points: [
          { date: "2020-07-01", price: 8, ts: "20200701053740", note: "called Standard" },
          { date: "2021-01-11", price: 8, ts: "20210111152002" },
          { date: "2021-08-04", price: 8, ts: "20210804045410" },
          { date: "2022-01-29", price: 8, ts: "20220129033140" },
          { date: "2022-07-25", price: 8, ts: "20220725144111" },
          { date: "2023-01-17", price: 8, ts: "20230117232341" },
          { date: "2023-08-18", price: 8, ts: "20230818072256" },
          { date: "2024-01-28", price: 8, ts: "20240128004838" },
          { date: "2024-08-23", price: 8, ts: "20240823154705", note: "renamed Basic" },
          { date: "2025-01-16", price: 8, ts: "20250116002909" },
          { date: "2025-07-13", price: 8, ts: "20250713101933" },
          { date: "2026-01-03", price: 10, ts: "20260103201538", note: "the first rise in five and a half years" },
          { date: "2026-07-01", price: 10, ts: "20260701010606" },
        ],
      },
      {
        name: "Business",
        points: [
          { date: "2021-01-11", price: 12, ts: "20210111152002" },
          { date: "2021-08-04", price: 12, ts: "20210804045410" },
          { date: "2022-01-29", price: 12, ts: "20220129033140" },
          { date: "2022-07-25", price: 12, ts: "20220725144111" },
          { date: "2023-01-17", price: 14, ts: "20230117232341" },
          { date: "2023-08-18", price: 14, ts: "20230818072256" },
          { date: "2024-01-28", price: 14, ts: "20240128004838" },
          { date: "2024-08-23", price: 12, ts: "20240823154705", note: "Plus became Business and the listed price fell to $12 for one capture" },
          { date: "2025-01-16", price: 14, ts: "20250116002909" },
          { date: "2025-07-13", price: 14, ts: "20250713101933" },
          { date: "2026-01-03", price: 16, ts: "20260103201538" },
          { date: "2026-07-01", price: 16, ts: "20260701010606" },
        ],
      },
    ],
  },
  {
    tool: "Vercel",
    site: "https://vercel.com/pricing",
    origin: "https://vercel.com/pricing",
    note: "Captures before April 2020 are zeit.co/pricing: the company was ZEIT and the product was Now. ZEIT also sold a $15 Premium tier, which is not the ancestor of today's Pro and is not on this line.",
    plans: [
      {
        name: "Hobby",
        points: [
          { date: "2017-05-11", price: 0, ts: "20170511054635", origin: "https://zeit.co/pricing" },
          { date: "2017-09-16", price: 0, ts: "20170916171911", origin: "https://zeit.co/pricing" },
          { date: "2018-06-04", price: 0, ts: "20180604134907", origin: "https://zeit.co/pricing" },
          { date: "2018-12-03", price: 0, ts: "20181203094940", origin: "https://zeit.co/pricing" },
          { date: "2019-06-28", price: 0, ts: "20190628195630", origin: "https://zeit.co/pricing" },
          { date: "2019-10-20", price: 0, ts: "20191020005226", origin: "https://zeit.co/pricing" },
          { date: "2020-04-22", price: 0, ts: "20200422121817" },
          { date: "2020-08-08", price: 0, ts: "20200808093240" },
          { date: "2021-01-21", price: 0, ts: "20210121022648" },
          { date: "2021-07-21", price: 0, ts: "20210721075254" },
          { date: "2022-01-11", price: 0, ts: "20220111055513" },
          { date: "2022-07-02", price: 0, ts: "20220702004720" },
          { date: "2023-01-02", price: 0, ts: "20230102185032" },
          { date: "2024-01-02", price: 0, ts: "20240102222518" },
          { date: "2025-01-08", price: 0, ts: "20250108100011" },
          { date: "2026-01-01", price: 0, ts: "20260101230202" },
        ],
      },
      {
        name: "Pro",
        points: [
          { date: "2017-05-11", price: 50, ts: "20170511054635", origin: "https://zeit.co/pricing", note: "a flat monthly fee, not a seat" },
          { date: "2017-09-16", price: 50, ts: "20170916171911", origin: "https://zeit.co/pricing" },
          { date: "2018-06-04", price: 50, ts: "20180604134907", origin: "https://zeit.co/pricing" },
          { date: "2018-12-03", price: 0.99, ts: "20181203094940", origin: "https://zeit.co/pricing", note: "Now 2.0 dropped the tiers for pure usage billing" },
          { date: "2019-06-28", price: 0.99, ts: "20190628195630", origin: "https://zeit.co/pricing" },
          { date: "2019-10-20", price: 20, ts: "20191020005226", origin: "https://zeit.co/pricing", note: "named tiers return at $20" },
          { date: "2020-04-22", price: 20, ts: "20200422121817" },
          { date: "2020-08-08", price: 20, ts: "20200808093240" },
          { date: "2021-01-21", price: 20, ts: "20210121022648" },
          { date: "2021-07-21", price: 20, ts: "20210721075254" },
          { date: "2022-01-11", price: 20, ts: "20220111055513" },
          { date: "2022-07-02", price: 20, ts: "20220702004720" },
          { date: "2023-01-02", price: 20, ts: "20230102185032" },
          { date: "2024-01-02", price: 20, ts: "20240102222518" },
          { date: "2025-01-08", price: 20, ts: "20250108100011" },
          { date: "2026-01-01", price: 20, ts: "20260101230202", note: "still $20, but the seat now carries a usage meter" },
        ],
      },
    ],
  },
  {
    tool: "GitHub",
    site: "https://github.com/pricing",
    origin: "https://github.com/pricing",
    note: "GitHub cut Team from $9 to $4 in April 2020. The January 2020 capture still shows $9; the next yearly capture shows $4.",
    plans: [
      {
        name: "Team",
        points: [
          { date: "2018-01-03", price: 9, ts: "20180103232028" },
          { date: "2019-01-01", price: 9, ts: "20190101015416" },
          { date: "2020-01-01", price: 9, ts: "20200101000214" },
          { date: "2021-01-01", price: 4, ts: "20210101001220", note: "cut from $9 to $4" },
          { date: "2022-01-01", price: 4, ts: "20220101001152" },
          { date: "2023-01-01", price: 4, ts: "20230101011634" },
          { date: "2024-01-01", price: 4, ts: "20240101012417" },
          { date: "2025-01-01", price: 4, ts: "20250101011831" },
          { date: "2026-01-01", price: 4, ts: "20260101041321" },
        ],
      },
      {
        name: "Enterprise",
        points: [
          { date: "2018-01-03", price: 21, ts: "20180103232028" },
          { date: "2019-01-01", price: 21, ts: "20190101015416" },
          { date: "2021-01-01", price: 21, ts: "20210101001220" },
          { date: "2022-01-01", price: 21, ts: "20220101001152" },
          { date: "2023-01-01", price: 21, ts: "20230101011634" },
          { date: "2024-01-01", price: 21, ts: "20240101012417" },
          { date: "2025-01-01", price: 21, ts: "20250101011831" },
          { date: "2026-01-01", price: 21, ts: "20260101041321" },
        ],
      },
    ],
  },
  {
    tool: "Sentry",
    site: "https://sentry.io/pricing/",
    origin: "https://sentry.io/pricing/",
    note: "The 2021 to 2024 captures hold no readable price. Every capture that does — 2019, 2020, 2025 and 2026 — prints the same two figures.",
    plans: [
      {
        name: "Team",
        points: [
          { date: "2019-01-04", price: 26, ts: "20190104094758" },
          { date: "2020-01-11", price: 26, ts: "20200111215057" },
          { date: "2025-01-02", price: 26, ts: "20250102071408" },
          { date: "2026-01-06", price: 26, ts: "20260106011552" },
        ],
      },
      {
        name: "Business",
        points: [
          { date: "2019-01-04", price: 80, ts: "20190104094758" },
          { date: "2020-01-11", price: 80, ts: "20200111215057" },
          { date: "2025-01-02", price: 80, ts: "20250102071408" },
          { date: "2026-01-06", price: 80, ts: "20260106011552" },
        ],
      },
    ],
  },
  {
    tool: "Slack",
    site: "https://slack.com/pricing",
    origin: "https://slack.com/pricing",
    note: "Slack's pricing page was rendered in the browser from 2021 to 2025, so those captures hold no readable price. Standard was renamed Pro during that gap.",
    plans: [
      {
        name: "Standard, later Pro",
        points: [
          { date: "2015-01-02", price: 6.67, ts: "20150102160343" },
          { date: "2016-01-04", price: 6.67, ts: "20160104150412" },
          { date: "2017-01-06", price: 6.67, ts: "20170106145039" },
          { date: "2018-01-26", price: 6.67, ts: "20180126142616" },
          { date: "2020-02-10", price: 6.67, ts: "20200210000230" },
          { date: "2026-01-14", price: 7.25, ts: "20260114054034", note: "now called Pro" },
        ],
      },
      {
        name: "Plus",
        points: [
          { date: "2015-01-02", price: 12.5, ts: "20150102160343" },
          { date: "2016-01-04", price: 12.5, ts: "20160104150412" },
          { date: "2017-01-06", price: 12.5, ts: "20170106145039" },
          { date: "2018-01-26", price: 12.5, ts: "20180126142616" },
        ],
      },
    ],
  },
  {
    tool: "GitLab",
    site: "https://about.gitlab.com/pricing/",
    origin: "https://about.gitlab.com/pricing/",
    note: "The 2019 and 2020 captures hold no readable price, and 2025 shows only a promotional rate for new small-business customers, so neither is plotted.",
    plans: [
      {
        name: "Premium",
        points: [
          { date: "2018-03-15", price: 19, ts: "20180315063137" },
          { date: "2021-01-04", price: 19, ts: "20210104233342" },
          { date: "2022-01-05", price: 19, ts: "20220105063600" },
          { date: "2023-01-01", price: 19, ts: "20230101195405" },
          { date: "2024-01-01", price: 29, ts: "20240101013048", note: "a 53% rise after six years at $19" },
        ],
      },
      {
        name: "Ultimate",
        points: [
          { date: "2022-01-05", price: 99, ts: "20220105063600" },
          { date: "2023-01-01", price: 99, ts: "20230101195405" },
        ],
      },
    ],
  },
  {
    tool: "Netlify",
    site: "https://www.netlify.com/pricing/",
    origin: "https://www.netlify.com/pricing/",
    note: "Before 2021 Netlify sold Pro as a flat $45 a month for a team of five, not per member, so those captures are not on these lines.",
    plans: [
      {
        name: "Pro",
        points: [
          { date: "2021-01-27", price: 19, ts: "20210127175505" },
          { date: "2022-01-02", price: 19, ts: "20220102005823" },
          { date: "2023-01-08", price: 19, ts: "20230108032422" },
          { date: "2025-01-06", price: 19, ts: "20250106093557" },
          { date: "2026-01-01", price: 20, ts: "20260101174810" },
        ],
      },
      {
        name: "Business",
        points: [
          { date: "2021-01-27", price: 99, ts: "20210127175505" },
          { date: "2022-01-02", price: 99, ts: "20220102005823" },
          { date: "2023-01-08", price: 99, ts: "20230108032422" },
        ],
      },
    ],
  },
  {
    tool: "Zoom",
    site: "https://zoom.us/pricing",
    origin: "https://zoom.us/pricing",
    note: "Every capture from 2022 on is a JavaScript shell with no readable price, so Zoom's record stops in 2020.",
    plans: [
      {
        name: "Pro",
        points: [
          { date: "2017-01-03", price: 14.99, ts: "20170103030713" },
          { date: "2018-01-30", price: 14.99, ts: "20180130132526" },
          { date: "2019-01-29", price: 14.99, ts: "20190129175726" },
          { date: "2020-01-08", price: 14.99, ts: "20200108063146" },
        ],
      },
      {
        name: "Business",
        points: [
          { date: "2017-01-03", price: 19.99, ts: "20170103030713" },
          { date: "2018-01-30", price: 19.99, ts: "20180130132526" },
          { date: "2019-01-29", price: 19.99, ts: "20190129175726" },
          { date: "2020-01-08", price: 19.99, ts: "20200108063146" },
        ],
      },
    ],
  },
  {
    tool: "Airtable",
    site: "https://airtable.com/pricing",
    origin: "https://airtable.com/pricing",
    note: "Airtable retired Plus in 2023 and Team took its place in the lineup at twice the price. The 2017 and 2018 captures hold no readable price.",
    plans: [
      {
        name: "Plus, later Team",
        points: [
          { date: "2019-01-28", price: 10, ts: "20190128160603" },
          { date: "2020-01-28", price: 10, ts: "20200128193852" },
          { date: "2021-01-04", price: 10, ts: "20210104174733" },
          { date: "2022-01-01", price: 10, ts: "20220101041824" },
          { date: "2023-01-05", price: 10, ts: "20230105043256" },
          { date: "2024-01-05", price: 20, ts: "20240105005508", note: "Plus retired; Team took its slot at $20" },
          { date: "2025-01-01", price: 20, ts: "20250101005710" },
          { date: "2026-01-01", price: 20, ts: "20260101095326" },
        ],
      },
      {
        name: "Pro, later Business",
        points: [
          { date: "2019-01-28", price: 20, ts: "20190128160603" },
          { date: "2020-01-28", price: 20, ts: "20200128193852" },
          { date: "2021-01-04", price: 20, ts: "20210104174733" },
          { date: "2022-01-01", price: 20, ts: "20220101041824" },
          { date: "2023-01-05", price: 20, ts: "20230105043256" },
          { date: "2024-01-05", price: 45, ts: "20240105005508" },
          { date: "2025-01-01", price: 45, ts: "20250101005710" },
          { date: "2026-01-01", price: 45, ts: "20260101095326" },
        ],
      },
    ],
  },
  {
    tool: "ClickUp",
    site: "https://clickup.com/pricing",
    origin: "https://clickup.com/pricing",
    note: "The 2020 and 2021 captures print a Business figure that does not line up with either side of it, so only the captures that read cleanly are plotted.",
    plans: [
      {
        name: "Unlimited",
        points: [
          { date: "2018-03-14", price: 5, ts: "20180314150354" },
          { date: "2019-01-02", price: 5, ts: "20190102144300" },
          { date: "2020-03-03", price: 5, ts: "20200303231915" },
          { date: "2021-01-16", price: 5, ts: "20210116001215" },
          { date: "2022-01-03", price: 5, ts: "20220103041749" },
          { date: "2023-01-13", price: 5, ts: "20230113223755" },
          { date: "2025-01-03", price: 7, ts: "20250103151241" },
          { date: "2026-01-03", price: 7, ts: "20260103201321" },
        ],
      },
      {
        name: "Business",
        points: [
          { date: "2022-01-03", price: 9, ts: "20220103041749" },
          { date: "2023-01-13", price: 12, ts: "20230113223755" },
          { date: "2026-01-03", price: 12, ts: "20260103201321" },
        ],
      },
    ],
  },
  {
    tool: "Asana",
    site: "https://asana.com/pricing",
    origin: "https://asana.com/pricing",
    plans: [
      {
        name: "Premium, later Starter",
        points: [
          { date: "2016-01-01", price: 8.33, ts: "20160101054530" },
          { date: "2017-01-02", price: 8.33, ts: "20170102125042" },
          { date: "2018-01-04", price: 9.99, ts: "20180104005357", note: "first rise, $8.33 to $9.99" },
          { date: "2019-01-03", price: 9.99, ts: "20190103205401" },
          { date: "2020-01-01", price: 10.99, ts: "20200101200902", note: "second rise, $9.99 to $10.99" },
          { date: "2021-01-03", price: 10.99, ts: "20210103130128" },
          { date: "2022-01-01", price: 10.99, ts: "20220101013811" },
          { date: "2023-01-04", price: 10.99, ts: "20230104121007" },
          { date: "2025-01-03", price: 10.99, ts: "20250103151242", note: "renamed Starter at the same price" },
        ],
      },
    ],
  },
  {
    tool: "Dropbox",
    site: "https://www.dropbox.com/plans",
    origin: "https://www.dropbox.com/plans",
    note: "Dropbox has one of the thinnest records here: the 2019 to 2022 captures hold no readable price, and the 2018 capture was crawled as a Chinese page, though it still prints the US dollar rate.",
    plans: [
      {
        name: "Plus",
        points: [
          { date: "2018-01-01", price: 8.25, ts: "20180101125249", note: "captured in Traditional Chinese, printing US$8.25" },
          { date: "2023-01-01", price: 9.99, ts: "20230101064653" },
          { date: "2024-01-08", price: 9.99, ts: "20240108071224" },
          { date: "2025-01-09", price: 9.99, ts: "20250109113708" },
          { date: "2026-01-02", price: 9.99, ts: "20260102124516" },
        ],
      },
    ],
  },
  {
    tool: "monday.com",
    site: "https://monday.com/pricing",
    origin: "https://monday.com/pricing",
    note: "Before 2021 monday.com sold a flat monthly price for a block of seats, not a per-seat price, so those captures are not on this line. The 2021, 2025 and 2026 captures were crawled from Europe and print euros.",
    plans: [
      {
        name: "Standard",
        points: [
          { date: "2022-01-05", price: 10, ts: "20220105221537" },
          { date: "2023-01-16", price: 10, ts: "20230116192812" },
          { date: "2024-01-27", price: 12, ts: "20240127185553" },
        ],
      },
    ],
  },
  {
    tool: "Webflow",
    site: "https://webflow.com/pricing",
    origin: "https://webflow.com/pricing",
    note: "The 2026 capture reorganised the table and its CMS figure could not be read with confidence, so it is left off rather than guessed.",
    plans: [
      {
        name: "CMS site plan",
        points: [
          { date: "2019-05-03", price: 16, ts: "20190503080647" },
          { date: "2020-01-13", price: 16, ts: "20200113143630" },
          { date: "2021-02-02", price: 16, ts: "20210202110936" },
          { date: "2022-01-24", price: 16, ts: "20220124135555" },
          { date: "2023-01-02", price: 23, ts: "20230102153028" },
          { date: "2024-01-19", price: 23, ts: "20240119062643" },
          { date: "2025-01-14", price: 23, ts: "20250114061908" },
        ],
      },
    ],
  },
  {
    tool: "Plausible",
    site: "https://plausible.io/#pricing",
    origin: "https://plausible.io/#pricing",
    plans: [
      {
        name: "10k pageviews a month",
        points: [
          { date: "2021-01-02", price: 6, ts: "20210102021916" },
          { date: "2022-01-01", price: 6, ts: "20220101001631" },
          { date: "2023-01-01", price: 9, ts: "20230101023546" },
          { date: "2026-01-01", price: 9, ts: "20260101065553" },
        ],
      },
    ],
  },
  {
    tool: "Canva",
    site: "https://www.canva.com/pricing/",
    origin: "https://www.canva.com/pricing/",
    note: "Only three captures were readable, so this is the shortest record on the wall.",
    plans: [
      {
        name: "Pro",
        points: [
          { date: "2020-02-25", price: 9.95, ts: "20200225174648" },
          { date: "2021-01-19", price: 9.95, ts: "20210119061258" },
          { date: "2022-01-02", price: 9.99, ts: "20220102185230" },
        ],
      },
    ],
  },
  {
    tool: "Intercom",
    site: "https://www.intercom.com/pricing",
    origin: "https://www.intercom.com/pricing",
    note: "Intercom only started pricing Essential per seat in 2024; before that it charged by active people reached, which is a different unit and is not plotted. Two points is what the archive honestly supports.",
    plans: [
      {
        name: "Essential",
        points: [
          { date: "2024-01-05", price: 39, ts: "20240105063228", note: "the first per-seat price" },
          { date: "2025-01-15", price: 29, ts: "20250115225154", note: "a 26% cut" },
        ],
      },
    ],
  },
  {
    tool: "Netflix",
    site: "https://help.netflix.com/en/node/24926",
    origin: "https://help.netflix.com/en/node/24926",
    note: "Netflix's plan-price page holds no readable price before 2022 or in 2026 — those captures render the table in the browser. What is here is the US list price exactly as the page printed it.",
    audience: "consumer",
    plans: [
      {
        name: "Standard",
        points: [
          { date: "2022-01-13", price: 13.99, ts: "20220113061514" },
          { date: "2023-01-02", price: 15.49, ts: "20230102112116", note: "the ad-free Standard tier rises to $15.49 and stays" },
          { date: "2024-01-01", price: 15.49, ts: "20240101174444" },
          { date: "2025-01-01", price: 15.49, ts: "20250101003755" },
        ],
      },
      {
        name: "Premium",
        points: [
          { date: "2022-01-13", price: 17.99, ts: "20220113061514" },
          { date: "2023-01-02", price: 19.99, ts: "20230102112116" },
          { date: "2024-01-01", price: 22.99, ts: "20240101174444", note: "a second rise in two years" },
          { date: "2025-01-01", price: 22.99, ts: "20250101003755" },
        ],
      },
      {
        name: "With ads",
        points: [
          { date: "2023-01-02", price: 6.99, ts: "20230102112116", note: "the ad-supported tier appears at $6.99" },
          { date: "2024-01-01", price: 6.99, ts: "20240101174444" },
          { date: "2025-01-01", price: 6.99, ts: "20250101003755" },
        ],
      },
    ],
  },
  {
    tool: "Spotify",
    site: "https://www.spotify.com/us/premium/",
    origin: "https://www.spotify.com/us/premium/",
    note: "The 2014 and 2015 captures hold no readable price.",
    audience: "consumer",
    plans: [
      {
        name: "Premium Individual",
        points: [
          { date: "2016-01-18", price: 9.99, ts: "20160118065844" },
          { date: "2017-01-26", price: 9.99, ts: "20170126091842" },
          { date: "2018-01-01", price: 9.99, ts: "20180101234333" },
          { date: "2019-02-05", price: 9.99, ts: "20190205035311" },
          { date: "2020-01-01", price: 9.99, ts: "20200101231318" },
          { date: "2021-01-01", price: 9.99, ts: "20210101091933" },
          { date: "2022-01-01", price: 9.99, ts: "20220101162340" },
          { date: "2023-01-01", price: 9.99, ts: "20230101025050" },
          { date: "2024-01-01", price: 10.99, ts: "20240101180833", note: "the first rise in eight years" },
          { date: "2025-01-01", price: 11.99, ts: "20250101014524", note: "and a second, twelve months later" },
          { date: "2026-01-02", price: 11.99, ts: "20260102055634" },
        ],
      },
      {
        name: "Premium Duo",
        points: [
          { date: "2025-01-01", price: 16.99, ts: "20250101014524" },
          { date: "2026-01-02", price: 16.99, ts: "20260102055634" },
        ],
      },
      {
        name: "Premium Family",
        points: [
          { date: "2020-01-01", price: 14.99, ts: "20200101231318" },
          { date: "2026-01-02", price: 19.99, ts: "20260102055634" },
        ],
      },
    ],
  },
  {
    tool: "Disney+",
    site: "https://www.disneyplus.com",
    origin: "https://www.disneyplus.com",
    note: "The 2019 and 2020 captures print only the three-service bundle price, not the standalone monthly, so Disney+ starts here in 2021 rather than at its 2019 launch.",
    audience: "consumer",
    plans: [
      {
        name: "Premium, no ads",
        points: [
          { date: "2021-01-01", price: 6.99, ts: "20210101013040", note: "the original launch price" },
          { date: "2022-01-01", price: 7.99, ts: "20220101005959" },
          { date: "2023-01-01", price: 10.99, ts: "20230101004344" },
          { date: "2024-01-01", price: 13.99, ts: "20240101010634" },
          { date: "2025-01-01", price: 15.99, ts: "20250101000308" },
          { date: "2026-01-01", price: 18.99, ts: "20260101005244", note: "the fifth rise in five years" },
        ],
      },
      {
        name: "Basic, with ads",
        points: [
          { date: "2023-01-01", price: 7.99, ts: "20230101004344", note: "the ad-supported tier appears" },
          { date: "2024-01-01", price: 7.99, ts: "20240101010634" },
          { date: "2025-01-01", price: 9.99, ts: "20250101000308" },
          { date: "2026-01-01", price: 11.99, ts: "20260101005244" },
        ],
      },
    ],
  },
  {
    tool: "Amazon Prime",
    site: "https://www.amazon.com/amazonprime",
    origin: "https://www.amazon.com/amazonprime",
    note: "The 2025 capture holds no readable price.",
    audience: "consumer",
    plans: [
      {
        name: "Prime monthly",
        points: [
          { date: "2018-06-16", price: 12.99, ts: "20180616050145" },
          { date: "2019-01-05", price: 12.99, ts: "20190105025307" },
          { date: "2020-01-07", price: 12.99, ts: "20200107104741" },
          { date: "2021-01-05", price: 12.99, ts: "20210105181333" },
          { date: "2022-01-01", price: 12.99, ts: "20220101013904" },
          { date: "2023-01-01", price: 14.99, ts: "20230101013726", note: "the first rise in the record, after five years at $12.99" },
          { date: "2024-01-01", price: 14.99, ts: "20240101030959" },
          { date: "2026-01-03", price: 14.99, ts: "20260103072517" },
        ],
      },
      {
        name: "Prime annual",
        points: [
          { date: "2022-01-01", price: 119, ts: "20220101013904" },
          { date: "2023-01-01", price: 139, ts: "20230101013726" },
          { date: "2024-01-01", price: 139, ts: "20240101030959" },
          { date: "2026-01-03", price: 139, ts: "20260103072517" },
        ],
      },
    ],
  },
  {
    tool: "Audible",
    site: "https://www.audible.com/ep/memberbenefits",
    origin: "https://www.audible.com/ep/memberbenefits",
    note: "The 2018 to 2020 captures hold no readable price, and the 2026 capture was crawled as a Spanish page — it still prints US dollars, but that is why its wording differs.",
    audience: "consumer",
    plans: [
      {
        name: "Premium Plus, 1 credit",
        points: [
          { date: "2021-01-01", price: 14.95, ts: "20210101013408" },
          { date: "2025-01-16", price: 14.95, ts: "20250116040606" },
          { date: "2026-01-01", price: 14.95, ts: "20260101023317" },
        ],
      },
      {
        name: "Premium Plus, 2 credits",
        points: [
          { date: "2022-01-25", price: 22.95, ts: "20220125151949" },
          { date: "2023-01-06", price: 22.95, ts: "20230106030824" },
          { date: "2024-01-10", price: 22.95, ts: "20240110091019" },
        ],
      },
    ],
  },
  {
    tool: "HBO Max",
    site: "https://www.hbomax.com",
    origin: "https://www.hbomax.com",
    note: "The 2020 capture holds no readable price, the 2023 capture prints only the ad-supported tier, and the 2025 capture says 'plans start at' without naming which plan — none of those are plotted rather than guessed.",
    audience: "consumer",
    plans: [
      {
        name: "Ad-free",
        points: [
          { date: "2021-01-01", price: 14.99, ts: "20210101020707" },
          { date: "2022-01-01", price: 14.99, ts: "20220101004941" },
          { date: "2024-02-07", price: 15.99, ts: "20240207092110" },
        ],
      },
      {
        name: "With ads",
        points: [
          { date: "2022-01-01", price: 9.99, ts: "20220101004941" },
          { date: "2023-01-01", price: 9.99, ts: "20230101022943" },
          { date: "2024-02-07", price: 9.99, ts: "20240207092110" },
        ],
      },
    ],
  },
  {
    tool: "Paramount+",
    site: "https://www.paramountplus.com",
    origin: "https://www.paramountplus.com",
    note: "The 2022 and 2023 captures hold no readable price.",
    audience: "consumer",
    plans: [
      {
        name: "Essential",
        points: [
          { date: "2024-01-01", price: 5.99, ts: "20240101030956" },
          { date: "2025-01-01", price: 7.99, ts: "20250101033927", note: "a third added in one year" },
        ],
      },
      {
        name: "With SHOWTIME",
        points: [
          { date: "2024-01-01", price: 11.99, ts: "20240101030956" },
          { date: "2025-01-01", price: 12.99, ts: "20250101033927" },
          { date: "2026-01-01", price: 12.99, ts: "20260101015432" },
        ],
      },
    ],
  },
];

/** Priced as a share of the transaction, so these cannot share a dollar axis
 *  with the seat plans. They get their own section rather than a distorted
 *  scale. */
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

/** Today, for "and counting" spans and for the right-hand edge of every rail.
 *  Set at build time, not request time — the page is static and a request-time
 *  date would opt it out of prerendering. */
export const AS_OF = "2026-09-07";
