"use client";

import { useEffect, useRef, useState } from "react";

/* The opener draws the page's own idea: a price line that holds flat for years
   and then steps. The shape is Figma's Professional seat, the strongest single
   fact on the wall — $12 an editor from 2018 to 2026, then $16.

   Everything here is decorative and every piece resolves to its finished state.
   Under prefers-reduced-motion the whole sequence is skipped and the page is
   simply already drawn, which is also what a visitor sees if the JavaScript
   never runs, because the resting state is the default. */

const SHAPE = [
  { x: 4, v: 12, label: "$12", year: "2018" },
  { x: 22, v: 12, label: "$12", year: "2020" },
  { x: 40, v: 12, label: "$12", year: "2022" },
  { x: 58, v: 12, label: "$12", year: "2024" },
  { x: 76, v: 12, label: "$12", year: "2025" },
  { x: 94, v: 16, label: "$16", year: "2026" },
];

function useCountUp(target: number, run: boolean, ms = 900) {
  const [n, setN] = useState(run ? 0 : target);
  useEffect(() => {
    if (!run) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      // ease-out cubic: fast first, settles rather than stops
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return n;
}

export function Hero({
  tools,
  points,
  rises,
  cuts,
}: {
  tools: number;
  points: number;
  rises: number;
  cuts: number;
}) {
  /* `null` until we know, so nothing animates on the first paint and no branch
     renders differently on the server than the client. */
  const [motion, setMotion] = useState<boolean | null>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotion(!mq.matches);
    const on = () => setMotion(!mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const run = motion === true;
  const nTools = useCountUp(tools, run, 800);
  const nPoints = useCountUp(points, run, 1100);
  const nRises = useCountUp(rises, run, 900);
  const nCuts = useCountUp(cuts, run, 900);

  /* The viewBox aspect must match the box it renders into, or the default
     preserveAspectRatio letterboxes the drawing and it renders at a fraction of
     its width. 100/22 = 4.55 against a 520x112 box = 4.64. */
  const YT = 5;
  const YB = 14;
  const y = (v: number) => (v === 16 ? YT : YB);
  let d = `M ${SHAPE[0].x} ${y(SHAPE[0].v)}`;
  for (let i = 1; i < SHAPE.length; i++) {
    d += ` L ${SHAPE[i].x} ${y(SHAPE[i - 1].v)} L ${SHAPE[i].x} ${y(SHAPE[i].v)}`;
  }

  return (
    <header className={`border-b-2 border-ink pb-6 ${run ? "hero-run" : ""}`}>
      <p className="hero-i font-mono text-[11px] uppercase tracking-[.18em] text-muted" style={{ "--d": "0ms" } as React.CSSProperties}>
        onedaybuilt · day 06
      </p>

      <h1 className="mt-3 font-display text-[clamp(38px,7.6vw,84px)] font-black leading-[.9] tracking-[-.025em]">
        <span className="hero-line">
          <span className="hero-rise" style={{ "--d": "60ms" } as React.CSSProperties}>
            What software
          </span>
        </span>
        <span className="hero-line">
          <span className="hero-rise" style={{ "--d": "170ms" } as React.CSSProperties}>
            used to cost
          </span>
        </span>
      </h1>

      {/* the idea, drawing itself */}
      <div className="hero-i mt-6" style={{ "--d": "330ms" } as React.CSSProperties}>
        <svg
          viewBox="0 0 100 22"
          className="h-[112px] w-full max-w-[520px] overflow-visible"
          role="img"
          aria-label="Figma's Professional seat held at twelve dollars from 2018 to 2025, then rose to sixteen in 2026."
        >
          <line x1="0" y1={YB} x2="100" y2={YB} stroke="var(--color-rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path
            ref={pathRef}
            className="hero-draw"
            d={d}
            fill="none"
            stroke="var(--color-wire)"
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {SHAPE.map((p, i) => (
            <g key={p.year} className="hero-node" style={{ "--d": `${560 + i * 85}ms` } as React.CSSProperties}>
              <circle cx={p.x} cy={y(p.v)} r="1.5" fill="var(--color-board)" stroke="var(--color-wire)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <text
                x={p.x}
                y={y(p.v) - 3.2}
                textAnchor="middle"
                className="font-mono"
                fontSize="4.2"
                fill={i === SHAPE.length - 1 ? "var(--color-rise)" : "var(--color-muted)"}
                fontWeight={i === SHAPE.length - 1 ? 700 : 400}
              >
                {p.label}
              </text>
              <text x={p.x} y={20.5} textAnchor="middle" className="font-mono" fontSize="3.6" fill="var(--color-muted)">
                {p.year}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="hero-i mt-5 max-w-[58ch] text-[15.5px] text-muted" style={{ "--d": "430ms" } as React.CSSProperties}>
        Every price these tools ever published, hung in order from the line that price drew. A
        long flat wire is a price that <b className="font-semibold text-ink">held</b>. A step is the
        day it moved. Read straight off the archived pages at{" "}
        <b className="font-semibold text-ink">web.archive.org</b> — every tag opens the page it came
        from.
      </p>

      <dl className="hero-i mt-7 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4" style={{ "--d": "510ms" } as React.CSSProperties}>
        {[
          { k: "tools", v: nTools },
          { k: "archived pages linked", v: nPoints },
          { k: "price rises found", v: nRises },
          { k: "price cuts found", v: nCuts },
        ].map(({ k, v }) => (
          <div key={k}>
            <dd className="font-display text-4xl font-black leading-none tabular-nums">{v}</dd>
            <dt className="mt-1.5 font-mono text-[10px] uppercase tracking-[.13em] text-muted">{k}</dt>
          </div>
        ))}
      </dl>

      <div className="hero-i mt-7 flex flex-wrap gap-5 font-mono text-[11px] tracking-[.03em] text-muted" style={{ "--d": "580ms" } as React.CSSProperties}>
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
  );
}
