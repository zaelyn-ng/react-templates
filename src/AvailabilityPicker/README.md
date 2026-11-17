# AvailabilityPicker

A day-by-day schedule where visitors click free blocks to build a shareable booking link.

```tsx
import { AvailabilityPicker } from "react-templates";
import "react-templates/style.css";

<AvailabilityPicker
  schedule={{
    Mon: [
      { start: 9, end: 10, title: "Standup", status: "busy" },
      { start: 14, end: 15, status: "free" },
    ],
  }}
  now={{ day: "Mon", hour: 13.4 }}
  onChange={(slots) => console.log(slots)}
  buildLink={(slots) => `https://book.example.com/me?s=${slots.length}`}
/>
```

| Prop | Type | Notes |
| --- | --- | --- |
| `schedule` | `Record<string, Slot[]>` | Day label → slots. Times are decimal hours (13.5 = 1:30 PM). |
| `startHour` / `endHour` / `hourHeight` | `number` | Visible range (default 9–18) and px per hour (56). |
| `now` | `{ day, hour }` | Optional "now" marker. |
| `value` / `defaultValue` / `onChange` | `SelectedSlot[]` | Controlled or uncontrolled selection. |
| `buildLink` / `onCopyLink` | function | Customise the generated link and react to copy. |
| `eyebrow` / `heading` / `className` | | Text and styling hooks. |

**Theme variables:** `--as-bg`, `--as-ink`, `--as-muted`, `--as-busy`, `--as-free`, `--as-selected`.

```css
.my-picker { --as-bg: #0f172a; --as-selected: #38bdf8; }
```
