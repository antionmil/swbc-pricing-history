import { Exhibit } from "@/components/Exhibit";
import { SponsorSlot } from "@/components/SponsorSlot";
import { PERCENT } from "@/data/series";
import { sorted, classify, span, lastRise } from "@/lib/wall";

/* Fully static. Every number ships in the bundle, so there is no database, no
   cold start and no request-time work. `revalidate` with no dynamic segment
   and no uncached fetch means this prerenders — read the mode column in the
   build output and confirm it is ○, not ƒ. */
export const revalidate = 86400;

export default function Page() {
  const tools = sorted();

  const rises = tools.flatMap((s) => {
    const m = classify(s.points);
    return s.points.map((p, i) => ({ s, p, m: m[i] })).filter((r) => r.m === "rise");
  });
  const cuts = tools.flatMap((s) => {
    const m = classify(s.points);
    return s.points.map((p, i) => ({ s, p, m: m[i] })).filter((r) => r.m === "cut");
  });
  const never = tools.filter((s) => lastRise(s) === null);
  // every point on this page IS one archived page, and each one is linked.
  // Do not quote the wider corpus here — the tile must count what is on screen.
  const linked =
    tools.reduce((n, s) => n + s.points.length, 0) +
    PERCENT.reduce((n, s) => n + s.points.length, 0);
  const toolCount = tools.length + PERCENT.length;

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-24 pt-11">
      <header className="border-b-2 border-ink pb-5">
        <p className="font-mono text-[11px] uppercase tracking-[.18em] text-muted">
          onedaybuilt · day 06
        </p>
        <h1 className="mt-3 font-display text-[clamp(38px,7.5vw,84px)] font-black leading-[.9] tracking-[-.025em] text-balance">
          What software
          <br />
          used to cost
        </h1>
        <p className="mt-4 max-w-[60ch] text-[15.5px] text-muted">
          Every price these tools ever published, hung in order from the line that price
          drew. A long flat wire is a price that <b className="font-semibold text-ink">held</b>.
          A step is the day it moved. Read straight off the archived pages at{" "}
          <b className="font-semibold text-ink">web.archive.org</b> — every tag opens the
          page it came from.
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
          {[
            { k: "tools", v: String(toolCount) },
            { k: "archived pages linked", v: String(linked) },
            { k: "price rises found", v: String(rises.length) },
            { k: "price cuts found", v: String(cuts.length) },
          ].map(({ k, v }) => (
            <div key={k}>
              <dd className="font-display text-4xl font-black leading-none tabular-nums">{v}</dd>
              <dt className="mt-1.5 font-mono text-[10px] uppercase tracking-[.13em] text-muted">
                {k}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex flex-wrap gap-5 font-mono text-[11px] tracking-[.03em] text-muted">
          <span>
            <i className="mr-1.5 inline-block h-[11px] w-[11px] rounded-[2px] bg-rise align-[-1px]" />
            price rose
          </span>
          <span>
            <i className="mr-1.5 inline-block h-[11px] w-[11px] rounded-[2px] bg-cut align-[-1px]" />
            price fell
          </span>
          <span>
            <i className="mr-1.5 inline-block h-[11px] w-[11px] rounded-[2px] border border-rule bg-board align-[-1px]" />
            unchanged
          </span>
          <span>
            <i className="mr-1.5 inline-block h-[11px] w-[11px] rounded-[2px] bg-ink align-[-1px]" />
            first published price
          </span>
        </div>
      </header>

      <p className="mt-7 border-l-[3px] border-accent bg-board px-4 py-3 text-[13.5px] text-muted">
        Each rail opens on <b className="font-semibold text-ink">today</b> — scroll it left
        to go back in time. Ordered by{" "}
        <b className="font-semibold text-ink">how long since the price last rose</b>, longest
        first.{" "}
        {never.length > 0 && (
          <>
            {never.length === 1
              ? never[0].tool
              : `${never.slice(0, -1).map((s) => s.tool).join(", ")} and ${never[never.length - 1].tool}`}{" "}
            show no rise anywhere in their readable record, so{" "}
            {never.length === 1 ? "it sits" : "they sit"} at the top.
          </>
        )}
      </p>

      {tools.map((s, i) => (
        <Exhibit key={s.tool} s={s} rank={i + 1} />
      ))}

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
