import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AvailabilityPicker, QuarterTimeline } from "../src";
import type { Quarter, Schedule } from "../src";

const schedule: Schedule = {
  Mon: [
    { start: 9, end: 10, title: "Team standup", status: "busy" },
    { start: 10, end: 12, title: "Focus time", status: "busy" },
    { start: 12, end: 13, title: "Lunch", status: "busy" },
    { start: 13, end: 14, title: "1:1", status: "busy" },
    { start: 14, end: 15, status: "free" },
    { start: 15, end: 16, title: "Launch sync", status: "busy" },
    { start: 16, end: 18, status: "free" },
  ],
  Tue: [
    { start: 9, end: 10.5, title: "Design review", status: "busy" },
    { start: 10.5, end: 12, status: "free" },
    { start: 12, end: 13, title: "Lunch", status: "busy" },
    { start: 13, end: 14, status: "free" },
    { start: 14, end: 16, title: "Workshop", status: "busy" },
    { start: 16, end: 17, status: "free" },
    { start: 17, end: 18, title: "Inbox zero", status: "busy" },
  ],
  Wed: [
    { start: 9, end: 11, status: "free" },
    { start: 11, end: 12, title: "Customer call", status: "busy" },
    { start: 12, end: 13, title: "Lunch", status: "busy" },
    { start: 13, end: 15, title: "Focus time", status: "busy" },
    { start: 15, end: 16, status: "free" },
    { start: 16, end: 17, title: "Planning", status: "busy" },
  ],
  Thu: [
    { start: 9, end: 9.5, title: "Standup", status: "busy" },
    { start: 9.5, end: 11, status: "free" },
    { start: 11, end: 12, title: "Interview", status: "busy" },
    { start: 12, end: 13, title: "Lunch", status: "busy" },
    { start: 13, end: 14, status: "free" },
    { start: 14, end: 15.5, title: "Roadmap", status: "busy" },
    { start: 15.5, end: 18, status: "free" },
  ],
  Fri: [
    { start: 9, end: 10, status: "free" },
    { start: 10, end: 11, title: "Demo prep", status: "busy" },
    { start: 11, end: 12, status: "free" },
    { start: 12, end: 13, title: "Lunch", status: "busy" },
    { start: 13, end: 16, title: "Focus time", status: "busy" },
  ],
};

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
      <div style={{ ...page, padding: "72px 24px" }}>
        <QuarterTimeline quarters={quarters} />
      </div>
      <div style={{ background: "#f5f3ee", padding: "72px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <AvailabilityPicker schedule={schedule} now={{ day: "Mon", hour: 13.4 }} />
        </div>
      </div>
    </div>
  </StrictMode>,
);
