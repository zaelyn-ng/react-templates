import { isValidElement, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import styles from "./styles.module.css";
import { Icon } from "./icons";
import type { IconName, ItemStatus, QuarterTimelineProps, TimelineItem } from "./types";

export type { QuarterTimelineProps, Quarter, TimelineItem, IconName } from "./types";

const STATUS: Record<ItemStatus, { label: string; color: string }> = {
  shipped: { label: "Shipped", color: "#16a34a" },
  progress: { label: "In progress", color: "#4258f0" },
  planned: { label: "Planned", color: "#9ca3af" },
};

const renderIcon = (icon: IconName | ReactNode | undefined) =>
  typeof icon === "string" ? <Icon name={icon as IconName} className={styles.ic} /> : isValidElement(icon) ? icon : null;

interface Flat extends TimelineItem {
  quarter: string;
}

export function QuarterTimeline({
  quarters,
  heading = "Roadmap by quarter",
  subheading = "Click any tile to see what's planned, who owns it and why it matters.",
  onFollow,
  onOpen,
  className,
}: QuarterTimelineProps) {
  const flat = useMemo<Flat[]>(
    () => quarters.flatMap((q) => q.items.map((it) => ({ ...it, quarter: `${q.name} ${q.year}` }))),
    [quarters],
  );
  const [cur, setCur] = useState(0);
  const [open, setOpen] = useState(false);
  const [followed, setFollowed] = useState<Set<number>>(new Set());
  const dialog = useRef<HTMLDialogElement>(null);

  // Native <dialog> gives us focus trapping, Esc handling and focus restore.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setCur((c) => Math.min(c + 1, flat.length - 1));
      if (e.key === "ArrowLeft") setCur((c) => Math.max(c - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat.length]);

  const openAt = (i: number) => {
    setCur(i);
    setOpen(true);
    onOpen?.(flat[i]);
  };

  const item = flat[cur];
  const isFollowing = followed.has(cur);
  const nowIdx = quarters.findIndex((q) => q.state === "now");
  const progress = nowIdx >= 0 ? ((nowIdx + 0.5) / quarters.length) * 100 : 0;

  let counter = 0;
  return (
    <section className={`${styles.root} ${className ?? ""}`}>
      <h2 className={styles.title}>{heading}</h2>
      <p className={styles.sub}>{subheading}</p>

      <div className={styles.scroller}>
        <div className={styles.quarters} style={{ gridTemplateColumns: `repeat(${quarters.length}, minmax(260px, 1fr))` }}>
          <div className={styles.rail}>
            <i style={{ width: `${progress}%` }} />
          </div>
          {quarters.map((q) => (
            <div key={q.name + q.year} className={`${styles.q} ${q.state ? styles[q.state] : ""}`}>
              <div className={styles.qhead}>
                <span className={styles.node} />
                <span className={styles.qname}>
                  {q.name}
                  <small>{q.year}</small>
                </span>
                {q.state === "now" && <span className={styles.badge}>Now</span>}
              </div>
              <div className={styles.tiles}>
                {q.items.map((it) => {
                  const i = counter++;
                  const st = STATUS[it.status];
                  return (
                    <button key={it.id ?? it.title} className={styles.tile} onClick={() => openAt(i)}>
                      <span className={styles.status} style={{ ["--c" as string]: st.color }}>
                        {st.label}
                      </span>
                      <span className={styles.arrow} aria-hidden>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 9 9 3M4 3h5v5" />
                        </svg>
                      </span>
                      {renderIcon(it.icon)}
                      <span className={styles.t}>{it.title}</span>
                      <span className={styles.m}>{it.date}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="qt-title"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false);
        }}
      >
        {item && (
          <div className={styles.modal}>
            <div className={styles.mhead}>
              <button className={styles.x} onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
              <div className={styles.crumb}>
                {item.quarter} · {STATUS[item.status].label}
              </div>
              <h3 id="qt-title" className={styles.mtitle}>
                {item.title}
              </h3>
              <p className={styles.mdesc}>{item.description}</p>
            </div>
            <div className={styles.mbody}>
              <div className={styles.facts}>
                {(
                  [
                    ["Owner", item.owner],
                    ["Target", item.date],
                    ["Quarter", item.quarter],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className={styles.fact}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.box}>
                <b>Why it matters</b>
                <p>{item.why}</p>
              </div>
              <div className={styles.foot}>
                <div className={styles.pager}>
                  <button className={styles.btn} disabled={cur === 0} onClick={() => setCur(cur - 1)}>
                    ← Previous
                  </button>
                  <button className={styles.btn} disabled={cur === flat.length - 1} onClick={() => setCur(cur + 1)}>
                    Next →
                  </button>
                </div>
                <button
                  className={`${styles.btn} ${styles.primary}`}
                  onClick={() => {
                    const next = new Set(followed);
                    isFollowing ? next.delete(cur) : next.add(cur);
                    setFollowed(next);
                    onFollow?.(item, !isFollowing);
                  }}
                >
                  {isFollowing ? "Following ✓" : "Follow this"}
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
