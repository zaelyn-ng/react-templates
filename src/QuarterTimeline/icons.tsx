import type { IconName } from "./types";

const PATHS: Record<IconName, string> = {
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
  heart: "M20 8c0 5-8 12-8 12S4 13 4 8a4 4 0 0 1 8-1 4 4 0 0 1 8 1z",
  code: "m8 7-5 5 5 5M16 7l5 5-5 5",
  rocket: "M5 19c0-3 1-4 3-4l-1-3 7-7c3-1 5-1 5-1s0 2-1 5l-7 7-3-1c0 2-1 3-4 4zM15 9h.01",
  doc: "M6 3h9l4 4v14H6zM9 12h7M9 16h7",
  cal: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  chat: "M4 5h16v11H9l-5 4z",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
