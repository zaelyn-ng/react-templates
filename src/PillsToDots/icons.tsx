import type { IconName } from "./types";

const PATHS: Record<IconName, string> = {
  plus: "M12 5v14M5 12h14",
  spark: "m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
  chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  chart: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  link: "M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1",
  wave: "M3 12c3-6 5-6 7 0s4 6 7 0 2-4 4-4",
  layers: "m12 3 9 5-9 5-9-5zM3 13l9 5 9-5",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
};

export function Icon({ name }: { name: IconName }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
