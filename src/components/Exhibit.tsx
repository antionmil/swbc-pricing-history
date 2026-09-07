import { type Series } from "@/data/series";
import { fx, snapshotUrl, span, classify, pct, longestHold, lastRise, tickYears, isStale, horizon, recordEnds } from "@/lib/wall";

/* Geometry, in px inside the board. The wire lives in a band at the top; the
   tags hang below it on up to three rows so neighbouring captures never
   collide. Yearly captures on a 980px board are ~90px apart, which is narrower
   than a tag, hence the rows. */
const TOP = 52;
const BOT = 150;
const TAGY = 186;
const ROWH = 96;
const GAP = 12.6; // percent of width; below this two tags would overlap

export function Exhibit({ s, rank }: { s: Series; rank: number }) {
  const pts = s.points;
  const moves = classify(pts);
  const nums = pts.map((p) => p.price).filter((v): v is number => v !== null);
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const pad = hi > lo ? (hi - lo) * 0.3 : Math.max(2, hi * 0.3);
  const ylo = Math.max(0, lo - pad);
  const yhi = hi + pad;
  const fy = (v: number) => (yhi === ylo ? (TOP + BOT) / 2 : BOT - ((v - ylo) / (yhi - ylo)) * (BOT - TOP));

  // assign a hanging row per point, first row that clears GAP
  const last = [-99, -99, -99];
  const rows = pts.map((p) => {
    const x = fx(p.date);
    const r = [0, 1, 2].find((k) => x - last[k] >= GAP) ?? 0;
    last[r] = x;
    return r;
  });
  const H = TAGY + (Math.max(...rows) + 1) * ROWH + 8;

  // the wire: a step line, broken wherever no seat price was published
  const segs: [number, number][][] = [];
  let cur: [number, number][] = [];
  pts.forEach((p) => {
    if (p.price === null) {
      if (cur.length) segs.push(cur);
      cur = [];
      return;
    }
    cur.push([fx(p.date), fy(p.price)]);
  });
  if (cur.length) segs.push(cur);

  const hold = longestHold(s);
  const raised = lastRise(s);
  const stale = isStale(s);
  const upTo = horizon(s);
  const endsIn = recordEnds(s).slice(0, 4);

  const clamp = (x: number): React.CSSProperties =>
    x < 5.5 ? { left: 0 } : x > 94.5 ? { right: 0 } : { left: `${x}%`, transform: "translateX(-50%)" };
  const clampSm = (x: number): React.CSSProperties =>
    x < 3.2 ? { left: 0 } : x > 96.8 ? { right: 0 } : { left: `${x}%`, transform: "translateX(-50%)" };

  return (
    <section className="mt-14 border-t border-rule pt-7">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs text-muted tabular-nums">{String(rank).padStart(2, "0")}</span>
          <div>
            <h2 className="font-display text-3xl font-black leading-none tracking-tight">{s.tool}</h2>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[.13em] text-muted">{s.plan}</p>
          </div>
        </div>
        <div className="max-w-[36ch] text-right text-sm text-muted">
          {raised === null ? (
            <p>
              <b className="font-bold text-ink">No rise</b> anywhere in{" "}
              <b className="font-bold text-ink">{span(pts[0].date, upTo)}</b> of readable record
              {stale ? <>, which ends in <b className="font-bold text-ink">{endsIn}</b>.</> : "."}
            </p>
          ) : (
            <p>
              {raised === recordEnds(s) ? (
                <>
                  Raised in <b className="font-bold text-ink">{raised.slice(0, 4)}</b>, the last
                  readable capture — nothing after it to compare.
                </>
              ) : stale ? (
                <>
                  Last rise <b className="font-bold text-ink">{span(raised, upTo)}</b> before the
                  record ends in <b className="font-bold text-ink">{endsIn}</b>.
                </>
              ) : (
                <>
                  Last rise <b className="font-bold text-ink">{span(raised, upTo)}</b> ago.
                </>
              )}
            </p>
          )}
          {hold && hold.days > 200 && (
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

      <div
        dir="rtl"
        className="mt-4 overflow-x-auto rounded-sm border border-rule bg-board pt-5 [scrollbar-width:thin]"
      >
        <div dir="ltr" className="relative mx-6 w-[1680px]" style={{ height: H }}>
          {[...new Set([lo, hi])].map((v) => (
            <div key={v}>
              <div className="absolute inset-x-0 border-t border-dashed border-rule" style={{ top: fy(v) }} />
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
            {segs.map((seg, i) => {
              let d = `M ${seg[0][0].toFixed(2)} ${seg[0][1].toFixed(2)}`;
              for (let k = 1; k < seg.length; k++) {
                d += ` L ${seg[k][0].toFixed(2)} ${seg[k - 1][1].toFixed(2)} L ${seg[k][0].toFixed(2)} ${seg[k][1].toFixed(2)}`;
              }
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="var(--color-wire)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {pts.map((p, i) => {
              const y = p.price === null ? (TOP + BOT) / 2 : fy(p.price);
              return (
                <line
                  key={p.date}
                  x1={fx(p.date).toFixed(2)}
                  y1={y}
                  x2={fx(p.date).toFixed(2)}
                  y2={TAGY + rows[i] * ROWH - 2}
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
            const y = p.price === null ? (TOP + BOT) / 2 : fy(p.price);
            const m = moves[i];
            const label = p.price === null ? "usage" : p.price === 0 ? "free" : `$${p.price}`;
            const cls =
              m === "rise"
                ? "bg-rise text-rise-ink font-semibold"
                : m === "cut"
                  ? "bg-cut text-cut-ink font-semibold"
                  : m === "first" || m === "free"
                    ? "bg-ink text-ground font-semibold"
                    : m === "none"
                      ? "italic text-muted"
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
                  {label}
                </span>
              </span>
            );
          })}

          {/* the tags, hanging below */}
          {pts.map((p, i) => {
            const m = moves[i];
            const prev = pts.slice(0, i).reverse().find((q) => q.price !== null)?.price ?? null;
            const skin =
              m === "rise"
                ? "bg-rise text-rise-ink shadow-[0_2px_0_rgba(26,23,20,.14)]"
                : m === "cut"
                  ? "bg-cut text-cut-ink shadow-[0_2px_0_rgba(26,23,20,.14)]"
                  : m === "first" || m === "free"
                    ? "bg-ink text-ground shadow-[0_2px_0_rgba(26,23,20,.14)]"
                    : m === "none"
                      ? "border border-rule bg-board text-ink"
                      : "w-[68px] border border-rule bg-board text-ink";
            const delta =
              m === "free"
                ? "free"
                : m === "first"
                  ? "first price"
                  : m === "none"
                    ? "no seat price"
                    : m === "hold"
                      ? "held"
                      : pct(prev!, p.price!);
            const amount = p.price === null ? "usage" : p.price === 0 ? "$0" : `$${p.price}`;
            const d = new Date(p.date);
            return (
              <a
                key={p.date}
                href={snapshotUrl(s, p.ts)}
                target="_blank"
                rel="noopener"
                title={p.note ?? `archived ${p.date}`}
                className={`absolute block w-[104px] rounded-sm px-2.5 pb-2 pt-2.5 no-underline transition-transform hover:-translate-y-[3px] focus-visible:-translate-y-[3px] ${skin}`}
                style={{ ...clamp(fx(p.date)), top: TAGY + rows[i] * ROWH }}
              >
                <span className="absolute right-2 top-[7px] h-[7px] w-[7px] rounded-full bg-current opacity-30" />
                <span className="block font-mono text-[9.5px] uppercase tracking-[.11em] opacity-75">
                  {d.toLocaleString("en", { month: "short", timeZone: "UTC" })} {p.date.slice(0, 4)}
                </span>
                <span
                  className={`block font-display tabular-nums leading-none ${
                    m === "hold" ? "text-[22px] font-bold opacity-50" : m === "none" ? "text-[15px] font-bold" : "text-[29px] font-black"
                  }`}
                >
                  {amount}
                </span>
                <span className="mt-0.5 block font-mono text-[9.5px] font-semibold tracking-[.04em]">{delta}</span>
              </a>
            );
          })}

          {stale && (
            <>
              <div
                className="pointer-events-none absolute top-0 bottom-5 bg-ground/70"
                style={{ left: `${fx(recordEnds(s))}%`, right: 0 }}
                aria-hidden="true"
              />
              <span
                className="absolute font-mono text-[9px] uppercase tracking-[.12em] text-muted"
                style={{ left: `${fx(recordEnds(s))}%`, top: 22, marginLeft: 6 }}
              >
                no readable capture after {endsIn}
              </span>
            </>
          )}

          {/* today, at the right-hand edge — the point the rail opens on */}
          <div
            className="absolute top-0 bottom-5 border-l border-dashed border-accent"
            style={{ left: `${fx("2026-09-07")}%` }}
            aria-hidden="true"
          />
          <span
            className="absolute font-mono text-[9px] uppercase tracking-[.14em] text-accent"
            style={{ left: `${fx("2026-09-07")}%`, top: 4, transform: "translateX(-50%)" }}
          >
            now
          </span>

          <div className="absolute inset-x-0 bottom-0 h-5">
            {tickYears().map((y) => (
              <span
                key={y}
                className="absolute font-mono text-[10px] text-muted tabular-nums"
                style={{ left: `${fx(`${y}-01-01`)}%`, transform: "translateX(-50%)" }}
              >
                {y}
              </span>
            ))}
          </div>
        </div>
      </div>

      {(s.note || pts.some((p) => p.note)) && (
        <p className="mt-3.5 max-w-[76ch] text-[13px] leading-relaxed text-muted">
          {s.note && <span className="text-ink">{s.note} </span>}
          {pts
            .filter((p) => p.note)
            .map((p, i, arr) => (
              <span key={p.date}>
                <b className="font-semibold text-ink">{p.date.slice(0, 7)}</b> — {p.note}
                {i < arr.length - 1 ? " · " : ""}
              </span>
            ))}
        </p>
      )}
    </section>
  );
}
