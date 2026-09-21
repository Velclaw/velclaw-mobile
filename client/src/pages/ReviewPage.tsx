import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileCode2,
  Info,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { WebRoute } from "@/components/DesktopShell";

type ReviewPageProps = { onNavigate: (route: WebRoute) => void };

export default function ReviewPage({ onNavigate }: ReviewPageProps) {
  const params = new URLSearchParams(window.location.search);
  const owner = params.get("owner") ?? "velclaw";
  const repo = params.get("repo") ?? "starter-vite-tsx";
  const branch = params.get("branch") ?? "main";
  const path = params.get("path") ?? "src/workspace.ts";
  const [showCode, setShowCode] = useState(false);
  const file = trpc.github.file.useQuery({ owner, repo, branch, path }, { staleTime: 30_000 });
  const review = trpc.ai.review.useMutation();
  const result = review.data;
  const runReview = () => {
    if (!file.data) return;
    review.mutate({ filePath: file.data.path, code: file.data.content, language: file.data.language });
  };
  const riskTone = result?.risk === "high" ? "red" : result?.risk === "medium" ? "amber" : "teal";
  const filename = path.split("/").pop() ?? path;

  return (
    <div className="content-page review-page">
      <div className="page-heading"><div><div className="eyebrow"><Sparkles size={14} /> AI CODE REVIEW</div><h1>{filename}</h1><p className="monospace-sub"><span>{owner}/{repo}</span> <span>·</span> {branch} <span>·</span> {path}</p></div><div className="page-heading-meta"><button className="button button-quiet" type="button" onClick={() => onNavigate("/files")}><Code2 size={15} /> Back to files</button></div></div>
      <div className="review-layout">
        <section className="review-main-column">
          <div className="file-context-card"><div className="file-context-id"><span className="file-icon selected"><FileCode2 size={17} /></span><div><strong>{path}</strong><small>{file.data?.language ?? "Loading"} <i>·</i> {file.data?.content.length ?? 0} characters</small></div></div><button className="button button-outline" type="button" onClick={() => setShowCode((value) => !value)}>{showCode ? "Hide code" : "View code"}<ChevronDown className={showCode ? "rotate" : ""} size={14} /></button></div>
          {showCode && <pre className="code-viewer"><code>{file.data?.content ?? "Loading file..."}</code></pre>}
          <div className="review-intro"><div className="review-intro-icon"><WandSparkles size={19} /></div><div><div className="panel-overline">VELCLAW AI</div><h2>Review with senior context</h2><p>Check correctness, security, performance and TypeScript quality before opening a pull request.</p></div><span className="intro-badge">GPT-5 MINI</span></div>
          <button className="button button-primary run-review-button" disabled={!file.data || review.isPending} type="button" onClick={runReview}><ShieldCheck size={16} />{review.isPending ? "Reviewing file..." : "Run AI review"}<span className="button-shortcut">⌘ ↵</span></button>
          {review.isPending && <div className="review-loading"><Loader2 className="spin" size={18} /><span>Agent is reading {path}...</span></div>}
          {review.error && <div className="review-error"><AlertTriangle size={16} /><span>Review could not run. Please try again.</span></div>}
          {result && <section className="review-result"><div className="result-header"><div><div className="panel-overline">REVIEW RESULT</div><h2>{result.findings.length === 0 ? "Looks clean" : `${result.findings.length} findings`}</h2></div><span className={`risk-badge ${riskTone}`}><i /> {result.risk} risk</span></div><p className="result-summary">{result.summary}</p>{result.findings.length === 0 ? <div className="clean-state"><CheckCircle2 size={22} /><div><strong>No actionable findings</strong><span>This file passed the current correctness, security and performance checks.</span></div></div> : <div className="findings-list">{result.findings.map((finding) => <div className="finding" key={`${finding.line}-${finding.title}`}><div className="finding-meta"><span>L{finding.line}</span><strong className={finding.severity}>{finding.severity}</strong></div><h3>{finding.title}</h3><p>{finding.detail}</p><div className="fix-box"><span>SUGGESTED FIX</span><strong>{finding.fix}</strong></div></div>)}</div>}</section>}
        </section>
        <aside className="review-side-panel"><div className="side-panel-art review-art"><div className="review-ring ring-one" /><div className="review-ring ring-two" /><Sparkles size={28} /></div><div className="panel-overline">REVIEW SCOPE</div><h3>Four dimensions, one signal.</h3><div className="review-scope-list"><span><CheckCircle2 size={14} /> Correctness</span><span><ShieldCheck size={14} /> Security</span><span><ZapIcon /> Performance</span><span><Code2 size={14} /> TypeScript</span></div><div className="side-panel-divider" /><div className="privacy-note"><LockKeyhole size={15} /><p>Server-side review. Your GitHub access token never enters the prompt or client logs.</p></div></aside>
      </div>
    </div>
  );
}

function ZapIcon() { return <span className="mini-zap">↯</span>; }
