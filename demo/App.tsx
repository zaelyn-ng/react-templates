import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FlowChart, PillsToDots, QuarterTimeline, TeamRoadmap } from "../src";
import { docs } from "./docs";
import type { Doc } from "./docs";
import { dotPositions, flowChart, pillItems, quarters, roadmapEvents, roadmapMilestones, roadmapTeams } from "./data";

const REPO = "https://github.com/zaelyn-ng/react-templates";

/* ---------- tiny inline formatter: **bold** and `code` ---------- */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
        p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith("`") ? <code key={i}>{p.slice(1, -1)}</code> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

function Code({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="code">
      <button
        className="copy"
        onClick={() => {
          navigator.clipboard?.writeText(code).then(() => { setDone(true); setTimeout(() => setDone(false), 1400); });
        }}
      >
        {done ? "Copied" : "Copy"}
      </button>
      <pre><code>{code}</code></pre>
    </div>
  );
}

/* ---------- routing (hash based, works on GitHub Pages) ---------- */
function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "");
  const [slug, setSlug] = useState(read);
  useEffect(() => {
    const on = () => { setSlug(read()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return slug;
}

/* ---------- live demos ---------- */
function Demo({ slug }: { slug: string }) {
  switch (slug) {
    case "quarter-timeline": return <QuarterTimeline quarters={quarters} />;
    case "team-roadmap": return <TeamRoadmap teams={roadmapTeams} milestones={roadmapMilestones} events={roadmapEvents} today="2026-07-20" />;
    case "flow-chart": return <FlowChart {...flowChart} />;
    default: return null;
  }
}

function Preview({ slug }: { slug: string }) {
  const [w, setW] = useState<number | null>(null);
  const sizes: [string, number | null][] = [["Fit", null], ["Tablet", 768], ["Mobile", 390]];
  return (
    <section className="block">
      <div className="blockhead">
        <h2>Preview</h2>
        <div className="seg" role="group" aria-label="Preview width">
          {sizes.map(([l, v]) => (
            <button key={l} aria-pressed={w === v} onClick={() => setW(v)}>{l}{v ? <small> {v}px</small> : null}</button>
          ))}
        </div>
      </div>
      <div className="stage">
        <div className="frame" style={{ width: w ?? "100%" }}>
          <Demo slug={slug} />
        </div>
      </div>
    </section>
  );
}

/* ---------- pages ---------- */
function WidgetPage({ d }: { d: Doc }) {
  const prefix = d.theme[0].name.replace(/^(--\w+)-.*/, "$1");
  const sample = `.my-${d.slug} {\n${d.theme.slice(0, 3).map((t) => `  ${t.name}: ${t.name.endsWith("accent") ? "#e60000" : "…"};`).join("\n")}\n}`;
  return (
    <article className="page">
      <div className="crumbs"><a href="#/">Overview</a><span>/</span>Widgets<span>/</span><b>{d.name}</b></div>
      <h1>{d.name}</h1>
      <p className="lede">{d.tagline}</p>
      <div className="tags">{d.tags.map((t) => <span key={t}>{t}</span>)}<a href={`${REPO}/tree/main/src/${d.name}`} target="_blank" rel="noreferrer">View source ↗</a></div>

      {d.slug === "pills-to-dots" ? (
        <section className="block">
          <div className="blockhead"><h2>Preview</h2><span className="hintline">Scroll down to play it ↓</span></div>
          <div className="heroframe">
            <PillsToDots
              items={pillItems}
              dotPositions={dotPositions}
              scrollLength={900}
              headingLevel={2}
              heading="Your headline goes here, in two or three lines."
              description="A short supporting sentence for the hero. Replace this placeholder copy with your own."
              actions={<a className="cta" href={REPO}>View on GitHub</a>}
            />
          </div>
        </section>
      ) : (
        <Preview slug={d.slug} />
      )}

      <section className="block">
        <h2>Overview</h2>
        {d.intro.map((p, i) => <p key={i}><Rich text={p} /></p>)}
        <h3>How it works</h3>
        <ul className="how">{d.how.map((p, i) => <li key={i}><Rich text={p} /></li>)}</ul>
      </section>

      <section className="block">
        <h2>Usage</h2>
        <Code code={d.usage} />
      </section>

      <section className="block">
        <h2>Props</h2>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              {d.props.map((p) => (
                <tr key={p.name}>
                  <td><code>{p.name}</code></td>
                  <td><code className="type">{p.type}</code></td>
                  <td>{p.def ? <code>{p.def}</code> : <span className="dash">–</span>}</td>
                  <td><Rich text={p.desc} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="block">
        <h2>Theming</h2>
        <p>Colours are CSS custom properties scoped to the widget (<code>{prefix}-*</code>). Override them on the <code>className</code> you pass in.</p>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Variable</th><th>Controls</th></tr></thead>
            <tbody>{d.theme.map((t) => <tr key={t.name}><td><code>{t.name}</code></td><td>{t.desc}</td></tr>)}</tbody>
          </table>
        </div>
        <Code code={sample} />
        {d.notes.map((n, i) => <p key={i} className="note"><Rich text={n} /></p>)}
      </section>
    </article>
  );
}

function Overview() {
  return (
    <article className="page">
      <div className="crumbs"><b>Overview</b></div>
      <h1>react-templates</h1>
      <p className="lede">Reusable React widgets for landing pages. Each one is a self-contained, props-driven section you can drop into a page, restyle with CSS variables and wire to your own data.</p>
      <div className="tags"><span>TypeScript</span><span>CSS Modules</span><span>No runtime deps</span><a href={REPO} target="_blank" rel="noreferrer">GitHub ↗</a></div>

      <section className="block">
        <h2>Widgets</h2>
        <div className="cards">
          {docs.map((d) => (
            <a key={d.slug} className="card" href={`#/${d.slug}`}>
              <span className="cardtags">{d.tags.join(" · ")}</span>
              <strong>{d.name}</strong>
              <span>{d.tagline}</span>
              <i aria-hidden>↗</i>
            </a>
          ))}
        </div>
      </section>

      <section className="block">
        <h2>Getting started</h2>
        <p><strong>Copy and paste.</strong> Each folder in <code>src/</code> is self-contained. Copy it into your app, import the component and edit it freely.</p>
        <p><strong>As a package.</strong> Build the library and import from it:</p>
        <Code code={`git clone ${REPO}\ncd react-templates && npm install\nnpm run build`} />
        <Code code={`import { QuarterTimeline, PillsToDots, TeamRoadmap, FlowChart } from "react-templates";\nimport "react-templates/style.css";`} />
      </section>

      <section className="block">
        <h2>Principles</h2>
        <ul className="how">
          <li><strong>Props over hard-coding.</strong> Content, labels and data come in as props.</li>
          <li><strong>Themeable.</strong> Colours are CSS variables scoped per widget (<code>--qt-*</code>, <code>--pd-*</code>, <code>--tr-*</code>, <code>--fc-*</code>).</li>
          <li><strong>Fonts and layout are yours.</strong> Widgets inherit <code>font-family</code> and fill their container. No global styles, no resets.</li>
          <li><strong>Accessible by default.</strong> Real buttons, keyboard support, native <code>&lt;dialog&gt;</code> for modals, <code>prefers-reduced-motion</code> respected.</li>
        </ul>
      </section>
    </article>
  );
}

export function App() {
  const slug = useRoute();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [slug]);
  const doc = docs.find((d) => d.slug === slug);
  const link = (href: string, label: ReactNode, on: boolean) => <a key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{label}</a>;
  useEffect(() => { document.title = (doc ? doc.name + " · " : "") + "react-templates"; }, [doc]);
  return (
    <div className="site">
      <header className="topbar">
        <a className="brand" href="#/"><i />react-templates</a>
        <button className="burger" aria-expanded={menu} aria-label="Toggle navigation" onClick={() => setMenu((v) => !v)}>☰</button>
      </header>
      <aside className={"side" + (menu ? " open" : "")}>
        <a className="brand" href="#/"><i />react-templates</a>
        <nav aria-label="Documentation">
          <div className="group">Getting started</div>
          {link("#/", "Overview", !doc)}
          <div className="group">Widgets</div>
          {docs.map((d) => link(`#/${d.slug}`, d.name, d.slug === slug))}
        </nav>
        <a className="gh" href={REPO} target="_blank" rel="noreferrer">GitHub ↗</a>
      </aside>
      <main>{doc ? <WidgetPage key={doc.slug} d={doc} /> : <Overview />}</main>
    </div>
  );
}
