import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import styles from "./styles.module.css";
import { Icon } from "./icons";
import type { IconName, PillsToDotsProps } from "./types";

export type { PillsToDotsProps, PillItem, IconName } from "./types";

// Fixed geometry (px). Everything visual is themeable with the --pd-* CSS variables.
const DOT = 32;
const PAD = 6;
const PILL_H = DOT + PAD * 2;
const GAP = 8;
const MARGIN = 24; // same padding on top, bottom, left and right of the panel
const INDENT = [0, 12, 4, 16, 8, 20, 2, 14, 6];
const TRIM = [0, 20, 6, 26, 10, 16, 0, 22, 8];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const frac = (v: number) => v - Math.floor(v);

/** Automatic dot spread: each dot lands at or above its own pill's row. */
function autoTargets(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const yMin = MARGIN + DOT / 2;
    const yMax = MARGIN + i * (PILL_H + GAP) + PILL_H / 2;
    return [frac(0.17 + i * 0.618034), yMin + (yMax - yMin) * frac(0.35 + i * 0.381966)];
  });
}

const initialStyle = (i: number): CSSProperties => {
  const k = i % INDENT.length;
  return {
    transform: `translate3d(${MARGIN + INDENT[k]}px, ${MARGIN + i * (PILL_H + GAP)}px, 0)`,
    width: `calc(100% - ${MARGIN * 2 + INDENT[k] + TRIM[k]}px)`,
    height: PILL_H,
    paddingLeft: PAD,
  };
};

