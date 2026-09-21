import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Code2,
  Database,
  GitPullRequest,
  Monitor,
  Play,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import type { WebRoute } from "@/components/DesktopShell";

type HomePageProps = { onNavigate: (route: WebRoute) => void };

const terminalLines = [
  ["$", "velclaw build", "command"],
  ["✓", "workspace ready · 42 files", "success"],
  ["→", "tsc --noEmit", "violet"],
  ["✓", "typecheck passed in 0.8s", "success"],
  ["→", "vite build --mode preview", "violet"],
  ["✓", "dist generated · 3.4s", "success"],
];

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric-block"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function StatusCard({ icon: Icon, label, value, detail, tone }: { icon: typeof Code2; label: string; value: string; detail: string; tone: string }) {
  return (
    <div className="status-card">
      <div className="status-card-icon" style={{ color: tone, background: `${tone}16` }}><Icon size={16} /></div>
      <span className="status-card-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function FlowStep({ number, label, done, active, last }: { number: string; label: string; done?: boolean; active?: boolean; last?: boolean }) {
  return (
    <div className="flow-step">
      <div className="flow-node-wrap">
        <div className={`flow-node ${done ? "done" : ""} ${active ? "active" : ""}`}>{done ? <Check size={14} /> : number}</div>
        {!last && <div className={`flow-line ${done ? "done" : ""}`} />}
      </div>
      <div className={`flow-step-label ${active ? "active" : ""}`}><strong>{label}</strong><span>{number}</span></div>
    </div>
  );
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);
  const [toast, setToast] = useState("Workspace ready");
  const [panel, setPanel] = useState<"overview" | "runtime">("overview");

  useEffect(() => {
    if (!toast || toast === "Workspace ready") return;
    const timer = window.setTimeout(() => setToast("Workspace ready"), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const runBuild = () => {
    if (building) return;
    setBuilding(true);
    setBuilt(false);
    setToast("Running typecheck and preview build...");
    window.setTimeout(() => {
      setBuilding(false);
      setBuilt(true);
      setToast("Build successful · preview is ready");
    }, 1400);
  };

  return (
    <div className="home-page">
      <div className="page-heading home-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> MONDAY · 21 SEPTEMBER 2026</div>
          <h1>Ship ideas, <em>not setup.</em></h1>
          <p>Agent, code, build and deploy from one focused desktop workspace.</p>
        </div>
        <div className="heading-actions">
          <button className="button button-quiet" type="button" onClick={() => setToast("No new notifications")}>Notifications <span className="notification-count">2</span></button>
          <button className="button button-primary" type="button" onClick={() => onNavigate("/projects")}><GitPullRequest size={16} /> Open project</button>
        </div>
      </div>

      <div className="status-strip"><span className="status-live"><i />{toast}</span><span className="status-branch">main <span>·</span> healthy</span></div>

      <section className="project-hero">
        <div className="hero-main">
          <div className="hero-topline"><span className="overline">ACTIVE PROJECT</span><span className="health-pill"><i /> HEALTHY</span></div>
          <div className="hero-title-row"><h2>starter-vite-tsx</h2><span className="project-badge">PREVIEW</span></div>
          <p className="hero-description">React + TypeScript starter <span>·</span> preview branch connected</p>
          <div className="metric-row">
            <Metric label="FILES" value="42" note="across workspace" />
            <Metric label="LAST BUILD" value="3.4s" note="passed 8m ago" />
            <Metric label="UPTIME" value="99.9%" note="last 30 days" />
          </div>
          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={runBuild} disabled={building}><Play size={15} fill="currentColor" />{building ? "Building..." : built ? "Run again" : "Run build"}</button>
            <button className="button button-dark" type="button" onClick={() => setToast("Preview branch is waiting for approval")}><ArrowUpRight size={15} /> Preview</button>
            <span className="build-note">{built ? <><CheckCircle2 size={14} /> Build passed just now</> : <><Zap size={14} /> Ready to ship</>}</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-grid" />
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="visual-core"><Terminal size={26} /><span>V</span></div>
          <div className="visual-label visual-label-top"><Activity size={13} /> LIVE PREVIEW</div>
          <div className="visual-label visual-label-bottom">vite / tsx <span>↗</span></div>
        </div>
      </section>

      <div className="shortcut-row">
        <button type="button" onClick={() => onNavigate("/projects")}><span className="shortcut-icon purple"><GitPullRequest size={17} /></span><span><strong>GitHub projects</strong><small>repo · branch</small></span><ArrowUpRight size={15} /></button>
        <button type="button" onClick={() => onNavigate("/files")}><span className="shortcut-icon teal"><Code2 size={17} /></span><span><strong>File explorer</strong><small>42 files · AI review</small></span><ArrowUpRight size={15} /></button>
        <button type="button" onClick={() => setToast("Agent context is ready") }><span className="shortcut-icon amber"><Sparkles size={17} /></span><span><strong>Agent context</strong><small>synced · 2 minutes ago</small></span><ArrowUpRight size={15} /></button>
      </div>

      <section className="section-block">
        <div className="section-heading"><div><div className="section-kicker">SYSTEM OVERVIEW</div><h2>Workspace pulse</h2><p>One view for every state that matters.</p></div><button className="icon-button" type="button" onClick={() => setToast("Workspace status synced")}><RotateCw size={16} /></button></div>
        <div className="segmented"><button className={panel === "overview" ? "active" : ""} type="button" onClick={() => setPanel("overview")}>Overview</button><button className={panel === "runtime" ? "active" : ""} type="button" onClick={() => setPanel("runtime")}>Runtime</button></div>
        {panel === "overview" ? <div className="status-grid">
          <StatusCard icon={Code2} label="CODE" value="Clean" detail="0 errors · 2 warnings" tone="#66e5cf" />
          <StatusCard icon={ShieldCheck} label="AI REVIEW" value="Passed" detail="last review 8m ago" tone="#b49bff" />
          <StatusCard icon={ArrowUpRight} label="DEPLOY" value="Preview" detail="waiting approval" tone="#f7c873" />
          <StatusCard icon={Database} label="STORAGE" value="12.4 MB" detail="of 1 GB used" tone="#b49bff" />
        </div> : <div className="terminal-card">
          <div className="terminal-header"><div className="terminal-title"><span className="terminal-dots"><i /><i /><i /></span><strong>terminal / preview</strong></div><span className="terminal-live">LIVE</span></div>
          <div className="terminal-body">{terminalLines.map(([prefix, text, tone]) => <div className="terminal-line" key={text}><span className={`terminal-prefix ${tone}`}>{prefix}</span><span>{text}</span></div>)}<div className="terminal-line"><span className="terminal-prefix">$</span><span className="terminal-cursor" /></div></div>
        </div>}
      </section>

      <section className="section-block flow-section">
        <div className="section-heading"><div><div className="section-kicker">DELIVERY PIPELINE</div><h2>Ship flow</h2><p>From issue to deploy, without leaving the workspace.</p></div><span className="flow-progress">{built ? "5 / 5" : "3 / 5"} <small>COMPLETE</small></span></div>
        <div className="flow-card"><FlowStep number="01" label="Issue" done /><FlowStep number="02" label="Workspace" done /><FlowStep number="03" label="Build" done={built} active={building || !built} /><FlowStep number="04" label="Review" done={built} /><FlowStep number="05" label="Deploy" done={built} last /></div>
      </section>

      <div className="context-banner"><div className="context-icon"><Sparkles size={18} /></div><div><strong>Agent context is ready</strong><p>42 files, branch state and build logs are already packaged into one context.</p></div><button type="button" onClick={() => setToast("Agent context opened")}><ArrowUpRight size={17} /></button></div>
      <footer className="page-footer"><span>VELCLAW / 0.2.0</span><span><Monitor size={13} /> DESKTOP-FIRST WORKSPACE</span></footer>
    </div>
  );
}
