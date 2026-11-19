import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PillsToDots, QuarterTimeline, TeamRoadmap, FlowChart } from "../src";
import type { FlowChartProps, PillItem, Quarter, RoadmapEvent, RoadmapMilestone, RoadmapTeam } from "../src";

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

const roadmapTeams: RoadmapTeam[] = [
  { id: "product", name: "Product" },
  { id: "eng", name: "Engineering" },
  { id: "design", name: "Design" },
  { id: "gtm", name: "Go-to-market" },
];
const roadmapMilestones: RoadmapMilestone[] = [
  { id: "m1", name: "Discovery" },
  { id: "m2", name: "Foundations" },
  { id: "m3", name: "Private beta" },
  { id: "m4", name: "Product-market fit" },
  { id: "m5", name: "General availability" },
];
const roadmapEvents: RoadmapEvent[] = [
  { id: "p1", team: "product", type: "research", title: "Customer interviews", start: "2026-01-12", end: "2026-02-06", dependsOn: [], milestone: "m1", description: "Thirty discovery calls across target segments to map jobs, pains and current workarounds." },
  { id: "p2", team: "product", type: "research", title: "Market sizing", start: "2026-01-26", end: "2026-02-13", dependsOn: [], milestone: "m1", description: "Top-down and bottom-up sizing to validate the opportunity." },
  { id: "d1", team: "design", type: "research", title: "Competitive audit", start: "2026-01-19", end: "2026-02-06", dependsOn: [], milestone: "m1", description: "Teardown of six alternatives: flows, pricing signals and gaps." },
  { id: "e1", team: "eng", type: "research", title: "Feasibility spike", start: "2026-01-26", end: "2026-02-20", dependsOn: [], milestone: "m1", description: "Prove the riskiest technical assumptions with throwaway code." },
  { id: "p3", team: "product", type: "review", title: "Problem brief review", start: "2026-02-16", end: "2026-02-20", dependsOn: ['p1', 'p2'], milestone: "m1", description: "Leadership sign-off on the problem statement and target user." },
  { id: "d2", team: "design", type: "design", title: "Design principles & concepts", start: "2026-02-23", end: "2026-03-20", dependsOn: ['d1', 'p3'], milestone: "m2", description: "Principles, three concept directions and early critique." },
  { id: "e2", team: "eng", type: "build", title: "Core platform", start: "2026-03-02", end: "2026-04-17", dependsOn: ['e1', 'p3'], milestone: "m2", description: "Foundational services, data model and CI/CD." },
  { id: "p4", team: "product", type: "design", title: "PRD & roadmap", start: "2026-02-23", end: "2026-03-13", dependsOn: ['p3'], milestone: "m2", description: "Requirements, scope cuts and a sequenced roadmap." },
  { id: "d3", team: "design", type: "design", title: "Prototype v1", start: "2026-03-23", end: "2026-04-10", dependsOn: ['d2'], milestone: "m2", description: "Clickable prototype for usability testing." },
  { id: "g1", team: "gtm", type: "research", title: "Positioning draft", start: "2026-03-09", end: "2026-04-03", dependsOn: ['p3'], milestone: "m2", description: "Audience, narrative and messaging hypotheses." },
  { id: "p5", team: "product", type: "review", title: "Foundations review", start: "2026-04-20", end: "2026-04-24", dependsOn: ['e2', 'd3', 'p4'], milestone: "m2", description: "Go / no-go on investing in the beta." },
  { id: "e3", team: "eng", type: "build", title: "Beta build", start: "2026-04-27", end: "2026-06-05", dependsOn: ['e2', 'p5'], milestone: "m3", description: "Feature-complete build for invited users." },
  { id: "d4", team: "design", type: "design", title: "Beta UI kit", start: "2026-04-27", end: "2026-05-22", dependsOn: ['d3', 'p5'], milestone: "m3", description: "Component library and production-ready screens." },
  { id: "g2", team: "gtm", type: "launch", title: "Beta recruitment", start: "2026-05-04", end: "2026-06-05", dependsOn: ['g1', 'p5'], milestone: "m3", description: "Waitlist, outreach and onboarding of beta accounts." },
  { id: "e4", team: "eng", type: "review", title: "Security review", start: "2026-06-08", end: "2026-06-12", dependsOn: ['e3'], milestone: "m3", description: "Threat model and penetration test sign-off." },
  { id: "g3", team: "gtm", type: "launch", title: "Private beta launch", start: "2026-06-15", end: "2026-06-19", dependsOn: ['e4', 'g2'], milestone: "m3", description: "Invite the first cohort and open feedback channels." },
  { id: "p6", team: "product", type: "research", title: "Beta feedback synthesis", start: "2026-06-22", end: "2026-07-24", dependsOn: ['g3'], milestone: "m4", description: "Cluster feedback, usage and retention signals." },
  { id: "e5", team: "eng", type: "build", title: "Iteration sprints", start: "2026-06-22", end: "2026-08-28", dependsOn: ['g3'], milestone: "m4", description: "Fast cycles on the highest-impact feedback themes." },
  { id: "d5", team: "design", type: "design", title: "Onboarding redesign", start: "2026-07-06", end: "2026-08-14", dependsOn: ['g3'], milestone: "m4", description: "Reduce time-to-value for new accounts." },
  { id: "g4", team: "gtm", type: "research", title: "Pricing & packaging", start: "2026-07-13", end: "2026-08-21", dependsOn: ['g3'], milestone: "m4", description: "Willingness-to-pay research and plan structure." },
  { id: "p7", team: "product", type: "review", title: "PMF review", start: "2026-09-01", end: "2026-09-04", dependsOn: ['p6', 'e5', 'd5'], milestone: "m4", description: "Decide whether retention and demand justify launch." },
  { id: "e6", team: "eng", type: "build", title: "Scale & hardening", start: "2026-09-07", end: "2026-10-30", dependsOn: ['p7'], milestone: "m5", description: "Load, reliability and observability work." },
  { id: "d6", team: "design", type: "design", title: "Launch assets", start: "2026-09-07", end: "2026-10-09", dependsOn: ['p7', 'g4'], milestone: "m5", description: "Website, product tour and sales collateral." },
  { id: "g5", team: "gtm", type: "launch", title: "GA campaign", start: "2026-10-12", end: "2026-11-20", dependsOn: ['d6', 'g4'], milestone: "m5", description: "Coordinated campaign across channels and partners." },
  { id: "e7", team: "eng", type: "review", title: "Launch readiness review", start: "2026-11-02", end: "2026-11-06", dependsOn: ['e6'], milestone: "m5", description: "Final checklist across reliability, support and legal." },
  { id: "g6", team: "gtm", type: "launch", title: "General availability", start: "2026-11-23", end: "2026-11-27", dependsOn: ['e7', 'g5'], milestone: "m5", description: "Open the product to everyone." },
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

const flowChart: FlowChartProps = {
  stages: [
    { title: "Inputs", description: "What we receive, and when" },
    { title: "Process", description: "How it comes together" },
    { title: "Outputs", description: "What gets delivered" },
  ],
  lists: [
    { id: "intake", highlight: true, then: "Validated", items: [
      { title: "Customer research", eta: "Aug 12" },
      { title: "Usage data export", eta: "Aug 19" },
      { title: "Stakeholder briefs", eta: "Aug 26" },
      { title: "Brand assets", eta: "Sep 2" },
    ]},
    { id: "build", items: [
      { title: "Prototype v1", eta: "Sep 16" },
      { title: "Usability notes", eta: "Sep 23" },
      { title: "Final specs", eta: "Oct 7" },
    ]},
  ],
  inputs: [
    { id: "docs", highlight: true, text: "Existing documentation and decisions made so far." },
    { id: "market", linked: false, text: "Market and competitor snapshots for context." },
    { id: "capacity", text: "Team capacity, budget and known constraints." },
  ],
  combine: { id: "plan", highlight: true, title: "Working plan", text: "Everything is merged into a single plan with owners, dependencies and dates, reviewed weekly." },
  addon: { id: "guard", title: "Guardrails & approvals" },
  outputs: [
    { id: "report", label: "Report", text: "A written summary of findings, decisions and open questions." },
    { id: "dash", label: "Dashboard", text: "A live view of progress against the plan." },
  ],
  footer: "Quarterly review",
  feedback: "Lessons learned",
  highlightLabel: "In scope this quarter",
};

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
            style={{ display: "inline-flex", alignItems: "center", height: 44, padding: "0 22px", borderRadius: 999, background: "#e60000", color: "#fff", textDecoration: "none", fontSize: 15 }}
          >
            View on GitHub
          </a>
        }
      />
      <div style={{ ...page, padding: "72px 24px" }}>
        <QuarterTimeline quarters={quarters} />
      </div>
      <div style={{ ...page, padding: "72px 24px 120px" }}>
        <TeamRoadmap teams={roadmapTeams} milestones={roadmapMilestones} events={roadmapEvents} today="2026-07-20" />
      </div>
      <div style={{ ...page, maxWidth: 1280, padding: "72px 24px 120px" }}>
        <FlowChart {...flowChart} />
      </div>
    </div>
  </StrictMode>,
);
