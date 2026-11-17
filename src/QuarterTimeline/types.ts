import type { ReactNode } from "react";

export type IconName = "bolt" | "heart" | "code" | "rocket" | "doc" | "cal" | "chat" | "star";
export type ItemStatus = "shipped" | "progress" | "planned";
export type QuarterState = "done" | "now" | "upcoming";

export interface TimelineItem {
  id?: string;
  title: string;
  /** Built-in icon name, or any ReactNode (e.g. your own <svg>) */
  icon?: IconName | ReactNode;
  status: ItemStatus;
  owner: string;
  /** Display string, e.g. "Sep 30" */
  date: string;
  description: string;
  why: string;
}

export interface Quarter {
  name: string; // "Q3"
  year: string; // "2026"
  state?: QuarterState;
  items: TimelineItem[];
}

export interface QuarterTimelineProps {
  quarters: Quarter[];
  heading?: string;
  subheading?: string;
  /** Called when "Follow this" is toggled */
  onFollow?: (item: TimelineItem, following: boolean) => void;
  /** Called when an item's modal opens */
  onOpen?: (item: TimelineItem) => void;
  className?: string;
}
