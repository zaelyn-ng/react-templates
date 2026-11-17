# react-templates

Two interactive landing-page sections for React, written in TypeScript with CSS Modules and no runtime dependencies besides React.

| Component | What it is |
| --- | --- |
| `AvailabilityPicker` | A day-by-day schedule where visitors click free blocks to build a shareable booking link. |
| `QuarterTimeline` | A horizontal roadmap by quarter. Each tile opens a detail modal with previous/next navigation. |

Both are original designs *inspired by* common SaaS landing-page patterns. They contain no third-party branding, fonts or assets, and all demo content is placeholder.

## Run the demo

```bash
npm install
npm run dev
```

## Use in your project

Copy `src/AvailabilityPicker` and/or `src/QuarterTimeline` into your app (each folder is self-contained), or build the package and import it:

```bash
npm run build
```

```tsx
import { AvailabilityPicker, QuarterTimeline } from "react-templates";
import "react-templates/style.css";
```

### `AvailabilityPicker`

```tsx
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

### `QuarterTimeline`

```tsx
<QuarterTimeline
  quarters={[
    {
      name: "Q3", year: "2026", state: "now",
      items: [{
        title: "AI agent templates", icon: "star", status: "progress",
        owner: "AI", date: "Sep 15",
        description: "One-click agents with an editable prompt.",
        why: "Automate the week without a new tool.",
      }],
    },
  ]}
  onFollow={(item, following) => {}}
/>
```

`icon` accepts a built-in name (`bolt`, `heart`, `code`, `rocket`, `doc`, `cal`, `chat`, `star`) or your own React element. `status` is `shipped`, `progress` or `planned`. `state` is `done`, `now` or `upcoming`.

The modal uses the native `<dialog>` element, so you get focus trapping, Esc to close and focus restore for free. Arrow keys move between items.

## Theming

Override the CSS custom properties on the component's `className`:

```css
.my-timeline { --qt-accent: #0f766e; --qt-tile: #f3f4f6; }
.my-picker   { --as-bg: #0f172a; --as-selected: #38bdf8; }
```

Fonts are inherited from your page.

## Deploy the demo to GitHub Pages

```bash
npm run build:demo   # outputs demo-dist/
```

Serve `demo-dist/` with any static host or a Pages workflow.

## License

MIT
