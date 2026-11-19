export interface Prop { name: string; type: string; def?: string; desc: string }
export interface Doc {
  slug: string;
  name: string;
  tagline: string;
  tags: string[];
  intro: string[];
  how: string[];
  usage: string;
  props: Prop[];
  theme: { name: string; desc: string }[];
  notes: string[];
}

export const docs: Doc[] = [
  {
    slug: "pills-to-dots",
    name: "PillsToDots",
    tagline: "A scroll-driven hero: a stack of pills collapses into dots, then converges into one circle with an arrow.",
    tags: ["Hero", "Scroll-driven"],
    intro: [
      "Use it at the very top of a landing page. The hero pins in the middle of the screen while the animation plays, then scrolls away to reveal the next section.",
    ],
    how: [
      "The section is as tall as the viewport plus `scrollLength`; the hero row sticks to the top of it.",
      "Scroll progress is smoothed with frame-rate-independent damping, then each pill gets its own overlapping phase (collapse → drift → converge → arrow).",
      "Layout is only measured on load and resize, so scrolling never causes reflow. Reduced-motion users get the final state.",
    ],
    usage: `import { PillsToDots } from "react-templates";
import "react-templates/style.css";

<PillsToDots
  heading="Your headline goes here"
  description="A short supporting sentence."
  actions={<a href="/contact">Get in touch</a>}
  items={[
    { label: "strategy", icon: "plus" },
    { label: "research", icon: "search" },
    { label: "automation", icon: "chip" },
  ]}
/>`,
    props: [
      { name: "items", type: "{ label, icon? }[]", desc: "Required. 5–10 looks best. `icon` is a built-in name or your own element." },
      { name: "heading", type: "ReactNode", desc: "Required. Rendered as <h1>, or <h2> with `headingLevel={2}`." },
      { name: "description", type: "ReactNode", desc: "Text under the heading." },
      { name: "actions", type: "ReactNode", desc: "Buttons or links under the text." },
      { name: "direction", type: '"collapse" | "expand"', def: '"collapse"', desc: '"expand" plays the animation in reverse.' },
      { name: "scrollLength", type: "number", def: "1400", desc: "Pixels of scrolling the animation takes while pinned." },
      { name: "startDelay", type: "number", def: "150", desc: "Pixels of scrolling before anything moves." },
      { name: "smoothRate", type: "number", def: "9", desc: "Higher follows the scrollbar tighter, lower is floatier, 0 disables smoothing." },
      { name: "overlap", type: "number", def: "1.2", desc: "How much neighbouring pills overlap. 0 is strictly one by one." },
      { name: "pillsEnd", type: "number", def: "0.68", desc: "Share of the scroll spent turning pills into dots." },
      { name: "arrowAt", type: "number", def: "0.88", desc: "Progress at which the arrow starts drawing." },
      { name: "dotPositions", type: "[xFraction, yPx][]", def: "auto", desc: "Where each dot lands. Keep each dot's y at or above its own pill's row." },
      { name: "onProgress", type: "(p: number) => void", desc: "Called with progress 0–1 as it changes." },
      { name: "className", type: "string", desc: "For theming." },
    ],
    theme: [
      { name: "--pd-ink", desc: "Text, dark circles, big circle" },
      { name: "--pd-panel", desc: "Panel background" },
      { name: "--pd-pill", desc: "Pill background" },
      { name: "--pd-tile", desc: "Icon tile before it turns dark" },
      { name: "--pd-gray", desc: "Pill background while collapsing" },
      { name: "--pd-arrow", desc: "Arrow colour" },
      { name: "--pd-bg", desc: "Background of the pinned row" },
    ],
    notes: ["Built-in icons: plus, spark, chip, chart, link, wave, layers, search. Pass your own element (use currentColor) for anything else."],
  },
  {
    slug: "quarter-timeline",
    name: "QuarterTimeline",
    tagline: "A horizontal roadmap by quarter. Every tile opens a detail modal with previous / next navigation.",
    tags: ["Roadmap", "Modal"],
    intro: ["A simple, scannable roadmap: one column per quarter with a progress rail, and a tile per item showing status and date."],
    how: [
      "Quarters render as columns joined by a rail that fills up to the current quarter (`state: \"now\"`).",
      "Clicking a tile opens a native <dialog> with the description, why it matters, owner, and a follow button.",
      "Arrow keys move between items in the modal; Esc, focus trapping and focus restore come from <dialog>.",
    ],
    usage: `import { QuarterTimeline } from "react-templates";
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
/>`,
    props: [
      { name: "quarters", type: "Quarter[]", desc: "Required. `{ name, year, state?, items }` – state is done, now or upcoming." },
      { name: "quarters[].items", type: "TimelineItem[]", desc: "`{ title, icon, status, owner, date, description, why }` – status is shipped, progress or planned." },
      { name: "heading", type: "string", def: '"Roadmap by quarter"', desc: "Section title." },
      { name: "subheading", type: "string", desc: "Text under the title." },
      { name: "onFollow", type: "(item, following) => void", desc: "Fired when the follow button is toggled." },
      { name: "onOpen", type: "(item) => void", desc: "Fired when a tile's modal opens." },
      { name: "className", type: "string", desc: "For theming." },
    ],
    theme: [
      { name: "--qt-accent", desc: "Highlights, progress rail, links" },
      { name: "--qt-accent-soft", desc: "Soft tint for badges and the now node" },
      { name: "--qt-tile", desc: "Tile background" },
      { name: "--qt-ink", desc: "Text colour" },
      { name: "--qt-line", desc: "Rail and borders" },
      { name: "--qt-muted", desc: "Secondary text" },
    ],
    notes: ["`icon` is a built-in name (bolt, heart, code, rocket, doc, cal, chat, star) or your own React element."],
  },
  {
    slug: "team-roadmap",
    name: "TeamRoadmap",
    tagline: "A multi-team roadmap: overview, per-team quarters, milestones and event dependencies, with details below the timeline.",
    tags: ["Roadmap", "Dependencies", "Milestones"],
    intro: ["Built for programmes where several teams deliver towards shared milestones. It uses the same tile style as QuarterTimeline and is a separate widget."],
    how: [
      "**By team → Overview:** one tile per team with progress. Click a team to see its events by quarter; “← All teams” goes back.",
      "**By team → All events:** every team and quarter in one grid.",
      "**By milestone:** a rail of milestones with start → end dates (derived from their events) and progress; pick one to see its events.",
      "Click a tile to open its details below the timeline. Its dependency chain is highlighted; following “Depends on” or “Blocks” builds a breadcrumb so you can go back to the event you started from.",
      "Type chips filter every view. Esc closes the details.",
    ],
    usage: `import { TeamRoadmap } from "react-templates";
import "react-templates/style.css";

<TeamRoadmap
  teams={[{ id: "eng", name: "Engineering" }, { id: "design", name: "Design" }]}
  milestones={[{ id: "m1", name: "Discovery" }, { id: "m2", name: "Beta" }]}
  events={[
    { id: "a", team: "design", type: "research", title: "Interviews",
      start: "2026-01-12", end: "2026-02-06", milestone: "m1" },
    { id: "b", team: "eng", type: "build", title: "Core platform",
      start: "2026-02-09", end: "2026-04-17", dependsOn: ["a"], milestone: "m2" },
  ]}
  today="2026-07-20"
/>`,
    props: [
      { name: "teams", type: "{ id, name }[]", desc: "Required. Team tiles and rows." },
      { name: "milestones", type: "{ id, name }[]", desc: "Required. In order; start and end come from their events." },
      { name: "events", type: "RoadmapEvent[]", desc: "Required. `id, team, type, title, start, end, milestone`, optional `description`, `dependsOn`." },
      { name: "types", type: "{ id, label, icon }[]", def: "research, design, build, review, launch", desc: "Event types shown as filter chips and tile icons." },
      { name: "year", type: "number", desc: "Year shown as Q1–Q4. Defaults to the year of `today`." },
      { name: "today", type: "string (ISO)", def: "current date", desc: "Drives status (done / in progress / planned) and “Now” markers." },
      { name: "heading, subheading", type: "ReactNode", desc: "Section title and text." },
      { name: "onSelect", type: "(event) => void", desc: "Fired when an event's details open." },
      { name: "className", type: "string", desc: "For theming." },
    ],
    theme: [
      { name: "--tr-accent", desc: "Highlights, rails, selected chain" },
      { name: "--tr-accent-soft", desc: "Soft tint" },
      { name: "--tr-tile", desc: "Tile background" },
      { name: "--tr-ink", desc: "Text colour" },
      { name: "--tr-line", desc: "Rails and borders" },
      { name: "--tr-muted", desc: "Secondary text" },
    ],
    notes: ["Status is derived: Done if `end` is before today, In progress if started, otherwise Planned. Events sit in the quarter they start."],
  },
  {
    slug: "flow-chart",
    name: "FlowChart",
    tagline: "A responsive, three-stage flow diagram with timed lists, merge connectors, outputs and a feedback loop.",
    tags: ["Diagram", "Interactive", "Responsive"],
    intro: ["Describe a process as inputs → a combined step → outputs. Box types carry meaning, so the chart stays readable at a glance."],
    how: [
      "**Tinted boxes** are lists where each row has an estimated delivery chip. **Grey boxes** are plain text. **Dark labels** are one-line names.",
      "**Dashed outline** (`highlight: true`) calls out a box; with `highlightLabel` the legend becomes a Focus toggle that dims everything else.",
      "Connector lines are measured from the rendered boxes, so they stay attached when text wraps.",
      "Click (or Enter / Space) a box to trace its path: upstream and downstream boxes and lines turn red, the rest dims. Esc clears.",
      "Below `compactBelow` px of container width (default 990) it reflows into a stacked layout.",
    ],
    usage: `import { FlowChart } from "react-templates";
import "react-templates/style.css";

<FlowChart
  stages={[
    { title: "Inputs", description: "What we receive, and when" },
    { title: "Process", description: "How it comes together" },
    { title: "Outputs", description: "What gets delivered" },
  ]}
  lists={[{ id: "intake", highlight: true, then: "Validated",
            items: [{ title: "Customer research", eta: "Aug 12" }] }]}
  inputs={[{ id: "docs", text: "Existing documentation." }]}
  combine={{ id: "plan", title: "Working plan", text: "…" }}
  addon={{ id: "guard", title: "Guardrails & approvals" }}
  outputs={[{ id: "report", label: "Report", text: "…" }]}
  footer="Quarterly review"
  feedback="Lessons learned"
/>`,
    props: [
      { name: "stages", type: "[Stage, Stage, Stage]", desc: "Required. `{ title, description? }` for each column." },
      { name: "lists", type: "FlowList[]", desc: "Required. `{ id, items: { title, eta }[], title?, highlight?, then? }` – `then` labels the connector to the next list." },
      { name: "inputs", type: "FlowInput[]", desc: "Required. Grey boxes feeding `combine`. `linked: false` draws no connector." },
      { name: "combine", type: "FlowText", desc: "Required. The box the inputs merge into." },
      { name: "addon", type: "FlowText", desc: "Narrow box joined with a “+” (text runs vertically)." },
      { name: "outputs", type: "FlowOutput[]", desc: "Required. `{ id, label, text?, title? }`." },
      { name: "footer", type: "string", desc: "Strip under the outputs with a one-line label." },
      { name: "feedback", type: "string", desc: "With `footer`: a loop line back into `combine`, carrying this label." },
      { name: "highlightLabel", type: "string", desc: "Legend text for dashed outlines; makes the legend a Focus toggle." },
      { name: "compactBelow", type: "number", def: "990", desc: "Container width (px) below which the chart stacks." },
      { name: "onSelect", type: "(id | null) => void", desc: "Selected box id: list-<id>, in-<id>, combine, addon, out-<id>, footer." },
      { name: "className", type: "string", desc: "For theming." },
    ],
    theme: [
      { name: "--fc-accent", desc: "Highlights, traced path, dashed outlines" },
      { name: "--fc-accent-soft", desc: "Tint of list boxes" },
      { name: "--fc-accent-line", desc: "Borders inside list boxes" },
      { name: "--fc-line", desc: "Connector lines and chevrons" },
      { name: "--fc-tile", desc: "Grey box background" },
      { name: "--fc-ink", desc: "Dark labels and text" },
      { name: "--fc-muted", desc: "Secondary text" },
    ],
    notes: [],
  },
];
