# What software used to cost

A museum of software prices. Every price Figma, Vercel, Linear, Notion and
Stripe ever published, read off the Internet Archive and hung on the line that
price drew.

Live at **pricinghistory.onedaybuilt.com**. Day 6 of
[onedaybuilt.com](https://onedaybuilt.com) — one website a day, built in public.

## What it does

Each tool is one exhibit. The wire's height is the price, so a long flat wire is
a price that held and a step is the day it moved. The value is printed above the
wire; a price tag hangs below it. Every tag links to the exact archived page the
number was read from.

Exhibits are ordered by **how good the record is** — a score over how many
years the archive caught, how densely, how recently, and whether the price ever
moved. The strongest evidence leads; the thinnest records sit at the bottom and
say so on the page.

Each rail opens on **today** at its right-hand edge and scrolls left into the
past, so the first thing you see is what the tool charges now.

## Architecture

**No LLM and no cron.** The corpus is 125 numbers and ships in the bundle as a
TypeScript module, so the wall is one static file with no request-time work and
no cold start.

There is exactly one database, and it does not touch the wall: a visitor counter
behind `/api/here`, in its own Neon project (`pricing-history`, eu-central-1,
paired with `fra1` functions). It stores a salted one-way hash of the visitor's
IP, deletes the hash after five minutes, and keeps only a bare daily integer. It
can say how many people are here; it cannot say who. If it is slow or missing,
the page renders exactly the same and the counter simply does not appear —
nothing is ever guessed.

```
src/data/series.ts     the corpus — every point, with its Wayback timestamp
src/lib/wall.ts        the maths: x/y scales, hold spans, sort order
src/components/Exhibit.tsx   one tool: wire, value chips, hanging tags
src/app/page.tsx       the wall, plus the percentage-priced section
src/app/api/og/route.tsx     the share image
src/app/api/here/route.ts    the visitor counter
src/components/Here.tsx      the activity row
schema.sql                   the three counter tables
../prep/               how the data was gathered (see below)
../prep/prices.json    the full 222-row table, all plans, not just the headline
```

`/` prerenders (`○` in the build output). The two `ƒ` routes are `/api/og` and
`/api/here`, which is what an image route and a counter should be.

## How the data was gathered

1. Wayback CDX index for each vendor's pricing page, one capture per half-year.
2. Fetch each capture, strip the HTML to plain text, strip the archive's own
   banner.
3. Read the prices out of the text by hand and check each against its snapshot.

Step 3 is not automatable and that is the point. Four traps this run hit, each
of which would have put a wrong number on the page:

- **Notion 2017–2020 does not exist.** The pricing page was rendered in the
  browser, so all 38 candidate captures are ~3 KB empty shells.
- **Notion 2025 is in euros.** Every 2025 capture was crawled from Europe.
  Plotted as dollars it would have drawn a fake price cut.
- **Stripe's 2019 capture is also European** — `2.7% + 5¢`, not the US rate.
- **Figma's oldest page has no price at all.** It reads "Figma is free during
  the Preview Release." An extractor returns nothing; a museum records `$0`.

Vercel's history is twice as long as it first appeared: before April 2020 the
company was **ZEIT**, and `zeit.co/pricing` adds seven more periods back to 2017.

## Not claimed

Nothing is estimated and nothing is interpolated. Where the archive holds no
readable capture, there is no point and the wire spans the gap. Prices are the
published list price for one seat per month in US dollars, exactly as the page
stated it; where a page showed both, the annual per-month rate is used.

## Local

```bash
pnpm install
pnpm dev
pnpm build   # read the route table; / must be ○, not ƒ
```

`DATABASE_URL` enables the visitor counter; without it the page renders
identically and the counter is hidden. `CRON_SECRET` salts the visitor hash.
The sponsor slot is optional — see `.env.example`.
