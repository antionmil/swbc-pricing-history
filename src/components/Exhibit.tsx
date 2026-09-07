"use client";

import { useState } from "react";
import { type Series, type Plan } from "@/data/series";
import {
  fx,
  snapshotUrl,
  span,
  classify,
  pct,
  longestHold,
  lastRise,
  tickYears,
  planIsStale,
  planHorizon,
  planEnds,
  headline,
  runs,
} from "@/lib/wall";

/* Geometry, in px inside the rail. The wire lives in a band at the top; the
   tags hang below it on up to three rows so neighbouring captures never
   collide. Yearly captures on a 1680px rail sit ~150px apart, which clears a
   tag, but the half-yearly ones on the four deep tools do not — hence rows. */
const TOP = 52;
const BOT = 150;
const TAGY = 186;
const ROWH = 96;
const GAP = 12.6; // percent of width; below this two tags would overlap

function Rail({ s, plan }: { s: Series; plan: Plan }) {
  const pts = plan.points;
  const moves = classify(pts);
  const nums = pts.map((p) => p.price);
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const pad = hi > lo ? (hi - lo) * 0.3 : Math.max(2, hi * 0.3);
  const ylo = Math.max(0, lo - pad);
  const yhi = hi + pad;
  const fy = (v: number) =>
    yhi === ylo ? (TOP + BOT) / 2 : BOT - ((v - ylo) / (yhi - ylo)) * (BOT - TOP);

  /* One box per RUN of identical prices, not one per capture. Ten identical
     "$12 held" boxes across five years is ten times the ink for one fact; the
     drop lines still show every capture that stands behind the box. */
  const rs = runs(pts);
  const runX = rs.map((r) => {
    const a = fx(r.points[0].date);
    const b = fx(r.points[r.points.length - 1].date);
    return (a + b) / 2;
  });
  const last = [-99, -99, -99];
  const rows = runX.map((x) => {
    const r = [0, 1, 2].find((k) => x - last[k] >= GAP) ?? 0;
    last[r] = x;
    return r;
  });
  const rowOfPoint = new Map<string, number>();
  rs.forEach((r, i) => r.points.forEach((pt) => rowOfPoint.set(pt.date, rows[i])));
  const xOfRun = new Map<string, number>();
  rs.forEach((r, i) => r.points.forEach((pt) => xOfRun.set(pt.date, runX[i])));
  const H = TAGY + (Math.max(...rows) + 1) * ROWH + 8;

  let d = `M ${fx(pts[0].date).toFixed(2)} ${fy(pts[0].price).toFixed(2)}`;
  for (let k = 1; k < pts.length; k++) {
    d += ` L ${fx(pts[k].date).toFixed(2)} ${fy(pts[k - 1].price).toFixed(2)}`;
    d += ` L ${fx(pts[k].date).toFixed(2)} ${fy(pts[k].price).toFixed(2)}`;
  }

  const stale = planIsStale(plan);
  const endsIn = planEnds(plan).slice(0, 4);
  const clamp = (x: number): React.CSSProperties =>
    x < 5.5 ? { left: 0 } : x > 94.5 ? { right: 0 } : { left: `${x}%`, transform: "translateX(-50%)" };
  const clampSm = (x: number): React.CSSProperties =>
    x < 3.2 ? { left: 0 } : x > 96.8 ? { right: 0 } : { left: `${x}%`, transform: "translateX(-50%)" };

  return (
    <div
      dir="rtl"
      className="overflow-x-auto rounded-md border border-rule bg-board pt-5 [scrollbar-width:thin]"
    >
      <div dir="ltr" className="relative mx-6 w-[1680px]" style={{ height: H }}>
        {[...new Set([lo, hi])].map((v) => (
          <div key={v}>
            <div
              className="absolute inset-x-0 border-t border-dashed border-rule"
              style={{ top: fy(v) }}
            />
            <span
              className="absolute left-0 bg-board pr-2 font-mono text-[10px] text-muted"
              style={{ top: fy(v), transform: "translateY(-50%)" }}
            >
              ${v}
            </span>
          </div>
        ))}

        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 100 ${H}`}
          aria-hidden="true"
        >
          <path
            d={d}
            fill="none"
            stroke="var(--color-wire)"
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {pts.map((p) => {
            const row = rowOfPoint.get(p.date)!;
            const yEnd = TAGY + row * ROWH - 2;
            const xEnd = xOfRun.get(p.date)!;
            /* straight down out of the node, then angled in to the shared box,
               so several captures visibly converge on one price */
            const bend = yEnd - 16;
            return (
              <polyline
                key={p.date}
                points={`${fx(p.date).toFixed(2)},${fy(p.price)} ${fx(p.date).toFixed(2)},${bend} ${xEnd.toFixed(2)},${yEnd}`}
                fill="none"
                stroke="var(--color-wire)"
                strokeWidth="1"
                strokeDasharray="2 3"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* nodes and the value printed above the line — drawn in HTML because
            the SVG x-axis is stretched and would turn every circle into an
            ellipse */}
        {pts.map((p, i) => {
          const y = fy(p.price);
          const m = moves[i];
          const cls =
            m === "rise"
              ? "bg-rise text-rise-ink font-semibold"
              : m === "cut"
                ? "bg-cut text-cut-ink font-semibold"
                : m === "first" || m === "free"
                  ? "bg-ink text-ground font-semibold"
                  : "text-muted";
          return (
            <span key={p.date}>
              <span
                className="pointer-events-none absolute h-[9px] w-[9px] rounded-full border-2 border-wire bg-board"
                style={{ left: `${fx(p.date)}%`, top: y, transform: "translate(-50%,-50%)" }}
              />
              <span
                className={`pointer-events-none absolute whitespace-nowrap rounded-[2px] px-1.5 py-px font-mono text-xs tabular-nums ${cls}`}
                style={{ ...clampSm(fx(p.date)), top: y - 24 }}
              >
                {p.price === 0 ? "free" : `$${p.price}`}
              </span>
            </span>
          );
        })}

        {/* one box per run of identical prices, not one per capture */}
        {rs.map((r, i) => {
          const first = r.points[0];
          const lastPt = r.points[r.points.length - 1];
          const many = r.points.length > 1;
          const m = r.move;
          const skin =
            m === "rise"
              ? "bg-rise text-rise-ink shadow-[0_2px_0_rgba(23,22,26,.14)]"
              : m === "cut"
                ? "bg-cut text-cut-ink shadow-[0_2px_0_rgba(23,22,26,.14)]"
                : m === "first" || m === "free"
                  ? "bg-ink text-ground shadow-[0_2px_0_rgba(23,22,26,.14)]"
                  : "border border-rule bg-board text-ink";
          const delta =
            m === "free"
              ? "free"
              : m === "first"
                ? "first price"
                : m === "hold"
                  ? "held"
                  : pct(r.prev!, r.price);
          const mon = (d: string) =>
            `${new Date(d).toLocaleString("en", { month: "short", timeZone: "UTC" }).toUpperCase()} ${d.slice(0, 4)}`;
          const when = many ? `${mon(first.date)} — ${mon(lastPt.date)}` : mon(first.date);
          return (
            <a
              key={first.date}
              href={snapshotUrl(s, first.ts)}
              target="_blank"
              rel="noopener"
              title={
                many
                  ? `${r.points.length} archived captures at this price, ${first.date} to ${lastPt.date}. Opens the first.`
                  : (first.note ?? `archived ${first.date}`)
              }
              className={`absolute block rounded-sm px-2.5 pb-2 pt-2.5 no-underline transition-transform hover:-translate-y-[3px] focus-visible:-translate-y-[3px] ${many ? "w-[168px]" : "w-[112px]"} ${skin}`}
              style={{ ...clamp(runX[i]), top: TAGY + rows[i] * ROWH }}
            >
              <span className="absolute right-2 top-[7px] h-[7px] w-[7px] rounded-full bg-current opacity-30" />
              <span className="block font-mono text-[9.5px] uppercase tracking-[.11em] opacity-75">
                {when}
              </span>
              <span className="block font-display text-[29px] font-black leading-none tabular-nums">
                {r.price === 0 ? "$0" : `$${r.price}`}
              </span>
              <span className="mt-0.5 flex items-baseline gap-1.5 font-mono text-[9.5px] font-semibold tracking-[.04em]">
                <span>{delta}</span>
                {many && (
                  <span className="font-normal opacity-70">
                    · {r.points.length} captures · {span(first.date, lastPt.date)}
                  </span>
                )}
              </span>
            </a>
          );
        })}

        {stale && (
          <>
            <div
              className="pointer-events-none absolute top-0 bottom-5 bg-ground/70"
              style={{ left: `${fx(planEnds(plan))}%`, right: 0 }}
              aria-hidden="true"
            />
            <span
              className="absolute font-mono text-[9px] uppercase tracking-[.12em] text-muted"
              style={{ left: `${fx(planEnds(plan))}%`, top: 22, marginLeft: 6 }}
            >
              no readable capture after {endsIn}
            </span>
          </>
        )}

        <div className="absolute bottom-5 right-0 top-0 border-l-2 border-accent" aria-hidden="true" />
        <span
          className="absolute right-0 font-mono text-[9px] uppercase tracking-[.14em] text-accent"
          style={{ top: 4, marginRight: 4 }}
        >
          {stale ? "today" : "today · price live now"}
        </span>

        <div className="absolute inset-x-0 bottom-0 h-5">
          {tickYears().map((y) => (
            <span
              key={y}
              className="absolute font-mono text-[10px] tabular-nums text-muted"
              style={{ left: `${fx(`${y}-01-01`)}%`, transform: "translateX(-50%)" }}
            >
              {y}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Exhibit({ s, rank }: { s: Series; rank: number }) {
  const lead = headline(s);
  const [active, setActive] = useState(Math.max(0, s.plans.indexOf(lead)));
  const plan = s.plans[active] ?? lead;

  const hold = longestHold(plan);
  const raised = lastRise(plan);
  const stale = planIsStale(plan);
  const upTo = planHorizon(plan);
  const endsIn = planEnds(plan).slice(0, 4);
  const free = plan.points.every((p) => p.price === 0);
  const notes = plan.points.filter((p) => p.note);

  return (
    <section className="mt-14 border-t border-rule pt-7">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs tabular-nums text-muted">
            {String(rank).padStart(2, "0")}
          </span>
          <h2 className="font-display text-3xl font-black leading-none tracking-tight">{s.tool}</h2>
        </div>
        <div className="max-w-[36ch] text-right text-sm text-muted">
          {free ? (
            <p>
              Free for the whole record —{" "}
              <b className="font-bold text-ink">{span(plan.points[0].date, upTo)}</b>.
            </p>
          ) : raised === null ? (
            <p>
              <b className="font-bold text-ink">No rise</b> anywhere in{" "}
              <b className="font-bold text-ink">{span(plan.points[0].date, upTo)}</b> of readable
              record
              {stale ? (
                <>
                  , which ends in <b className="font-bold text-ink">{endsIn}</b>.
                </>
              ) : (
                "."
              )}
            </p>
          ) : raised === planEnds(plan) && !stale ? (
            <p>
              Raised <b className="font-bold text-ink">{span(raised, upTo)}</b> ago, and that is the
              price today.
            </p>
          ) : raised === planEnds(plan) ? (
            <p>
              Raised in <b className="font-bold text-ink">{raised.slice(0, 4)}</b>, the last readable
              capture — nothing after it to compare.
            </p>
          ) : stale ? (
            <p>
              Last rise <b className="font-bold text-ink">{span(raised, upTo)}</b> before the record
              ends in <b className="font-bold text-ink">{endsIn}</b>.
            </p>
          ) : (
            <p>
              Last rise <b className="font-bold text-ink">{span(raised, upTo)}</b> ago.
            </p>
          )}
          {hold && hold.days > 200 && !free && (
            <p className="mt-0.5">
              Held at <b className="font-bold text-ink">${hold.price}</b> for{" "}
              <b className="font-bold text-ink">{span(hold.from, hold.to)}</b>
              {hold.ongoing
                ? " and counting"
                : `, ${hold.from.slice(0, 4)} to ${hold.to.slice(0, 4)}`}
              .
            </p>
          )}
        </div>
      </div>

      {s.plans.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {s.plans.map((p, i) => {
            const on = i === active;
            const newest = p.points[p.points.length - 1];
            return (
              <button
                key={p.name}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(i)}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-[.04em] transition-colors ${
                  on
                    ? "border-ink bg-ink text-ground"
                    : "border-rule text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {p.name}
                <span className={`ml-1.5 tabular-nums ${on ? "opacity-70" : "opacity-60"}`}>
                  {newest.price === 0 ? "free" : `$${newest.price}`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Rail s={s} plan={plan} />

      {(s.note || notes.length > 0) && (
        <details className="group mt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.12em] text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90">
              ›
            </span>
            <span className="group-open:hidden">What happened here</span>
            <span className="hidden group-open:inline">Hide</span>
          </summary>
          <p className="mt-2.5 max-w-[68ch] text-[13px] leading-relaxed text-muted">
            {s.note && <span className="text-ink">{s.note} </span>}
            {notes.map((p, i) => (
              <span key={p.date}>
                <b className="font-semibold text-ink">{p.date.slice(0, 7)}</b> — {p.note}
                {i < notes.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </details>
      )}
    </section>
  );
}
