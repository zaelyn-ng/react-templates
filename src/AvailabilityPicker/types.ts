export type SlotStatus = "busy" | "free";

export interface Slot {
  /** Start time in decimal hours, e.g. 13.5 = 1:30 PM */
  start: number;
  /** End time in decimal hours */
  end: number;
  /** Label for busy slots. Free slots always read "Available". */
  title?: string;
  status: SlotStatus;
}

/** Keyed by day label, e.g. { Mon: [...], Tue: [...] } */
export type Schedule = Record<string, Slot[]>;

export interface SelectedSlot {
  day: string;
  start: number;
  end: number;
}

export interface AvailabilityPickerProps {
  schedule: Schedule;
  /** Visible range in decimal hours. Defaults 9–18. */
  startHour?: number;
  endHour?: number;
  /** Pixel height of one hour. Defaults 56. */
  hourHeight?: number;
  /** Draws a "now" marker on the given day/hour. */
  now?: { day: string; hour: number };
  /** Controlled selection. Omit for uncontrolled. */
  value?: SelectedSlot[];
  defaultValue?: SelectedSlot[];
  onChange?: (slots: SelectedSlot[]) => void;
  /** Builds the shareable link shown in the panel. */
  buildLink?: (slots: SelectedSlot[]) => string;
  onCopyLink?: (link: string) => void;
  eyebrow?: string;
  heading?: string;
  className?: string;
}
