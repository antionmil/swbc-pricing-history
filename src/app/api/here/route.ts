import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { hasDb, sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * How many people are reading this right now, this week, and ever.
 *
 * One heartbeat in, one honest count out. The visitor is identified by a
 * salted one-way hash of their IP address: no cookie, nothing written to their
 * browser, and no way back from the hash to the address. The presence row is
 * deleted after five minutes, so the table can say how many people are here
 * and can never say who.
 *
 * Keyed on the address rather than a number the browser invents, because a
 * number the browser invents can be invented a thousand times, and this figure
 * is shown to every visitor. A fabricated metric is a fabricated metric
 * whether the site made it up or a stranger did.
 */
export async function POST(req: NextRequest) {
  const dead = { headers: { "cache-control": "no-store" } };
  if (!hasDb()) return NextResponse.json({ here: 0, week: 0, ever: 0 }, dead);

  /* x-vercel-forwarded-for first, then x-real-ip, then x-forwarded-for.
   * All three carry the client address on Vercel. The order is about who can
   * write them: x-forwarded-for is the one a proxy placed on top of Vercel
   * could still rewrite, and x-vercel-forwarded-for is documented as the one
   * that survives that. It matters because this number is shown to everybody. */
  const ip =
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.split(",")[0]?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  /* The salt is the deploy's own secret, so these hashes cannot be compared
     with any other site's, and a rainbow table of IPv4 is useless. */
  const salt = process.env.CRON_SECRET ?? "pricing-history";
  const id = createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);

  try {
    await sql()`
      insert into presence (id, seen_at) values (${id}, now())
      on conflict (id) do update set seen_at = now()
    `;
    /* Swept on write rather than by a cron: one cheap delete on an indexed
       column, and the table cannot grow if a cron is ever disabled. */
    await sql()`delete from presence where seen_at < now() - interval '5 minutes'`;

    /* One row per visitor per day. If the insert returns a row, this person is
       new today and the day's total goes up by one. The hash rows are swept
       after 8 days; the daily total is a bare integer with nobody in it, so it
       can be kept for good. */
    const fresh = (await sql()`
      insert into visit_days (day, id) values (current_date, ${id})
      on conflict do nothing returning id
    `) as unknown as { id: string }[];
    if (fresh.length) {
      await sql()`
        insert into visit_totals (day, n) values (current_date, 1)
        on conflict (day) do update set n = visit_totals.n + 1
      `;
      await sql()`delete from visit_days where day < current_date - 8`;
    }

    const [row] = (await sql()`
      select
        (select count(*)::int from presence where seen_at > now() - interval '45 seconds') as here,
        (select coalesce(sum(n), 0)::int from visit_totals where day > current_date - 7) as week,
        (select coalesce(sum(n), 0)::int from visit_totals) as ever
    `) as unknown as { here: number; week: number; ever: number }[];

    return NextResponse.json(
      { here: row?.here ?? 1, week: row?.week ?? 0, ever: row?.ever ?? 0 },
      dead,
    );
  } catch (e) {
    console.error("[here]", e);
    /* Never guess. A count we could not read is not a count we may invent. */
    return NextResponse.json({ here: 0, week: 0, ever: 0 }, dead);
  }
}
