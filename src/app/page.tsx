import { Wall } from "@/components/Wall";
import { Hero } from "@/components/Hero";
import { Here } from "@/components/Here";
import { SponsorSlot } from "@/components/SponsorSlot";
import { PERCENT, SEAT } from "@/data/series";
import { allMoves, totalPoints } from "@/lib/wall";

/* The page itself is static: every price ships in the bundle, so there is no
   cold start and no request-time work on the thing people came to read.
   `revalidate` with no dynamic segment and no uncached fetch means this
   prerenders — read the mode column in the build output and confirm / is ○.
   The only database is the visitor counter, and it lives behind /api/here so a
   slow or missing database can never delay or break the wall. */
export const revalidate = 86400;

export default function Page() {
  const { rises, cuts } = allMoves();
  // every point on this page IS one archived page, and each one is linked.
  // Do not quote the wider corpus here — the tile must count what is on screen.
  const linked = totalPoints() + PERCENT.reduce((n, s) => n + s.points.length, 0);
  const toolCount = SEAT.length + PERCENT.length;

  return (
    <main className="mx-auto max-w-[840px] px-5 pb-24 pt-11 sm:px-6">
      <Hero tools={toolCount} points={linked} rises={rises} cuts={cuts} />

      <Here />

      <Wall />

      {PERCENT.length > 0 && (
        <section className="mt-16 border-t-2 border-ink pt-7">
          <h2 className="font-display text-3xl font-black leading-none tracking-tight">
            Priced as a percentage
          </h2>
          <p className="mt-3 max-w-[70ch] text-sm text-muted">
            These take a share of the transaction rather than a fee per seat. They cannot
            share a dollar axis with the plans above without distorting it, so they are
            listed as the pages printed them.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-rule text-left font-mono text-[10px] uppercase tracking-[.13em] text-muted">
                  <th className="pb-2 pr-4 font-normal">Tool</th>
                  <th className="pb-2 pr-4 font-normal">Captured</th>
                  <th className="pb-2 pr-4 font-normal">Rate as printed</th>
                  <th className="pb-2 font-normal">Source</th>
                </tr>
              </thead>
              <tbody>
                {PERCENT.flatMap((s) =>
                  s.points.map((p) => (
                    <tr key={`${s.tool}-${p.date}`} className="border-b border-rule">
                      <td className="py-2.5 pr-4 font-semibold">{s.tool}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs tabular-nums text-muted">
                        {p.date}
                      </td>
                      <td className="py-2.5 pr-4 font-mono tabular-nums">{p.rate}</td>
                      <td className="py-2.5">
                        <a
                          className="font-mono text-xs text-accent underline underline-offset-2"
                          href={`https://web.archive.org/web/${p.ts}/${s.origin}`}
                          target="_blank"
                          rel="noopener"
                        >
                          snapshot
                        </a>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="mt-16 border-t-2 border-ink pt-6">
        <div className="max-w-[70ch] text-[13px] leading-relaxed text-muted">
          <p>
            Prices are the published list price for one seat per month, in US dollars,
            exactly as the archived page stated it. Where a page showed a monthly and an
            annual rate, the annual per-month rate is used. Nothing is estimated and
            nothing is interpolated — where the archive holds no readable capture, there
            is no point and the line simply spans the gap. The wider working set behind
            this page is 57 archived pages and 222 plan rows; what is plotted here is the
            headline plan for each tool.
          </p>
          <p className="mt-3">
            Sources are Internet Archive captures of each vendor&rsquo;s own pricing page.
            Every tag links to the exact snapshot it was read from, so any number here can
            be checked in one click. Found one wrong?{" "}
            <a
              className="text-accent underline underline-offset-2"
              href="https://github.com/antionmil"
            >
              Tell me and I will fix it
            </a>
            .
          </p>
        </div>
        <div className="mt-6 max-w-md">
          <SponsorSlot />
        </div>
        <p className="mt-6 font-mono text-[11px] tracking-[.03em] text-muted">
          <a className="underline underline-offset-2" href="https://onedaybuilt.com">
            onedaybuilt.com
          </a>{" "}
          · one website a day, built in public
        </p>
      </footer>
    </main>
  );
}
