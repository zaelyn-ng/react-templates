import { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";
import type { AvailabilityPickerProps, SelectedSlot } from "./types";

export type { AvailabilityPickerProps, Schedule, Slot, SelectedSlot } from "./types";

const fmt = (h: number) => {
  const H = Math.floor(h);
  const m = h % 1 ? ":30" : "";
  return `${H % 12 || 12}${m} ${H >= 12 ? "PM" : "AM"}`;
};
const range = (a: number, b: number) => `${fmt(a)}–${fmt(b)}`;
const same = (a: SelectedSlot, b: SelectedSlot) =>
  a.day === b.day && a.start === b.start && a.end === b.end;

const defaultLink = (slots: SelectedSlot[]) =>
  slots.length
    ? `book.example.com/you/${slots.map((s) => s.day.toLowerCase() + Math.round(s.start * 10)).join("-")}`
    : "";

export function AvailabilityPicker({
  schedule,
  startHour = 9,
  endHour = 18,
  hourHeight = 56,
  now,
  value,
  defaultValue = [],
  onChange,
  buildLink = defaultLink,
  onCopyLink,
  eyebrow = "Share availability",
  heading = "Avoid double booking and back-and-forth. Booking links always stay up-to-date.",
  className,
}: AvailabilityPickerProps) {
  const days = Object.keys(schedule);
  const [day, setDay] = useState(days[0]);
  const [inner, setInner] = useState<SelectedSlot[]>(defaultValue);
  const picked = value ?? inner;
  const [toast, setToast] = useState("");
  const [shake, setShake] = useState<string | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(""), 1400);
  };

  const commit = (next: SelectedSlot[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const toggle = (s: SelectedSlot) =>
    commit(picked.some((p) => same(p, s)) ? picked.filter((p) => !same(p, s)) : [...picked, s]);

  const link = buildLink(picked);
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {});
    onCopyLink?.(link);
    flash("Link copied");
  };

  return (
    <section className={`${styles.card} ${className ?? ""}`}>
      <div className={styles.left}>
        <div>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <h2 className={styles.heading}>{heading}</h2>
        </div>
        <div className={styles.panel}>
          <h3>Slots you're sharing</h3>
          <div className={styles.chips}>
            {picked.length ? (
              picked.map((p) => (
                <button
                  key={`${p.day}${p.start}${p.end}`}
                  className={styles.chip}
                  onClick={() => toggle(p)}
                  aria-label={`Remove ${p.day} ${range(p.start, p.end)}`}
                >
                  {p.day} {range(p.start, p.end)} <b aria-hidden>×</b>
                </button>
              ))
            ) : (
              <span className={styles.empty}>Click an “Available” block to add it.</span>
            )}
          </div>
          <div className={styles.link}>
            <input readOnly value={link} aria-label="Booking link" />
            <button className={styles.btn} disabled={!picked.length} onClick={copy}>
              Copy link
            </button>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.days} role="tablist">
          {days.map((d) => {
            const n = picked.filter((p) => p.day === d).length;
            return (
              <button
                key={d}
                role="tab"
                aria-selected={d === day}
                className={styles.day}
                onClick={() => setDay(d)}
              >
                {d}
                {n > 0 && <span className={styles.dot}>●{n}</span>}
              </button>
            );
          })}
        </div>

        <div className={styles.timeline} style={{ height: (endHour - startHour) * hourHeight }}>
          {hours.map((h) => (
            <div key={h}>
              <span className={styles.hour} style={{ top: (h - startHour) * hourHeight }}>
                {fmt(h)}
              </span>
              <div className={styles.gridline} style={{ top: (h - startHour) * hourHeight }} />
            </div>
          ))}

          {schedule[day].map((s) => {
            const sel: SelectedSlot = { day, start: s.start, end: s.end };
            const isSel = picked.some((p) => same(p, sel));
            const id = `${day}${s.start}${s.end}`;
            const cls = [
              styles.slot,
              s.status === "free" ? styles.free : styles.busy,
              isSel && styles.selected,
              shake === id && styles.shake,
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={id}
                className={cls}
                style={{
                  top: (s.start - startHour) * hourHeight + 2,
                  height: (s.end - s.start) * hourHeight - 4,
                }}
                aria-pressed={s.status === "free" ? isSel : undefined}
                onClick={() => {
                  if (s.status === "busy") {
                    setShake(null);
                    requestAnimationFrame(() => setShake(id));
                    flash("You're busy then");
                    return;
                  }
                  toggle(sel);
                }}
              >
                {s.status === "free" ? (isSel ? "Shared ✓" : "Available") : s.title}
                <small>{range(s.start, s.end)}</small>
              </button>
            );
          })}

          {now && now.day === day && (
            <div className={styles.now} style={{ top: (now.hour - startHour) * hourHeight }} />
          )}
        </div>

        <div className={styles.legend}>
          <span><i className={styles.swBusy} />Busy</span>
          <span><i className={styles.swFree} />Available – click to share</span>
          <span><i className={styles.swSel} />Shared</span>
        </div>
      </div>

      <div className={`${styles.toast} ${toast ? styles.toastOn : ""}`} role="status">
        {toast}
      </div>
    </section>
  );
}