export function PillsToDots({
  items,
  heading,
  description,
  actions,
  headingLevel = 1,
  direction = "collapse",
  scrollLength = 1400,
  startDelay = 150,
  smoothRate = 9,
  overlap = 1.2,
  pillsEnd = 0.68,
  arrowAt = 0.88,
  dotPositions,
  onProgress,
  className,
}: PillsToDotsProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGPathElement>(null);

  // Latest props, read inside the animation loop so changing them never restarts it
  const cfg = useRef({ direction, scrollLength, startDelay, smoothRate, overlap, pillsEnd, arrowAt, dotPositions, onProgress });
  cfg.current = { direction, scrollLength, startDelay, smoothRate, overlap, pillsEnd, arrowAt, dotPositions, onProgress };

  const n = items.length;
  const panelHeight = MARGIN * 2 + n * PILL_H + Math.max(0, n - 1) * GAP;

  useEffect(() => {
    const track = rootRef.current, sticky = stickyRef.current, panel = panelRef.current;
    const hub = hubRef.current, arrow = arrowRef.current;
    if (!track || !sticky || !panel || !hub || !arrow) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>("[data-pill]")).map((el) => {
      const tile = el.children[0] as HTMLElement;
      return { el, tile, icon: tile.firstElementChild as HTMLElement | null, label: el.children[1] as HTMLElement };
    });
    const count = nodes.length;
    const auto = autoTargets(count);

    let W = 0, H = 0, target = 0, p = 0, visible = true, trackAbsTop = 0, raf = 0;
    let last = performance.now(), reported = -1;

    const onScroll = () => {
      const c = cfg.current;
      const scrolled = window.scrollY - trackAbsTop;
      target = clamp((scrolled - c.startDelay) / Math.max(1, c.scrollLength - c.startDelay));
    };

    // Layout work happens only on load/resize, so scrolling never forces a reflow.
    const layout = () => {
      W = panel.clientWidth;
      H = panel.clientHeight;
      const vh = window.innerHeight, secH = sticky.offsetHeight;
      // Centre the row in the viewport; if it's taller than the screen (mobile), keep the panel in view.
      sticky.style.top = (secH <= vh ? (vh - secH) / 2 : vh - secH - 12) + "px";
      track.style.height = vh + cfg.current.scrollLength + "px"; // progress reaches exactly 1 at the end of the pin
      trackAbsTop = track.getBoundingClientRect().top + window.scrollY;
      onScroll();
    };

    const render = (time: number) => {
      const c = cfg.current;
      const pe = c.direction === "collapse" ? p : 1 - p;
      const pills = clamp(pe / c.pillsEnd);
      const cT = easeIO(clamp((pe - (c.pillsEnd - 0.03)) / 0.22)); // dots converge on the centre
      const arrowT = ease(clamp((pe - c.arrowAt) / Math.max(0.001, 1 - c.arrowAt))); // arrow draws in
      const targets = c.dotPositions ?? auto;

      nodes.forEach((nd, i) => {
        const t = clamp((pills * (count + c.overlap) - i) / (1 + c.overlap));

        // Phases overlap on purpose, so nothing stops dead before the next starts
        const iconT = ease(clamp(t / 0.25)); // icon tile -> dark circle
        const grayT = ease(clamp((t - 0.08) / 0.3)); // pill background greys out
        const sizeT = ease(clamp((t - 0.22) / 0.45)); // pill shrinks to a dot
        const moveT = easeIO(clamp((t - 0.38) / 0.62)); // dot floats to its spot
        const labelO = 1 - clamp((t - 0.1) / 0.25);

        const k = i % INDENT.length;
        const px = MARGIN + INDENT[k];
        const pw = W - MARGIN * 2 - INDENT[k] - TRIM[k];
        const py = MARGIN + i * (PILL_H + GAP);

        const tg = targets[i] ?? auto[i];
        const drift = reduce ? 0 : Math.sin(time / 900 + i * 1.7) * 4 * moveT * (1 - cT);
        const sx = clamp(W * tg[0] - DOT / 2, MARGIN, Math.max(MARGIN, W - MARGIN - DOT));
        const sy = tg[1] - DOT / 2 + drift;
        const cx = W / 2 - DOT / 2, cy = H / 2 - DOT / 2;

        const w = lerp(pw, DOT, sizeT), h = lerp(PILL_H, DOT, sizeT);
        const baseTop = py + (PILL_H - h) / 2;
        const x = lerp(lerp(px, sx, moveT), cx, cT);
        const y = lerp(lerp(baseTop, sy, moveT), cy, cT);

        const s = nd.el.style;
        s.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        s.width = w.toFixed(2) + "px";
        s.height = h.toFixed(2) + "px";
        s.paddingLeft = (PAD * (1 - sizeT)).toFixed(2) + "px";
        s.opacity = String(1 - clamp((cT - 0.8) / 0.2)); // dots melt into the big circle
        s.setProperty("--g", grayT.toFixed(3));

        nd.tile.style.setProperty("--i", iconT.toFixed(3));
        nd.tile.style.borderRadius = lerp(10, DOT / 2, iconT).toFixed(2) + "px";
        if (nd.icon) nd.icon.style.opacity = String(1 - clamp(iconT * 1.6));
        nd.label.style.opacity = String(labelO);
      });

      hub.style.transform = `scale(${ease(clamp((cT - 0.35) / 0.65)).toFixed(3)})`;
      arrow.style.strokeDashoffset = (1 - arrowT).toFixed(3);

      if (Math.abs(p - reported) > 0.001) {
        reported = p;
        c.onProgress?.(p);
      }
    };

    // Ease toward the scroll position with frame-rate-independent damping, so wheel jumps become continuous motion.
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;
      if (!visible) return;
      const rate = cfg.current.smoothRate;
      if (reduce || !rate) p = target;
      else {
        p += (target - p) * (1 - Math.exp(-dt * rate));
        if (Math.abs(target - p) < 0.0002) p = target;
      }
      render(time);
    };

    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: "200px" });
    io.observe(track);
    const ro = new ResizeObserver(layout);
    ro.observe(sticky);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    window.addEventListener("load", layout);

    layout();
    p = target;
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      window.removeEventListener("load", layout);
    };
  }, [n]);

  const Heading = headingLevel === 2 ? "h2" : "h1";

  return (
    <section ref={rootRef} className={`${styles.root} ${className ?? ""}`}>
      <div ref={stickyRef} className={styles.sticky}>
        <div className={styles.inner}>
          <div>
            <Heading className={styles.heading}>{heading}</Heading>
            {description && <p className={styles.desc}>{description}</p>}
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>

          {/* Decorative: the same labels are listed for screen readers below */}
          <div ref={panelRef} className={styles.panel} style={{ height: panelHeight }} aria-hidden="true">
            {items.map((it, i) => (
              <div key={`${it.label}-${i}`} data-pill className={styles.pill} style={initialStyle(i)}>
                <span className={styles.tile}>
                  {it.icon != null && (
                    <span className={styles.icon}>
                      {typeof it.icon === "string" ? <Icon name={it.icon as IconName} /> : it.icon}
                    </span>
                  )}
                </span>
                <span className={styles.label}>{it.label}</span>
              </div>
            ))}
            <div ref={hubRef} className={styles.hub}>
              <svg viewBox="0 0 24 24">
                <path ref={arrowRef} pathLength={1} d="M5 12h14M13 6l6 6-6 6" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
              </svg>
            </div>
          </div>

          <ul className={styles.srOnly}>
            {items.map((it, i) => (
              <li key={`${it.label}-${i}`}>{it.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
