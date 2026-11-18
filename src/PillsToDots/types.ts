import type { ReactNode } from "react";

export type IconName = "plus" | "spark" | "chip" | "chart" | "link" | "wave" | "layers" | "search";

export interface PillItem {
  /** Text shown in the pill (also exposed to screen readers). */
  label: string;
  /** A built-in icon name, or your own element (use `currentColor` strokes/fills). Optional. */
  icon?: IconName | ReactNode;
}

export interface PillsToDotsProps {
  /** The list that collapses into dots. Works with any number of items; 5–10 looks best. */
  items: PillItem[];
  /** Hero headline. */
  heading: ReactNode;
  /** Supporting text under the headline. */
  description?: ReactNode;
  /** Buttons or links under the text. */
  actions?: ReactNode;
  /** Heading tag. Defaults to 1 because this is meant to be a page hero. */
  headingLevel?: 1 | 2;
  /**
   * "collapse": pills turn into dots, then an arrow, as you scroll down (default).
   * "expand": the reverse.
   */
  direction?: "collapse" | "expand";
  /** Scroll distance in px the animation takes while the hero stays pinned. Default 1400. */
  scrollLength?: number;
  /** Px of scrolling before anything moves, so the hero reads first. Default 150. */
  startDelay?: number;
  /** How tightly the animation follows the scroll. Higher = tighter, lower = floatier, 0 = no smoothing. Default 9. */
  smoothRate?: number;
  /** How much neighbouring pills' animations overlap. 0 = strictly one by one. Default 1.2. */
  overlap?: number;
  /** Share (0–1) of the scroll spent turning pills into dots. The rest converges them into the arrow. Default 0.68. */
  pillsEnd?: number;
  /** Progress (0–1) at which the arrow starts drawing. Default 0.88. */
  arrowAt?: number;
  /**
   * Where each dot lands, as `[x fraction of panel width, y in px from the panel top]`.
   * Keep each dot's y at or above its own pill's row so it never crosses a pill that hasn't collapsed.
   * Omit to use an automatic spread.
   */
  dotPositions?: [number, number][];
  /** Called with the animation progress (0–1) as it changes. */
  onProgress?: (progress: number) => void;
  className?: string;
}
