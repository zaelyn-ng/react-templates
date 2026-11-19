import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import styles from "./styles.module.css";
import type { FlowChartProps, FlowText } from "./types";

export type {
  FlowChartProps,
  FlowStage,
  FlowList,
  FlowListItem,
  FlowText,
  FlowInput,
  FlowOutput,
} from "./types";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Box { l: number; t: number; r: number; b: number; cx: number; cy: number }
interface Line { key: string; d: string }
interface Geo { w: number; h: number; stage: string[]; merge: Line[]; head?: string; loop?: Line; loopHead?: string; fb?: { x: number; y: number } }

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

function Clock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function FlowChart({
  stages,
  lists,
  inputs,
  combine,
  addon,
  outputs,
  footer,
  feedback,
  highlightLabel,
  heading = "From inputs to outputs",
  subheading = "Blue boxes are lists with an estimated delivery time. Grey boxes are plain notes. Click any box to follow its path.",
  compactBelow = 1040,
  onSelect,
  className,
}: FlowChartProps) {
  const root = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [scopeOnly, setScopeOnly] = useState(false);

  /* ---------- responsive: switch layout by the widget's own width ---------- */
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const check = () => setCompact(el.clientWidth < compactBelow);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [compactBelow]);

  /* ---------- flow graph (used for click-to-trace) ---------- */
  const { chain, feedbackEdge } = useMemo(() => {
    const edges: [string, string][] = [];
    lists.forEach((l, i) => i < lists.length - 1 && edges.push([`list-${l.id}`, `list-${lists[i + 1].id}`]));
    inputs.forEach((n) => n.linked !== false && edges.push([`in-${n.id}`, "combine"]));
    outputs.forEach((o) => {
      edges.push(["combine", `out-${o.id}`]);
      if (addon) edges.push(["addon", `out-${o.id}`]);
      if (footer) edges.push([`out-${o.id}`, "footer"]);
    });
    const walk = (start: string, dir: 0 | 1) => {
      const seen = new Set([start]);
      const stack = [start];
      while (stack.length) {
        const n = stack.pop()!;
        edges.forEach((e) => {
          if (e[dir] === n && !seen.has(e[1 - dir])) { seen.add(e[1 - dir]); stack.push(e[1 - dir]); }
        });
      }
      return seen;
    };
    const chain = (id: string | null) => {
      if (!id) return null;
      const s = new Set([...walk(id, 0), ...walk(id, 1)]);
      if (addon && s.has("combine")) s.add("addon"); // "+" partners travel together
      if (s.has("addon")) s.add("combine");
      return s;
    };
    return { chain, feedbackEdge: ["footer", "combine"] as const };
  }, [lists, inputs, outputs, addon, footer]);
  const chainSet = useMemo(() => chain(active), [chain, active]);

  const select = (id: string | null) => {
    setActive(id);
    onSelect?.(id);
  };
  useEffect(() => {
    if (!active) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && (setActive(null), onSelect?.(null));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onSelect]);

  const hasHl = [...lists, ...inputs, combine, addon].some((n) => n?.highlight);

  /** props that make a box clickable / keyboard-operable and apply its state classes */
  const np = (id: string, highlight?: boolean, extra?: string) => {
    const state = chainSet ? (id === active ? styles.active : chainSet.has(id) ? styles.related : styles.dim) : "";
    const scopeDim = scopeOnly && !highlight && !id.startsWith("out-") && id !== "footer" ? styles.dim : "";
    return {
      "data-fc": id,
      role: "button" as const,
      tabIndex: 0,
      "aria-pressed": id === active,
      className: cx(extra, highlight && styles.hl, styles.node, state, scopeDim),
      onClick: (e: { stopPropagation: () => void }) => { e.stopPropagation(); select(id === active ? null : id); },
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(id === active ? null : id); }
      },
    };
  };
  const lineState = (a: string, b: string) => (chainSet ? (chainSet.has(a) && chainSet.has(b) ? styles.on : styles.faint) : "");

  /* ---------- measure connector lines (wide layout only) ---------- */
  useIsoLayoutEffect(() => {
    const el = board.current;
    if (compact || !el) { setGeo(null); return; }
    const calc = () => {
      const base = el.getBoundingClientRect();
      const get = (id: string): Box | null => {
        const n = el.querySelector(`[data-fc="${id}"]`);
        if (!n) return null;
        const r = n.getBoundingClientRect();
        const l = r.left - base.left, t = r.top - base.top;
        return { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2 };
      };
      const g: Geo = { w: base.width, h: base.height, stage: [], merge: [] };
      const t = [0, 1, 2].map((i) => get(`stage-${i}`));
      for (let i = 0; i < 2; i++) if (t[i] && t[i + 1]) g.stage.push(`M${t[i]!.r} ${t[i]!.cy}H${t[i + 1]!.l}`);
      const c = get("combine");
      if (c) {
        inputs.forEach((inp) => {
          if (inp.linked === false) return;
          const b = get(`in-${inp.id}`);
          if (!b) return;
          g.merge.push({ key: `in-${inp.id}`, d: `M${b.r} ${b.cy}H${(b.r + c.l) / 2}V${c.cy}H${c.l - 6}` });
        });
        if (g.merge.length) g.head = `M${c.l} ${c.cy}l-9 -6v12z`;
      }
      const f = get("footer-label"), lane = get("lane");
      if (footer && feedback && f && lane && c) {
        const y = lane.cy;
        g.loop = { key: "loop", d: `M${f.cx} ${f.b}V${y}H${c.cx}V${c.b + 6}` };
        g.loopHead = `M${c.cx} ${c.b}l-6 9h12z`;
        g.fb = { x: (f.cx + c.cx) / 2, y };
      }
      setGeo(g);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    document.fonts?.ready.then(calc);
    return () => ro.disconnect();
  }, [compact, inputs, footer, feedback, outputs, lists]);

  /* ---------- pieces ---------- */
  const textBox = (n: FlowText, id: string, opts?: { vertical?: boolean; extra?: string; note?: ReactNode }) => {
    const body = (
      <>
        {n.title && <strong>{n.title}</strong>}
        {n.text && <div className={styles.boxText}>{n.text}</div>}
        {opts?.note}
      </>
    );
    return (
      <div {...np(id, n.highlight, cx(styles.box, opts?.extra))}>
        {opts?.vertical ? <div className={styles.vertical}>{body}</div> : body}
      </div>
    );
  };
  const listBox = (l: (typeof lists)[number]) => (
    <div {...np(`list-${l.id}`, l.highlight, styles.list)}>
      {l.title && <span className={styles.listTitle}>{l.title}</span>}
      {l.items.map((it) => (
        <div key={it.title} className={styles.row}>
          <span>{it.title}</span>
          <span className={styles.eta}><Clock />{it.eta}</span>
        </div>
      ))}
    </div>
  );
  const listLink = (l: (typeof lists)[number], i: number) =>
    i < lists.length - 1 && (
      <div className={cx(styles.link, lineState(`list-${l.id}`, `list-${lists[i + 1].id}`))}>
        <i />
        {l.then && <span className={styles.dark}>{l.then}</span>}
        <i className={styles.arr} />
      </div>
    );
  const outBox = (o: (typeof outputs)[number]) => (
    <div {...np(`out-${o.id}`, false, cx(styles.out, styles.outNode))}>
      <div className={cx(styles.outChev, chainSet && chainSet.has(`out-${o.id}`) && styles.chevOn)}><div className={styles.chev} /></div>
      <div className={styles.outBody}>
        <span className={styles.dark}>{o.label}</span>
        <div className={styles.box}>
          {o.title && <strong>{o.title}</strong>}
          {o.text && <div className={styles.boxText}>{o.text}</div>}
        </div>
      </div>
    </div>
  );
  const footerBox = footer && (
    <div {...np("footer", false, styles.footer)}>
      <span data-fc="footer-label" className={styles.dark}>{footer}</span>
    </div>
  );

  return (
    <section ref={root} className={cx(styles.root, compact && styles.isCompact, className)} onClick={() => active && select(null)}>
      <h2 className={styles.title}>{heading}</h2>
      <p className={styles.sub}>{subheading}</p>

      {!compact ? (
        <div className={styles.board} ref={board}>
          {stages.map((s, i) => (
            <div key={i} className={cx(styles.stage, i === 0 ? styles.s1 : i === 1 ? styles.s2 : styles.s3)}>
              <span data-fc={`stage-${i}`} className={cx(styles.dark, styles.stagetitle)}>{s.title}</span>
              {s.description && <span className={cx(styles.dark, styles.desc)}>{s.description}</span>}
            </div>
          ))}

          <div className={styles.colA}>
            {lists.map((l, i) => (
              <div key={l.id} style={{ display: "contents" }}>{listBox(l)}{listLink(l, i)}</div>
            ))}
          </div>
          <div className={styles.chevA}><div className={styles.chev} /></div>

          <div className={styles.colB}>{inputs.map((n) => <div key={n.id} style={{ display: "contents" }}>{textBox(n, `in-${n.id}`)}</div>)}</div>
          <div className={styles.colC}>{textBox(combine, "combine")}</div>
          {addon && (
            <>
              <div className={styles.plus} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </div>
              <div className={styles.colD}>{textBox(addon, "addon", { vertical: true })}</div>
            </>
          )}

          <div className={styles.colE}>{outputs.map((o) => <div key={o.id} style={{ display: "contents" }}>{outBox(o)}</div>)}</div>
          {footerBox && <div className={styles.footerRow}>{footerBox}</div>}
          <div className={styles.lane} data-fc="lane" />

          {geo && (
            <>
              <svg className={styles.overlay} width={geo.w} height={geo.h} aria-hidden>
                {geo.stage.map((d, i) => <path key={`s${i}`} d={d} className={styles.stageLine} />)}
                {geo.merge.map((m) => <path key={m.key} d={m.d} className={lineState(m.key, "combine")} />)}
                {geo.head && <path d={geo.head} className={cx(styles.head, chainSet && !geo.merge.some((m) => chainSet.has(m.key.slice(0)) && chainSet.has("combine")) && styles.faint)} />}
                {geo.loop && <path d={geo.loop.d} className={lineState(...feedbackEdge)} />}
                {geo.loopHead && <path d={geo.loopHead} className={cx(styles.head, lineState(...feedbackEdge))} />}
              </svg>
              {geo.fb && feedback && <span className={cx(styles.dark, styles.feedback, lineState(...feedbackEdge))} style={{ left: geo.fb.x, top: geo.fb.y }}>{feedback}</span>}
            </>
          )}
        </div>
      ) : (
        /* ---------- stacked layout for narrow containers ---------- */
        <div className={styles.stack}>
          {stages.map((s, i) => (
            <div key={i} className={styles.cstage}>
              <div className={styles.chead}>
                <span className={cx(styles.dark, styles.stagetitle)}>{s.title}</span>
                {s.description && <span className={cx(styles.dark, styles.desc)}>{s.description}</span>}
              </div>
              {i === 0 && (
                <div className={styles.cbody}>
                  {lists.map((l, k) => (
                    <div key={l.id} style={{ display: "contents" }}>{listBox(l)}{listLink(l, k)}</div>
                  ))}
                </div>
              )}
              {i === 1 && (
                <div className={styles.cbody}>
                  {inputs.map((n) => (
                    <div key={n.id} style={{ display: "contents" }}>
                      {textBox(n, `in-${n.id}`, {
                        note: n.linked !== false && <span className={styles.feeds}>↓ feeds {combine.title ?? "the next box"}</span>,
                      })}
                    </div>
                  ))}
                  {textBox(combine, "combine")}
                  {addon && (
                    <>
                      <div className={styles.cplus} aria-hidden>+</div>
                      {textBox(addon, "addon")}
                    </>
                  )}
                </div>
              )}
              {i === 2 && (
                <div className={styles.cbody}>
                  {outputs.map((o) => <div key={o.id} style={{ display: "contents" }}>{outBox(o)}</div>)}
                  {footerBox}
                  {footer && feedback && <span className={cx(styles.dark, styles.cfeedback, lineState(...feedbackEdge))}>↺ {feedback} → {combine.title ?? "start"}</span>}
                </div>
              )}
              {i < 2 && <div className={styles.cdown} aria-hidden><div className={styles.chev} /></div>}
            </div>
          ))}
        </div>
      )}

      <div className={styles.legend}>
        {hasHl && highlightLabel && (
          <button type="button" className={cx(styles.legendBtn, scopeOnly && styles.legendOn)} aria-pressed={scopeOnly} onClick={(e) => { e.stopPropagation(); setScopeOnly((v) => !v); }}>
            <i />
            {highlightLabel}
            <span>{scopeOnly ? "Show all" : "Focus"}</span>
          </button>
        )}
        {active && <button type="button" className={styles.clear} onClick={(e) => { e.stopPropagation(); select(null); }}>Clear selection (Esc)</button>}
      </div>
    </section>
  );
}
