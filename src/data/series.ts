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
  {
    tool: "GitHub",
    plan: "Team · per user",
    site: "https://github.com/pricing",
    origin: "https://github.com/pricing",
    kind: "seat",
    note: "GitHub cut Team from $9 to $4 in April 2020. The January 2020 capture still shows $9; the next yearly capture shows $4.",
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
    tool: "GitLab",
    plan: "Premium · per user",
    site: "https://about.gitlab.com/pricing/",
    origin: "https://about.gitlab.com/pricing/",
    kind: "seat",
    note: "The 2019 and 2020 captures hold no readable price, and 2025 shows only a promotional rate for new small-business customers, so neither is plotted.",
    points: [
      { date: "2018-03-15", price: 19, ts: "20180315063137", note: "the plan was called Starter at $4; Premium was the tier above it" },
      { date: "2021-01-04", price: 19, ts: "20210104233342" },
      { date: "2022-01-05", price: 19, ts: "20220105063600" },
      { date: "2023-01-01", price: 19, ts: "20230101195405" },
      { date: "2024-01-01", price: 29, ts: "20240101013048", note: "a 53% rise after six years at $19" },
    ],
  },
  {
    tool: "Slack",
    plan: "Standard, later Pro · per active user",
    site: "https://slack.com/pricing",
    origin: "https://slack.com/pricing",
    kind: "seat",
    note: "Slack's pricing page was rendered in the browser from 2021 to 2025, so those captures hold no readable price. The plan was renamed Pro during that gap.",
    points: [
      { date: "2015-01-02", price: 6.67, ts: "20150102160343" },
      { date: "2016-01-04", price: 6.67, ts: "20160104150412" },
      { date: "2017-01-06", price: 6.67, ts: "20170106145039" },
      { date: "2018-01-26", price: 6.67, ts: "20180126142616" },
      { date: "2020-02-10", price: 6.67, ts: "20200210000230" },
      { date: "2026-01-14", price: 7.25, ts: "20260114054034", note: "the plan is now called Pro" },
    ],
  },
  {
    tool: "Zoom",
    plan: "Pro · per host",
    site: "https://zoom.us/pricing",
    origin: "https://zoom.us/pricing",
    kind: "seat",
    note: "Every capture from 2022 on is a JavaScript shell with no readable price, so Zoom's record stops in 2020.",
    points: [
      { date: "2017-01-03", price: 14.99, ts: "20170103030713" },
      { date: "2018-01-30", price: 14.99, ts: "20180130132526" },
      { date: "2019-01-29", price: 14.99, ts: "20190129175726" },
      { date: "2020-01-08", price: 14.99, ts: "20200108063146" },
    ],
  },
  {
    tool: "Asana",
    plan: "Premium, later Starter · per user",
    site: "https://asana.com/pricing",
    origin: "https://asana.com/pricing",
    kind: "seat",
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
  {
    tool: "Airtable",
    plan: "Plus, later Team · per user",
    site: "https://airtable.com/pricing",
    origin: "https://airtable.com/pricing",
    kind: "seat",
    points: [
      { date: "2019-01-28", price: 10, ts: "20190128160603" },
      { date: "2020-01-28", price: 10, ts: "20200128193852" },
      { date: "2021-01-04", price: 10, ts: "20210104174733" },
      { date: "2022-01-01", price: 10, ts: "20220101041824" },
      { date: "2023-01-05", price: 10, ts: "20230105043256" },
      { date: "2024-01-05", price: 20, ts: "20240105005508", note: "Plus was retired and Team took its place in the lineup at twice the price" },
      { date: "2025-01-01", price: 20, ts: "20250101005710" },
      { date: "2026-01-01", price: 20, ts: "20260101095326" },
    ],
  },
  {
    tool: "ClickUp",
    plan: "Unlimited · per member",
    site: "https://clickup.com/pricing",
    origin: "https://clickup.com/pricing",
    kind: "seat",
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
    tool: "Dropbox",
    plan: "Plus · one user",
    site: "https://www.dropbox.com/plans",
    origin: "https://www.dropbox.com/plans",
    kind: "seat",
    note: "Dropbox has the thinnest record here: the 2019 to 2022 captures hold no readable price, and the 2018 capture was crawled in Chinese, though it still prints the US dollar rate.",
    points: [
      { date: "2018-01-01", price: 8.25, ts: "20180101125249", note: "captured as a Traditional Chinese page, printing US$8.25" },
      { date: "2023-01-01", price: 9.99, ts: "20230101064653" },
      { date: "2024-01-08", price: 9.99, ts: "20240108071224" },
      { date: "2025-01-09", price: 9.99, ts: "20250109113708" },
      { date: "2026-01-02", price: 9.99, ts: "20260102124516" },
    ],
  },
  {
    tool: "monday.com",
    plan: "Standard · per seat",
    site: "https://monday.com/pricing",
    origin: "https://monday.com/pricing",
    kind: "seat",
    note: "Before 2021 monday.com sold a flat monthly price for a block of seats, not a per-seat price, so those captures are not on this line. The 2021, 2025 and 2026 captures were crawled from Europe and print euros.",
    points: [
      { date: "2022-01-05", price: 10, ts: "20220105221537" },
      { date: "2023-01-16", price: 10, ts: "20230116192812" },
      { date: "2024-01-27", price: 12, ts: "20240127185553" },
    ],
  },
  {
    tool: "Sentry",
    plan: "Team",
    site: "https://sentry.io/pricing/",
    origin: "https://sentry.io/pricing/",
    kind: "seat",
    note: "The 2021 to 2024 captures hold no readable price. The 2019, 2020, 2025 and 2026 captures all print the same figure.",
    points: [
      { date: "2019-01-04", price: 26, ts: "20190104094758" },
      { date: "2020-01-11", price: 26, ts: "20200111215057" },
      { date: "2025-01-02", price: 26, ts: "20250102071408" },
      { date: "2026-01-06", price: 26, ts: "20260106011552" },
    ],
  },
  {
    tool: "Netlify",
    plan: "Pro · per member",
    site: "https://www.netlify.com/pricing/",
    origin: "https://www.netlify.com/pricing/",
    kind: "seat",
    note: "Before 2021 Netlify sold Pro as a flat $45 a month for a team of five, not per member, so those captures are not on this line.",
    points: [
      { date: "2021-01-27", price: 19, ts: "20210127175505" },
      { date: "2022-01-02", price: 19, ts: "20220102005823" },
      { date: "2023-01-08", price: 19, ts: "20230108032422" },
      { date: "2025-01-06", price: 19, ts: "20250106093557" },
      { date: "2026-01-01", price: 20, ts: "20260101174810" },
    ],
  },
  {
    tool: "Webflow",
    plan: "CMS site plan",
    site: "https://webflow.com/pricing",
    origin: "https://webflow.com/pricing",
    kind: "seat",
    note: "The 2026 capture reorganised the table and its CMS figure could not be read with confidence, so it is left off rather than guessed.",
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
  {
    tool: "Plausible",
    plan: "10k pageviews a month",
    site: "https://plausible.io/#pricing",
    origin: "https://plausible.io/#pricing",
    kind: "seat",
    points: [
      { date: "2021-01-02", price: 6, ts: "20210102021916" },
      { date: "2022-01-01", price: 6, ts: "20220101001631" },
      { date: "2023-01-01", price: 9, ts: "20230101023546" },
      { date: "2026-01-01", price: 9, ts: "20260101065553" },
    ],
  },
  {
    tool: "Canva",
    plan: "Pro · per user",
    site: "https://www.canva.com/pricing/",
    origin: "https://www.canva.com/pricing/",
    kind: "seat",
    note: "Only three captures were readable, so this is the shortest record on the wall.",
    points: [
      { date: "2020-02-25", price: 9.95, ts: "20200225174648" },
      { date: "2021-01-19", price: 9.95, ts: "20210119061258" },
      { date: "2022-01-02", price: 9.99, ts: "20220102185230" },
    ],
  },
  {
    tool: "Intercom",
    plan: "Essential · per seat",
    site: "https://www.intercom.com/pricing",
    origin: "https://www.intercom.com/pricing",
    kind: "seat",
    note: "The thinnest line on the wall, and deliberately so. Intercom only started pricing Essential per seat in 2024; before that it charged by active people reached, which is a different unit and is not plotted here. Two points is what the archive honestly supports.",
    points: [
      { date: "2024-01-05", price: 39, ts: "20240105063228", note: "the first per-seat price for Essential" },
      { date: "2025-01-15", price: 29, ts: "20250115225154", note: "a 26% cut" },
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
