# FlowChart

A three-stage flow diagram in the same tile style as the other widgets. Everything is driven by props, and the connector lines are measured from the rendered boxes, so they stay attached when text wraps or the width changes.

| Piece | Looks like | Use it for |
| --- | --- | --- |
| `lists` | Tinted box with rows, each with an estimated-delivery chip | A list of items that each have an ETA |
| `inputs`, `combine`, `addon`, `outputs[].text` | Grey tile | Plain text items |
| `stages[].title`, `description`, `outputs[].label`, `footer`, `feedback`, `lists[].then` | Dark one-line label | Names and short labels |
| `highlight: true` | Dashed accent outline | Calling attention to a box (add `highlightLabel` for a legend) |
| `linked: false` on an input | No connector into `combine` | Context items that don't feed the combine box |
| `compactBelow`, `onSelect` | – | See Responsive / Interactive below |
| `addon` | Narrow tall box joined with a **+** (text runs vertically) | A second thing that goes into the outputs |
| `footer` + `feedback` | Strip under the outputs, plus a loop line back into `combine` | Review / feedback loops |

Layout: **stage 1** (lists, joined top-to-bottom by `then` labels) → **stage 2** (inputs merge into `combine`, `+ addon`) → **stage 3** (outputs).

```tsx
import { FlowChart } from "react-templates";
import "react-templates/style.css";

<FlowChart
  stages={[
    { title: "Inputs", description: "What we receive, and when" },
    { title: "Process", description: "How it comes together" },
    { title: "Outputs", description: "What gets delivered" },
  ]}
  lists={[{ id: "intake", highlight: true, then: "Validated", items: [{ title: "Customer research", eta: "Aug 12" }] }]}
  inputs={[{ id: "docs", text: "Existing documentation." }]}
  combine={{ id: "plan", title: "Working plan", text: "…" }}
  addon={{ id: "guard", title: "Guardrails & approvals" }}
  outputs={[{ id: "report", label: "Report", text: "…" }]}
  footer="Quarterly review"
  feedback="Lessons learned"
/>
```

## Responsive

The chart reflows by the width of **its own container** (not the window): below `compactBelow` (default 990px) it becomes a stacked layout – stage by stage, with "feeds …" notes on linked inputs and a feedback tag at the end. Connector lines are only drawn in the wide layout.

## Interactive

- **Click** (or Enter / Space) any box to trace its path: everything upstream and downstream is highlighted, the connecting lines turn red and the rest dims. Click again, click empty space or press **Esc** to clear. The feedback loop lights up when it is part of the path.
- With `highlightLabel` set, the legend becomes a **Focus** toggle that dims everything that isn't dashed-outlined.
- `onSelect(id | null)` reports the selection. Ids are `list-<id>`, `in-<id>`, `combine`, `addon`, `out-<id>` and `footer`.

## Theming

Override on `className`: `--fc-tile`, `--fc-ink`, `--fc-accent`, `--fc-accent-soft`, `--fc-accent-line`, `--fc-line`, `--fc-muted`.
