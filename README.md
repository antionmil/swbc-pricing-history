# What software used to cost

A museum of software prices. Every price 27 tools ever published — the ones you
expense at work and the ones you pay for yourself — read off the Internet
Archive and hung on the line that price drew.

Live at **pricinghistory.onedaybuilt.com**. Day 6 of
[onedaybuilt.com](https://onedaybuilt.com) — one website a day, built in public.

## What it does

Each tool is one exhibit, with **one line per plan**. The wire's height is the
price, so a long flat wire is a price that held and a step is the day it moved.
The value is printed above the wire. Below it, a run of identical prices
collapses into a SINGLE box — ten boxes each reading "$12 held" is ten times the
ink for one fact — and a dashed line drops from every capture in the run to
converge on that one box. The box says the price, the span, and how many
archived captures stand behind it, and it opens the first of them.

A run breaks on the same gap rule the hold claim uses: captures either side of a
five-year hole are not one continuous run, because nobody can see what the price
did in between.

A plan keeps one line across a rename where it is plainly the same slot in the
lineup — Linear's Standard became Basic, Notion's Team became Plus. It does not
keep one line across a plan that merely shares a word: ZEIT sold a $15 "Premium"
tier that is not the ancestor of today's Vercel Pro, and folding it in reported
Pro as $15 in 2017 when the page said $50.

The wall filters into **tools you expense** (19) and **subscriptions you pay for
yourself** (7) — Netflix, Spotify, Disney+, Amazon Prime, Audible, HBO Max and
Paramount+. Disney+ carries the steepest rise in the whole corpus: $6.99 to
$18.99 in five years, +172%.

Exhibits can be ordered three ways, and two of them flip when you click the
active one again:

- **Best record** (default) — a score over how many years the archive caught,
  how densely, how recently, how many plans, and whether the price ever moved.
  It has no direction: nobody opens a page like this wanting the thinnest
  evidence first.
- **Entry price** — the newest price on each tool's cheapest paid plan, high or
  low. GitLab and Intercom lead at $29; GitHub is $4.
- **Change since first price** — first paid price to newest, biggest rise or
  biggest cut. Airtable +100%, GitLab +53% one way; Vercel −60%, GitHub −56%
  the other. Measured off the first PAID price, not off a free tier, or every
  tool that ever had one would read as an infinite increase.

Each rail opens on **today** at its right-hand edge and scrolls left into the
past, so the first thing you see is what the tool charges now.

A rail spans **only its own record**. Every rail used to start at 2016 whatever
the tool, so Notion — whose first readable capture is April 2021 — opened on
five blank years with ticks and gridlines and nothing on them, which reads as
missing data rather than as a record that starts later. The right edge stays
today for every tool; only the left edge moves, and the rail is sized to the
years it actually covers (520px to 1720px).

## Architecture

**No LLM and no cron.** The corpus is 341 numbers across 51 plan lines and ships in the bundle as a
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
src/components/Exhibit.tsx   one tool: plan tabs, wire, value chips, tags
src/components/Hero.tsx      the opener, which draws the page's own idea
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
