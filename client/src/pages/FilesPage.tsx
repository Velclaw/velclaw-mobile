import { useMemo, useState } from "react";
import {
  ArrowUp,
  ChevronRight,
  Code2,
  FileCode2,
  FileJson2,
  FileText,
  Folder,
  FolderOpen,
  GitBranch,
  Search,
  Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { buildReviewUrl } from "@/lib/routes";
import type { WebRoute } from "@/components/DesktopShell";

type FilesPageProps = { onNavigate: (route: WebRoute) => void };

export default function FilesPage({ onNavigate }: FilesPageProps) {
  const params = new URLSearchParams(window.location.search);
  const owner = params.get("owner") ?? "velclaw";
  const repo = params.get("repo") ?? "starter-vite-tsx";
  const branch = params.get("branch") ?? "main";
  const [path, setPath] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Select a file to inspect");
  const tree = trpc.github.tree.useQuery({ owner, repo, branch, path }, { staleTime: 30_000 });
  const entries = useMemo(() => [...(tree.data ?? [])].sort((a, b) => Number(b.type === "dir") - Number(a.type === "dir") || a.name.localeCompare(b.name)).filter((entry) => entry.name.toLowerCase().includes(search.toLowerCase())), [tree.data, search]);

  const openEntry = (entry: { name: string; path: string; type: string }) => {
    if (entry.type === "dir") {
      setPath(entry.path);
      setMessage(`Browsing ${entry.path}`);
      return;
    }
    setMessage(`Selected ${entry.name}`);
    window.history.pushState({}, "", buildReviewUrl({ owner, repo, branch, path: entry.path }));
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="content-page files-page">
      <div className="page-heading"><div><div className="eyebrow"><Code2 size={14} /> WORKSPACE / FILES</div><h1>{repo}</h1><p className="monospace-sub"><GitBranch size={13} /> {branch} <span>·</span> {path || "root"}</p></div><div className="page-heading-meta"><span className="meta-pill"><span className="live-indicator" /> Read-only preview</span></div></div>
      <div className="file-toolbar"><div className="toolbar-context"><FolderOpen size={15} /><strong>{tree.data?.length ?? 0}</strong><span>entries in {path || "project root"}</span></div><div className="file-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter files" /></div><span className="toolbar-message"><span className="live-indicator" />{message}</span></div>
      <div className="files-layout">
        <section className="file-list-panel"><div className="file-list-header"><div><div className="panel-overline">{path ? "CONTENTS" : "PROJECT ROOT"}</div><h2>{path || "starter-vite-tsx"}</h2></div><span>{tree.isLoading ? "syncing..." : `${entries.length} visible`}</span></div>
          <div className="file-list">{entries.map((entry) => { const dir = entry.type === "dir"; const Icon = dir ? Folder : entry.name.endsWith(".json") ? FileJson2 : entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? FileCode2 : FileText; return <button className="file-row" type="button" key={entry.path} onClick={() => openEntry(entry)}><span className={`file-icon ${dir ? "folder" : ""}`}><Icon size={16} /></span><span className="file-copy"><strong>{entry.name}</strong><small>{dir ? "directory" : `${entry.size} bytes`}</small></span><span className="file-action">{dir ? <ChevronRight size={15} /> : <Sparkles size={15} />}</span></button>; })}</div>
          {entries.length === 0 && <div className="empty-state"><FileText size={22} /><strong>No files found</strong><span>Try a different filter or path.</span></div>}
          {path ? <button className="parent-button" type="button" onClick={() => { const parent = path.split("/").slice(0, -1).join("/"); setPath(parent); setMessage(parent ? `Browsing ${parent}` : "Select a file to inspect"); }}><ArrowUp size={14} /> Back to parent directory</button> : <div className="file-tip"><Sparkles size={16} /><span>Click a file to open AI Code Review. Review runs server-side and never exposes your GitHub token.</span></div>}
        </section>
        <aside className="files-side-panel"><div className="side-panel-art"><div className="art-square square-one" /><div className="art-square square-two" /><div className="art-square square-three" /><Code2 size={28} /></div><div className="panel-overline">WORKSPACE CONTEXT</div><h3>Everything in view</h3><p>Browse the branch tree, inspect a file, then ask Velclaw AI for an actionable review.</p><div className="side-stat"><span>BRANCH</span><strong>{branch}</strong></div><div className="side-stat"><span>REPOSITORY</span><strong>{owner}/{repo}</strong></div><button className="button button-dark full-width" type="button" onClick={() => onNavigate("/review")}><Sparkles size={15} /> Open AI review</button></aside>
      </div>
    </div>
  );
}
