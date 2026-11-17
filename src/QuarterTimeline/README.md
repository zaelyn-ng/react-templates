# QuarterTimeline

A horizontal roadmap by quarter. Each tile opens a detail modal with previous/next navigation.

```tsx
import { QuarterTimeline } from "react-templates";
import "react-templates/style.css";

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

- `icon`: a built-in name (`bolt`, `heart`, `code`, `rocket`, `doc`, `cal`, `chat`, `star`) or your own React element.
- `status`: `shipped`, `progress` or `planned`.
- `state` (per quarter): `done`, `now` or `upcoming`.
- The modal uses the native `<dialog>` element, so Esc, focus trapping and focus restore work out of the box. Arrow keys move between items.

**Theme variables:** `--qt-accent`, `--qt-accent-soft`, `--qt-tile`, `--qt-ink`, `--qt-line`, `--qt-muted`.

```css
.my-timeline { --qt-accent: #0f766e; --qt-tile: #f3f4f6; }
```
