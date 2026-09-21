import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  ExternalLink,
  FolderGit2,
  GitBranch,
  Globe2,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { WebRoute } from "@/components/DesktopShell";

type ProjectsPageProps = { onNavigate: (route: WebRoute) => void };
type Flow = { verificationUri: string; userCode: string; deviceCode: string };

export default function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [selectedRepo, setSelectedRepo] = useState({ owner: "velclaw", repo: "starter-vite-tsx" });
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [message, setMessage] = useState("Demo repositories · connect GitHub to sync real data");

  useEffect(() => {
    const token = window.localStorage.getItem("velclaw.github.token");
    if (token) setAccessToken(token);
  }, []);

  const startFlow = trpc.github.startDeviceFlow.useMutation({
    onSuccess: async (data) => {
      setFlow({ verificationUri: data.verificationUri, userCode: data.userCode, deviceCode: data.deviceCode });
      setMessage("Open GitHub, enter the device code, then come back here");
      window.open(data.verificationUri, "_blank", "noopener,noreferrer");
    },
    onError: () => setMessage("Could not start GitHub login. Try again."),
  });
  const pollFlow = trpc.github.pollDeviceFlow.useMutation({
    onSuccess: (data) => {
      if (data.status === "complete") {
        window.localStorage.setItem("velclaw.github.token", data.accessToken);
        setAccessToken(data.accessToken);
        setFlow(null);
        setMessage(`GitHub connected · @${data.user.login}`);
      } else if (data.status === "pending") setMessage("GitHub is waiting for confirmation. Finish the browser step, then try again.");
      else setMessage(data.message ?? "GitHub authorization failed");
    },
    onError: () => setMessage("Could not check GitHub authorization."),
  });
  const repositories = trpc.github.repositories.useQuery(accessToken ? { accessToken } : undefined, { staleTime: 30_000 });
  const branches = trpc.github.branches.useQuery(accessToken ? { ...selectedRepo, accessToken } : selectedRepo, { staleTime: 30_000 });

  return (
    <div className="content-page projects-page">
      <div className="page-heading"><div><div className="eyebrow"><FolderGit2 size={14} /> SOURCE CONTROL</div><h1>Projects</h1><p>Connect a repository and choose the branch you want to bring into your workspace.</p></div><div className="page-heading-meta"><span className="meta-pill"><CircleDot size={13} /> {repositories.data?.length ?? 0} repositories</span></div></div>

      <div className="projects-layout">
        <div className="projects-main-column">
          <section className="panel-card github-connect-card">
            <div className="panel-icon purple"><GitHubGlyph /></div>
            <div className="panel-card-copy"><div className="panel-overline">SOURCE PROVIDER</div><h2>{accessToken ? "GitHub connected" : "Connect GitHub"}</h2><p>{message}</p></div>
            {!accessToken && <button className="button button-light" type="button" onClick={() => startFlow.mutate()} disabled={startFlow.isPending}>{startFlow.isPending ? "Starting..." : "Connect account"} <ExternalLink size={14} /></button>}
            {accessToken && <span className="connected-state"><ShieldCheck size={15} /> Connected</span>}
          </section>
          {flow && <section className="device-code-card"><div><div className="panel-overline">DEVICE AUTHORIZATION</div><strong>{flow.userCode}</strong><p>If the browser did not open, visit github.com/login/device</p></div><button className="button button-outline" type="button" onClick={() => pollFlow.mutate({ deviceCode: flow.deviceCode })} disabled={pollFlow.isPending}>{pollFlow.isPending ? "Checking..." : "I've authorized"} <Check size={14} /></button></section>}

          <div className="section-heading compact"><div><div className="section-kicker">AVAILABLE REPOSITORIES</div><h2>Repositories</h2><p>{repositories.isLoading ? "Syncing repositories..." : "Select a repository to inspect its branches."}</p></div><button className="icon-button" type="button" onClick={() => repositories.refetch()}><RefreshCw size={15} /></button></div>
          <div className="repo-list">{(repositories.data ?? []).map((item) => {
            const [owner, repo] = item.fullName.split("/");
            const selected = selectedRepo.repo === repo;
            return <button className={`repo-row ${selected ? "selected" : ""}`} key={item.id} type="button" onClick={() => { setSelectedRepo({ owner, repo }); setSelectedBranch("main"); }}><span className={`repo-icon ${selected ? "selected" : ""}`}>{item.private ? <LockKeyhole size={15} /> : <Globe2 size={15} />}</span><span className="repo-copy"><strong>{item.name}</strong><small>{item.language} <i>·</i> updated {item.updatedAt}</small></span><span className="repo-stars">★ {item.stars}</span><ChevronRight size={15} /></button>;
          })}</div>
        </div>

        <aside className="project-selection-panel">
          <div className="selection-label">SELECTED PROJECT</div>
          <div className="selection-repo"><span className="repo-icon selected"><FolderGit2 size={16} /></span><div><strong>{selectedRepo.repo}</strong><small>{selectedRepo.owner}/{selectedRepo.repo}</small></div></div>
          <div className="selection-divider" />
          <div className="selection-heading"><div><div className="panel-overline">WORKSPACE BRANCH</div><h3>Branch</h3></div><GitBranch size={16} /></div>
          <p className="selection-copy">Choose a branch to open in the workspace.</p>
          <div className="branch-list">{(branches.data ?? ["main"]).map((branch) => <button className={`branch-row ${selectedBranch === branch ? "selected" : ""}`} type="button" key={branch} onClick={() => setSelectedBranch(branch)}><GitBranch size={14} /><span>{branch}</span>{selectedBranch === branch && <Check size={14} />}</button>)}</div>
          <button className="button button-primary selection-button" type="button" onClick={() => onNavigate("/files")}><FolderGit2 size={15} /> Open workspace <ArrowRight size={15} /></button>
          <div className="selection-note"><KeyRound size={14} /><span>Tokens stay in this browser and are never sent to the AI review prompt.</span></div>
        </aside>
      </div>
    </div>
  );
}

function GitHubGlyph() { return <span className="github-glyph">GH</span>; }
