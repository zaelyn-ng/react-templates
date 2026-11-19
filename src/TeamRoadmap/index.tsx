import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.css";
import { Icon } from "./icons";
import type { IconName, RoadmapEvent, RoadmapEventType, TeamRoadmapProps } from "./types";

export type {
  TeamRoadmapProps,
  RoadmapTeam,
  RoadmapMilestone,
  RoadmapEvent,
  RoadmapEventType,
  IconName,
} from "./types";

const DEFAULT_TYPES: RoadmapEventType[] = [
  { id: "research", label: "Research", icon: "search" },
  { id: "design", label: "Design", icon: "star" },
  { id: "build", label: "Build", icon: "code" },
  { id: "review", label: "Review", icon: "check" },
  { id: "launch", label: "Launch", icon: "rocket" },
];

type Status = "done" | "progress" | "planned";
const STATUS: Record<Status, { label: string; color: string }> = {
  done: { label: "Done", color: "#16a34a" },
  progress: { label: "In progress", color: "#e60000" },
  planned: { label: "Planned", color: "#9ca3af" },
};
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 864e5;
const ts = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
const fmt = (t: number) => {
  const d = new Date(t);
  return `${MON[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

interface Ev extends RoadmapEvent {
  s: number;
  e: number;
  q: number;
  blocks: string[];
}
interface Ms {
  id: string;
  name: string;
  s: number;
  e: number;
  prog: number;
  state: "done" | "now" | "";
  needs: number[];
  ev: Ev[];
}

const ARROW = (
  <span className={styles.arrow} aria-hidden>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  </span>
);

export function TeamRoadmap({
  teams,
  milestones,
  events,
  types = DEFAULT_TYPES,
  year,
  today,
  heading = "One plan, four teams",
  subheading = "Start with the big picture, zoom into a team, then follow how work depends on each other — or roll it all up into milestones.",
  onSelect,
  className,
}: TeamRoadmapProps) {
  const now = useMemo(() => ts(today ?? new Date().toISOString()), [today]);
  const yr = year ?? new Date(now).getUTCFullYear();
  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);
  const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? id;

  const { evs, byId, mss } = useMemo(() => {
    const evs: Ev[] = events.map((e) => {
      const s = ts(e.start);
      return { ...e, s, e: ts(e.end), q: Math.max(0, Math.min(3, Math.floor(new Date(s).getUTCMonth() / 3))), blocks: [] };
    });
    const byId = new Map(evs.map((e) => [e.id, e]));
    evs.forEach((e) => (e.dependsOn ?? []).forEach((d) => byId.get(d)?.blocks.push(e.id)));
    const mIndex = new Map(milestones.map((m, i) => [m.id, i + 1]));
    const mss: Ms[] = milestones.map((m) => {
      const ev = evs.filter((e) => e.milestone === m.id);
      const s = Math.min(...ev.map((e) => e.s));
      const e = Math.max(...ev.map((x) => x.e));
      const dur = (x: Ev) => (x.e - x.s) / DAY + 1;
      const tot = ev.reduce((a, x) => a + dur(x), 0) || 1;
      const prog = ev.reduce((a, x) => a + (x.e < now ? 1 : Math.max(0, Math.min(1, (now - x.s) / DAY / dur(x)))) * dur(x), 0) / tot;
      const needs = [...new Set(ev.flatMap((x) => (x.dependsOn ?? []).map((d) => byId.get(d)?.milestone)).filter((id): id is string => !!id && id !== m.id).map((id) => mIndex.get(id)!).filter((n) => n < (mIndex.get(m.id) ?? 0)))].sort();
      return { id: m.id, name: m.name, s, e, prog, state: e < now ? "done" : s <= now ? "now" : "", needs, ev };
    });
    return { evs, byId, mss };
  }, [events, milestones, now]);

  const status = (e: Ev): Status => (e.e < now ? "done" : e.s <= now ? "progress" : "planned");
  const range = (e: Ev) => `${fmt(e.s)} – ${fmt(e.e)}`;

  const quarters = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => {
        const s = Date.UTC(yr, i * 3, 1);
        const e = Date.UTC(yr, i * 3 + 3, 1);
        return { name: `Q${i + 1}`, state: (e <= now ? "done" : s <= now ? "now" : "") as "done" | "now" | "" };
      }),
    [yr, now],
  );
  const qNow = quarters.findIndex((q) => q.state === "now");
  const qRail = ((qNow >= 0 ? qNow + 0.5 : quarters.filter((q) => q.state === "done").length) / 4) * 100;
  const mNow = mss.findIndex((m) => m.state === "now");
  const mRail = ((mNow >= 0 ? mNow + 0.5 : mss.filter((m) => m.state === "done").length) / Math.max(1, mss.length)) * 100;

  const [view, setView] = useState<"teams" | "milestones">("teams");
  const [scope, setScope] = useState<string>("overview"); // "overview" | "all" | team id
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [trail, setTrail] = useState<string[]>([]);
  const [msId, setMsId] = useState<string>(() => (mss.find((m) => m.state === "now") ?? mss[0])?.id ?? "");
  const rootRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLElement>(null);
  const pending = useRef<(() => void) | null>(null);

  const selId = trail[trail.length - 1] ?? null;
  const selEv = selId ? byId.get(selId) ?? null : null;
  const chain = useMemo(() => {
    if (!selId) return null;
    const set = new Set([selId]);
    const up = (x: string) => (byId.get(x)?.dependsOn ?? []).forEach((d) => !set.has(d) && (set.add(d), up(d)));
    const dn = (x: string) => (byId.get(x)?.blocks ?? []).forEach((d) => !set.has(d) && (set.add(d), dn(d)));
    up(selId);
    dn(selId);
    return set;
  }, [selId, byId]);

  const smooth = () => (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth") as ScrollBehavior;
  const toTile = useCallback((id: string) => {
    rootRef.current?.querySelector<HTMLElement>(`[data-ev="${id}"]`)?.scrollIntoView({ behavior: smooth(), block: "center", inline: "center" });
  }, []);
  useEffect(() => {
    pending.current?.();
    pending.current = null;
  });

  const inTeam = view === "teams" && scope !== "overview" && scope !== "all";
  const visible = (e: Ev) => !hidden.has(e.type);

  /** Make sure an event's tile is on screen after jumping to it (switch team / milestone as needed). */
  const reveal = (e: Ev) => {
    setHidden((h) => (h.has(e.type) ? new Set([...h].filter((x) => x !== e.type)) : h));
    if (view === "milestones") setMsId(e.milestone);
    else if (scope === "overview" || (scope !== "all" && scope !== e.team)) setScope("all");
  };
  const open = (id: string) => {
    setTrail([id]);
    pending.current = () => detailRef.current?.scrollIntoView({ behavior: smooth(), block: "nearest" });
    const e = byId.get(id);
    if (e) onSelect?.(e);
  };
  const goto = (id: string) => {
    const e = byId.get(id);
    if (!e) return;
    setTrail((t) => [...t, id]);
    reveal(e);
    pending.current = () => {
      detailRef.current?.scrollIntoView({ behavior: smooth(), block: "nearest" });
      window.setTimeout(() => toTile(id), 350);
    };
    onSelect?.(e);
  };
  const goBackTo = (index: number) => {
    const id = trail[index];
    const e = byId.get(id);
    setTrail(trail.slice(0, index + 1));
    if (e) reveal(e);
    pending.current = () => toTile(id);
  };
  const toggleType = (id: string) => {
    setHidden((h) => {
      const n = new Set(h);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    if (selEv && selEv.type === id) setTrail([]);
  };

  useEffect(() => {
    if (!trail.length) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTrail([]);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trail.length]);

  const tile = (e: Ev, compact: boolean, subline?: string) => {
    const st = STATUS[status(e)];
    let cls = `${styles.tile} ${compact ? styles.compact : ""}`;
    let rel = "";
    if (chain && selEv) {
      if (e.id === selId) cls += ` ${styles.self}`;
      else if (chain.has(e.id)) {
        cls += ` ${styles.chain}`;
        if (selEv.dependsOn?.includes(e.id)) rel = "Needed first";
        else if (selEv.blocks.includes(e.id)) rel = "Unblocked next";
      } else cls += ` ${styles.dim}`;
    }
    const ty = typeById.get(e.type);
    return (
      <button key={e.id} className={cls} data-ev={e.id} onClick={() => open(e.id)}>
        <span className={styles.status} style={{ ["--c" as string]: st.color }}>{st.label}</span>
        {ARROW}
        {ty && <Icon name={ty.icon} className={styles.ic} />}
        <span className={styles.t}>{e.title}</span>
        <span className={styles.m}>{subline ?? range(e)}</span>
        {rel && <span className={styles.rel}>{rel}</span>}
      </button>
    );
  };

  const qHeads = (gridPlaced: boolean) =>
    quarters.map((q, i) => (
      <div key={q.name} className={`${styles.q} ${q.state ? styles[q.state] : ""}`} style={gridPlaced ? { gridColumn: i + 2, gridRow: 1 } : undefined}>
        <div className={styles.qhead}>
          <span className={styles.node} />
          <span className={styles.qname}>{q.name}<small>{yr}</small></span>
          {q.state === "now" && <span className={styles.badge}>Now</span>}
        </div>
      </div>
    ));

  const showChips = !(view === "teams" && scope === "overview");
  const cur = mss.find((m) => m.id === msId) ?? mss[0];

  return (
    <section ref={rootRef} className={`${styles.root} ${className ?? ""}`}>
      <h2 className={styles.title}>{heading}</h2>
      <p className={styles.sub}>{subheading}</p>

      <div className={styles.controls}>
        <div className={styles.seg} role="group" aria-label="Group by">
          <button aria-pressed={view === "teams"} onClick={() => { setView("teams"); setTrail([]); if (inTeam) setScope("overview"); }}>By team</button>
          <button aria-pressed={view === "milestones"} onClick={() => { setView("milestones"); setTrail([]); }}>By milestone</button>
        </div>
        {view === "teams" && !inTeam && (
          <div className={styles.seg} role="group" aria-label="Detail level">
            <button aria-pressed={scope === "overview"} onClick={() => { setScope("overview"); setTrail([]); }}>Overview</button>
            <button aria-pressed={scope === "all"} onClick={() => { setScope("all"); setTrail([]); }}>All events</button>
          </div>
        )}
      </div>

      <div className={styles.chips}>
        {showChips && (
          <>
            {types.map((t) => (
              <button key={t.id} className={styles.chip} aria-pressed={!hidden.has(t.id)} onClick={() => toggleType(t.id)}>
                <Icon name={t.icon} />
                {t.label}
              </button>
            ))}
            {hidden.size > 0 && <button className={styles.reset} onClick={() => setHidden(new Set())}>Show all types</button>}
          </>
        )}
      </div>

      {view === "teams" && scope === "overview" && (
        <>
          <div className={styles.teams}>
            {teams.map((t) => {
              const ev = evs.filter((e) => e.team === t.id);
              const done = ev.filter((e) => status(e) === "done").length;
              const nowEv = ev.filter((e) => status(e) === "progress");
              const next = ev.filter((e) => status(e) === "planned").sort((a, b) => a.s - b.s)[0];
              return (
                <button key={t.id} className={`${styles.tile} ${styles.team}`} onClick={() => { setScope(t.id); setTrail([]); }}>
                  <span className={styles.status} style={{ ["--c" as string]: "#e60000" }}>{ev.length} events</span>
                  {ARROW}
                  <span className={styles.mono}>{t.name[0]}</span>
                  <span className={styles.t}>{t.name}</span>
                  <span className={styles.bar}><i style={{ width: `${ev.length ? (done / ev.length) * 100 : 0}%` }} /></span>
                  <span className={styles.m}>{done} of {ev.length} done</span>
                  <span className={styles.nowline}>
                    {nowEv.length ? <>Now: <b>{nowEv.map((e) => e.title).join(", ")}</b></> : next ? <>Next up: <b>{next.title}</b></> : <b>All done</b>}
                  </span>
                </button>
              );
            })}
          </div>
          <p className={styles.hint} style={{ textAlign: "center", marginTop: 18 }}>
            Pick a team to see its events by quarter, or switch to “All events” to see every team at once.
          </p>
        </>
      )}

      {view === "teams" && scope === "all" && (
        <div className={styles.scroller}>
          <div className={styles.matrix}>
            <div className={styles.rail}><i style={{ width: `${qRail}%` }} /></div>
            <div className={styles.hrow}><div />{qHeads(true)}</div>
            {teams.map((t) => (
              <MatrixRow key={t.id} label={<button onClick={() => { setScope(t.id); setTrail([]); }}><b>{t.name}</b><small>Open timeline →</small></button>}>
                {[0, 1, 2, 3].map((q) => (
                  <div key={q} className={styles.mcell}>{evs.filter((e) => e.team === t.id && e.q === q && visible(e)).map((e) => tile(e, true))}</div>
                ))}
              </MatrixRow>
            ))}
          </div>
        </div>
      )}

      {inTeam && (
        <>
          <div className={styles.crumbs}>
            <button className={styles.back} onClick={() => { setScope("overview"); setTrail([]); }}>← All teams</button>
            <span>/</span>
            <b>{teamName(scope)}</b>
          </div>
          <div className={styles.scroller}>
            <div className={styles.grid} style={{ gridTemplateColumns: "repeat(4,minmax(250px,1fr))" }}>
              <div className={styles.rail}><i style={{ width: `${qRail}%` }} /></div>
              {qHeads(false)}
              {[0, 1, 2, 3].map((q) => (
                <div key={q} className={styles.q} style={{ gridRow: 2 }}>
                  <div className={styles.tiles}>{evs.filter((e) => e.team === scope && e.q === q && visible(e)).map((e) => tile(e, false))}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {view === "milestones" && cur && (
        <>
          <div className={styles.scroller}>
            <div className={styles.mrail} style={{ gridTemplateColumns: `repeat(${mss.length},minmax(190px,1fr))` }}>
              <div className={styles.rail}><i style={{ width: `${mRail}%` }} /></div>
              {mss.map((m, i) => (
                <button key={m.id} className={`${styles.ms} ${m.state ? styles[m.state] : ""}`} aria-pressed={m.id === cur.id} onClick={() => { setMsId(m.id); setTrail([]); }}>
                  <div className={styles.qhead}>
                    <span className={styles.num}>{i + 1}</span>
                    {m.state === "now" && <span className={styles.badge}>Now</span>}
                  </div>
                  <span className={styles.mtile}>
                    <h3>{m.name}</h3>
                    <span className={styles.dates}>{fmt(m.s)} → {fmt(m.e)}</span>
                    <span className={styles.meta}>
                      {m.ev.length} events · {new Set(m.ev.map((e) => e.team)).size} teams{m.needs.length ? ` · needs M${m.needs.join(", M")}` : ""}
                    </span>
                    <span className={styles.bar}><i style={{ width: `${m.prog * 100}%` }} /></span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.mhead}>
            <h3>M{mss.indexOf(cur) + 1} · {cur.name}</h3>
            <div className={styles.flagpair}>
              <span className={styles.flag}>Starts {fmt(cur.s)}</span>→<span className={`${styles.flag} ${styles.fe}`}>Ends {fmt(cur.e)}</span>
            </div>
          </div>
          <p className={styles.hint}>{cur.ev.length} events from {new Set(cur.ev.map((e) => e.team)).size} teams come together to complete this milestone. It can’t finish until the last one does.</p>
          {cur.ev.some(visible) ? (
            <div className={styles.mtiles}>
              {[...cur.ev].filter(visible).sort((a, b) => a.s - b.s).map((e) => tile(e, true, `${teamName(e.team)} · ${range(e)}`))}
            </div>
          ) : (
            <div className={styles.empty}>All event types in this milestone are filtered out.</div>
          )}
        </>
      )}

      {selEv && (
        <section ref={detailRef} className={styles.detail} aria-label="Event details" tabIndex={-1}>
          {trail.length > 1 && (
            <div className={styles.trail}>
              <button className={styles.backev} onClick={() => goBackTo(trail.length - 2)}>← Back to {byId.get(trail[trail.length - 2])?.title}</button>
              {trail.map((id, i) =>
                i === trail.length - 1 ? (
                  <span key={i} className={styles.cur}>{byId.get(id)?.title}</span>
                ) : (
                  <span key={i} style={{ display: "contents" }}>
                    <button className={styles.c} onClick={() => goBackTo(i)}>{byId.get(id)?.title}</button>
                    <span className={styles.sp}>›</span>
                  </span>
                ),
              )}
            </div>
          )}
          <div className={styles.dhead}>
            <div>
              <div className={styles.crumb}>{teamName(selEv.team)} · {typeById.get(selEv.type)?.label ?? selEv.type} · {STATUS[status(selEv)].label}</div>
              <h3 className={styles.dtitle}>{selEv.title}</h3>
              {selEv.description && <p className={styles.ddesc}>{selEv.description}</p>}
            </div>
            <button className={styles.x} onClick={() => setTrail([])} aria-label="Close details">✕</button>
          </div>
          <div className={styles.facts}>
            <div className={styles.fact}><span>Team</span><strong>{teamName(selEv.team)}</strong></div>
            <div className={styles.fact}><span>Dates</span><strong>{range(selEv)}</strong></div>
            <div className={styles.fact}><span>Status</span><strong>{STATUS[status(selEv)].label}</strong></div>
            <div className={styles.fact}>
              <span>Milestone</span>
              <button onClick={() => { setView("milestones"); setMsId(selEv.milestone); pending.current = () => toTile(selEv.id); }}>
                M{mss.findIndex((m) => m.id === selEv.milestone) + 1} · {mss.find((m) => m.id === selEv.milestone)?.name}
              </button>
            </div>
          </div>
          <div className={styles.rels}>
            <RelList title="Depends on" hint="These need to finish before this event can start." empty="Nothing — this can start any time." ids={selEv.dependsOn ?? []} />
            <RelList title="Blocks" hint="These are waiting on this event." empty="Nothing downstream." ids={selEv.blocks} />
          </div>
        </section>
      )}
    </section>
  );

  function RelList({ title, hint, empty, ids }: { title: string; hint: string; empty: string; ids: string[] }) {
    return (
      <div>
        <h4>{title}</h4>
        <p className={styles.s}>{hint}</p>
        <div className={styles.dl}>
          {ids.length === 0 && <div className={styles.none}>{empty}</div>}
          {ids.map((x) => {
            const o = byId.get(x);
            if (!o) return null;
            const ty = typeById.get(o.type);
            return (
              <button key={x} className={styles.dep} onClick={() => goto(x)}>
                {ty && <Icon name={ty.icon as IconName} />}
                <div><span>{o.title}</span><small>{teamName(o.team)} · {range(o)}</small></div>
                <span className={styles.go}>View →</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

function MatrixRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className={styles.mrowlabel}>{label}</div>
      {children}
    </>
  );
}
