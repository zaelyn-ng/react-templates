import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PillsToDots, QuarterTimeline } from "../src";
import type { PillItem, Quarter } from "../src";

const pillItems: PillItem[] = [
  { label: "strategy", icon: "plus" },
  { label: "research", icon: "search" },
  { label: "prototyping", icon: "spark" },
  { label: "design systems", icon: "layers" },
  { label: "automation", icon: "chip" },
  { label: "analytics", icon: "chart" },
  { label: "integrations", icon: "link" },
  { label: "ai agents", icon: "spark" },
  { label: "data pipelines", icon: "wave" },
];
// [x fraction of panel width, y px from panel top]; each dot sits at or above its own pill's row
const dotPositions: [number, number][] = [
  [0.84, 46], [0.22, 70], [0.55, 110], [0.85, 150], [0.18, 190], [0.6, 235], [0.3, 290], [0.8, 300], [0.5, 380],
];

const quarters: Quarter[] = [
  { name: "Q1", year: "2026", state: "done", items: [
    { title: "Launch onboarding revamp", icon: "rocket", status: "shipped", owner: "Growth", date: "Feb 12", description: "A shorter first-run flow that gets new teams to their first booked meeting in under five minutes.", why: "Activation was the biggest drop-off in the funnel last year." },
    { title: "Smart calendar sync v2", icon: "cal", status: "shipped", owner: "Platform", date: "Mar 3", description: "Two-way sync that resolves conflicts automatically across multiple calendars.", why: "Double bookings were the top support ticket category." },
  ]},
  { name: "Q2", year: "2026", state: "done", items: [
    { title: "Team analytics dashboard", icon: "doc", status: "shipped", owner: "Insights", date: "May 8", description: "See meeting load, focus time and response patterns across the team in one place.", why: "Managers asked for visibility without micromanaging." },
    { title: "Mobile quick actions", icon: "bolt", status: "shipped", owner: "Mobile", date: "Jun 20", description: "Reschedule, decline and protect time straight from a notification.", why: "Most reschedules happen on the go." },
    { title: "Chat integration", icon: "chat", status: "shipped", owner: "Integrations", date: "Jun 28", description: "Status, focus time and booking links inside your team chat.", why: "Meets people where they already work." },
  ]},
  { name: "Q3", year: "2026", state: "now", items: [
    { title: "AI agent templates", icon: "star", status: "progress", owner: "AI", date: "Sep 15", description: "One-click agents for habits, focus blocks and meeting prep, with an editable prompt.", why: "Lets people automate their week without learning a new tool." },
    { title: "Defend coding time", icon: "code", status: "progress", owner: "AI", date: "Sep 30", description: "Protects uninterrupted blocks for deep work and moves low-priority meetings around them.", why: "Engineers lose the most hours to fragmented days." },
  ]},
  { name: "Q4", year: "2026", state: "upcoming", items: [
    { title: "Wellbeing insights", icon: "heart", status: "planned", owner: "Insights", date: "Nov", description: "Early signals for overload: back-to-back streaks, late-night meetings, missing breaks.", why: "Prevent burnout before it shows up in attrition." },
    { title: "Public API", icon: "code", status: "planned", owner: "Platform", date: "Dec", description: "Read and write scheduling data so teams can build their own workflows.", why: "Top request from larger customers." },
    { title: "Year-in-review", icon: "star", status: "planned", owner: "Growth", date: "Dec", description: "A shareable summary of how time was spent over the year.", why: "Good retention moment and easy to share." },
  ]},
];

const page = { maxWidth: 1180, margin: "0 auto", padding: "0 24px" } as const;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div style={{ fontFamily: "Poppins, system-ui, sans-serif", background: "#fff" }}>
      <PillsToDots
        items={pillItems}
        dotPositions={dotPositions}
        heading="Your headline goes here, in two or three lines."
        description="A short supporting sentence for the hero. Replace this placeholder copy with your own."
        actions={
          <a
            href="https://github.com/zaelyn-ng/react-templates"
            style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 22px", borderRadius: 999, background: "#ea6038", color: "#fff", textDecoration: "none", fontSize: 15 }}
          >
            View on GitHub
          </a>
        }
      />
      <div style={{ ...page, padding: "72px 24px" }}>
        <QuarterTimeline quarters={quarters} />
      </div>
    </div>
  </StrictMode>,
);
