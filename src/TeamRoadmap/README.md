# TeamRoadmap

A multi-team roadmap in the same tile style as `QuarterTimeline`. It is a separate widget — `QuarterTimeline` is unchanged.

**Three ways to look at the same plan**

1. **By team → Overview** – one tile per team with progress and what's happening now. Click a team to see its events by quarter (`← All teams` returns).
2. **By team → All events** – every team and quarter in one grid.
3. **By milestone** – a rail of milestones with start → end dates and progress; pick one to see the events that form it.

Click any tile to open its details **below the timeline** (no modal / side panel): description, team, dates, status, milestone, plus **Depends on** and **Blocks** lists. The tile's whole dependency chain is highlighted (direct links are tagged "Needed first" / "Unblocked next"; everything else dims).

Following a dependency adds to a breadcrumb path (`Iteration sprints › Private beta launch`). Use **← Back to …** or click any earlier step to return. `Esc` closes the details.

Event-type chips filter every view.

## Usage

```tsx
import { TeamRoadmap } from "react-templates";
import "react-templates/style.css";

<TeamRoadmap
  teams={[{ id: "eng", name: "Engineering" }, { id: "design", name: "Design" }]}
  milestones={[{ id: "m1", name: "Discovery" }, { id: "m2", name: "Beta" }]}
  events={[
    { id: "a", team: "design", type: "research", title: "Interviews", start: "2026-01-12", end: "2026-02-06", milestone: "m1" },
    { id: "b", team: "eng", type: "build", title: "Core platform", start: "2026-02-09", end: "2026-04-17", dependsOn: ["a"], milestone: "m2", description: "…" },
  ]}
  today="2026-07-20"
/>
```

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `teams` | `{ id, name }[]` | Rows / team tiles |
| `milestones` | `{ id, name }[]` | In order; start and end are derived from their events |
| `events` | `RoadmapEvent[]` | `id, team, type, title, start, end, milestone`, optional `description`, `dependsOn` |
| `types` | `{ id, label, icon }[]` | Defaults to research / design / build / review / launch |
| `year` | `number` | Year shown as Q1–Q4 (default: year of `today`) |
| `today` | `string` (ISO) | Drives status and "Now" markers (default: current date) |
| `heading`, `subheading` | `ReactNode` | |
| `onSelect` | `(event) => void` | Fired when details open |
| `className` | `string` | Put your theme overrides here |

Status is derived: **Done** if `end` is before today, **In progress** if it has started, else **Planned**. Events are placed in the quarter they start.

## Theming

Override on `className`: `--tr-tile`, `--tr-ink`, `--tr-accent`, `--tr-accent-soft`, `--tr-line`, `--tr-muted`.
