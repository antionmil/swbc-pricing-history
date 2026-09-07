"use client";

import { useState } from "react";
import { SEAT } from "@/data/series";
import { Exhibit } from "@/components/Exhibit";
import { order, entryPrice, totalChange, type SortKey } from "@/lib/wall";

/* Three orders, and two of them flip.
 *
 * Clicking the active key reverses it, so "most expensive" and "cheapest" are
 * one button rather than two, and the arrow says which way it is pointing.
 * `record` has no direction on purpose — nobody opens a page like this looking
 * for the worst-evidenced exhibit first. */
const KEYS: { key: SortKey; label: string; up: string; down: string }[] = [
  { key: "record", label: "Best record", up: "", down: "" },
  { key: "price", label: "Entry price", up: "cheapest first", down: "most expensive first" },
  { key: "change", label: "Change since first price", up: "biggest cut first", down: "biggest rise first" },
];

const pctLabel = (n: number | null) =>
  n === null ? "—" : `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n * 100))}%`;

export function Wall() {
  const [key, setKey] = useState<SortKey>("record");
  const [desc, setDesc] = useState(true);

  const tools = order(key, desc);
  const active = KEYS.find((k) => k.key === key)!;

  return (
    <>
      <div className="mt-7 rounded-md border border-rule bg-board px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[.14em] text-muted">
            Order by
          </span>
          {KEYS.map((k) => {
            const on = k.key === key;
            const flips = k.key !== "record";
            return (
              <button
                key={k.key}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  if (on && flips) setDesc((d) => !d);
                  else {
                    setKey(k.key);
                    setDesc(true);
                  }
                }}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-[.04em] transition-colors ${
                  on
                    ? "border-ink bg-ink text-ground"
                    : "border-rule text-muted hover:border-ink hover:text-ink"
                }`}
                title={on && flips ? "Click again to reverse" : undefined}
              >
                {k.label}
                {on && flips && <span className="ml-1.5 opacity-70">{desc ? "↓" : "↑"}</span>}
              </button>
            );
          })}
        </div>

        <p className="mt-2.5 text-[13px] text-muted">
          {key === "record" ? (
            <>
              <b className="font-semibold text-ink">How good the record is</b>: how many years the
              archive caught, how densely, how recently, how many plans, and whether the price ever
              moved. The thinnest records sit at the bottom and say so.
            </>
          ) : key === "price" ? (
            <>
              <b className="font-semibold text-ink">{active.label}</b>, {desc ? active.down : active.up} —
              the newest price on each tool&rsquo;s cheapest paid plan, which is what most readers
              are actually on.
            </>
          ) : (
            <>
              <b className="font-semibold text-ink">{active.label}</b>, {desc ? active.down : active.up} —
              first paid price to newest, on the cheapest paid plan. Measured off the first paid
              price, not off a free tier.
            </>
          )}{" "}
          Every rail opens on <b className="font-semibold text-ink">today</b>; scroll it left to go
          back in time.
        </p>

        {key !== "record" && (
          <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tabular-nums text-muted">
            {tools.slice(0, 5).map((s, i) => (
              <li key={s.tool}>
                <span className="text-ink">{s.tool}</span>{" "}
                {key === "price" ? `$${entryPrice(s)}` : pctLabel(totalChange(s))}
                {i < 4 ? "" : " …"}
              </li>
            ))}
          </ol>
        )}
      </div>

      {tools.map((s, i) => (
        <Exhibit key={s.tool} s={s} rank={i + 1} />
      ))}
    </>
  );
}

export const TOOL_COUNT = SEAT.length;
