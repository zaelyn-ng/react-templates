import type { ReactNode } from "react";

export type IconName = "search" | "star" | "code" | "check" | "rocket" | "bolt" | "doc" | "cal" | "chat" | "heart";

export interface RoadmapTeam {
  id: string;
  name: string;
}

export interface RoadmapMilestone {
  id: string;
  name: string;
}

/** Event categories shown as filter chips. Each gets an icon on its tiles. */
export interface RoadmapEventType {
  id: string;
  label: string;
  icon: IconName;
}

export interface RoadmapEvent {
  id: string;
  /** `RoadmapTeam.id` */
  team: string;
  /** `RoadmapEventType.id` */
  type: string;
  title: string;
  /** ISO date, e.g. "2026-03-02" */
  start: string;
  /** ISO date (inclusive) */
  end: string;
  description?: string;
  /** Ids of events that must finish before this one starts */
  dependsOn?: string[];
  /** `RoadmapMilestone.id` this event contributes to */
  milestone: string;
}

export interface TeamRoadmapProps {
  teams: RoadmapTeam[];
  milestones: RoadmapMilestone[];
  events: RoadmapEvent[];
  /** Defaults to five generic types: research, design, build, review, launch */
  types?: RoadmapEventType[];
  /** Calendar year shown as Q1–Q4. Defaults to the year of `today`. */
  year?: number;
  /** ISO date used for status + the "Now" markers. Defaults to the current date. */
  today?: string;
  heading?: ReactNode;
  subheading?: ReactNode;
  /** Called whenever an event's details are opened */
  onSelect?: (event: RoadmapEvent) => void;
  className?: string;
}
