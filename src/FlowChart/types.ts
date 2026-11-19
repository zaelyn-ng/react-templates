import type { ReactNode } from "react";

export interface FlowStage {
  /** One-line stage name (dark pill) */
  title: string;
  /** One-line summary (dark bar under the pill) */
  description?: string;
}

export interface FlowListItem {
  title: string;
  /** Estimated delivery, shown as a small chip – e.g. "Aug 12" or "~3 wks" */
  eta: string;
}

/** A blue box that holds a list of items, each with an estimated delivery time */
export interface FlowList {
  id: string;
  title?: string;
  items: FlowListItem[];
  /** Dashed accent outline – use it to call attention to part of the chart */
  highlight?: boolean;
  /** Label of the connector that leads from this list to the next one */
  then?: string;
}

/** A plain grey text box */
export interface FlowText {
  id: string;
  title?: string;
  text?: ReactNode;
  highlight?: boolean;
}

export interface FlowInput extends FlowText {
  /** Draw a connector from this box into the combine box (default true) */
  linked?: boolean;
}

export interface FlowOutput {
  id: string;
  /** One-line dark label */
  label: string;
  title?: string;
  text?: ReactNode;
}

export interface FlowChartProps {
  /** Exactly three stages, left to right */
  stages: [FlowStage, FlowStage, FlowStage];
  /** Stage 1 – blue boxes with timed items */
  lists: FlowList[];
  /** Stage 2 – grey boxes that feed the combine box */
  inputs: FlowInput[];
  /** Stage 2 – the box the inputs merge into */
  combine: FlowText;
  /** Optional narrow box joined to `combine` with a "+" (text runs vertically) */
  addon?: FlowText;
  /** Stage 3 – label + text box, fed by the combine/addon boxes */
  outputs: FlowOutput[];
  /** Strip under the outputs with a one-line label */
  footer?: string;
  /** If set (and `footer` is set), a loop line leads from the footer back into `combine`, carrying this label */
  feedback?: string;
  /** Legend text for dashed outlines, e.g. "In scope this quarter" */
  highlightLabel?: string;
  /** Container width (px) below which the chart reflows into a stacked layout. Default 1040 */
  compactBelow?: number;
  /** Called with the id of the selected box (e.g. "combine", "in-docs", "list-intake", "out-report") or null */
  onSelect?: (id: string | null) => void;
  heading?: ReactNode;
  subheading?: ReactNode;
  className?: string;
}
