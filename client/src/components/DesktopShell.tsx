import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  ChevronDown,
  CircleDot,
  Command,
  FileCode2,
  FolderGit2,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Menu,
  Search,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import type { WebRoute } from "@/lib/routes";

export type { WebRoute } from "@/lib/routes";

type DesktopShellProps = {
  route: WebRoute;
  onNavigate: (route: WebRoute) => void;
  children: ReactNode;
};

const navItems: Array<{ route: WebRoute; label: string; hint: string; icon: typeof Gauge }> = [
  { route: "/", label: "Workspace", hint: "Overview", icon: LayoutDashboard },
  { route: "/projects", label: "Projects", hint: "Repositories", icon: FolderGit2 },
  { route: "/files", label: "File explorer", hint: "Source tree", icon: FileCode2 },
  { route: "/review", label: "AI review", hint: "Code intelligence", icon: Sparkles },
];

export default function DesktopShell({ route, onNavigate, children }: DesktopShellProps) {
  const [menuPhase, setMenuPhase] = useState<"closed" | "enter" | "open" | "exit">("closed");
  const closeTimer = useRef<number | null>(null);
  const advancedMenuOpen = menuPhase !== "closed";

  const openAdvancedMenu = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    setMenuPhase("enter");
    window.requestAnimationFrame(() => setMenuPhase("open"));
  };

  const closeAdvancedMenu = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    setMenuPhase("exit");
    closeTimer.current = window.setTimeout(() => setMenuPhase("closed"), 220);
  };

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!advancedMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAdvancedMenu();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advancedMenuOpen]);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", advancedMenuOpen);
    return () => document.body.classList.remove("menu-is-open");
  }, [advancedMenuOpen]);

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">V</div>
          <div>
            <div className="brand-wordmark">VELCLAW</div>
            <div className="brand-caption">DESKTOP WORKSPACE</div>
          </div>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">S</div>
          <div className="workspace-switcher-copy">
            <span className="workspace-label">WORKSPACE</span>
            <strong>starter-vite-tsx</strong>
          </div>
          <ChevronDown size={15} />
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <div className="nav-section-label">BUILD CONSOLE</div>
          {navItems.map(({ route: itemRoute, label, hint, icon: Icon }) => {
            const active = route === itemRoute || (itemRoute === "/files" && route === "/review");
            return (
              <button
                className={`nav-item ${active ? "is-active" : ""}`}
                key={itemRoute}
                onClick={() => onNavigate(itemRoute)}
                type="button"
              >
                <span className="nav-icon"><Icon size={17} strokeWidth={active ? 2.2 : 1.8} /></span>
                <span className="nav-copy"><strong>{label}</strong><small>{hint}</small></span>
                {active && <span className="nav-active-dot" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-card">
          <div className="sidebar-card-top"><CircleDot size={14} /><span>LOCAL PREVIEW</span></div>
          <strong>Everything is healthy</strong>
          <span>main · synced 2m ago</span>
        </div>
        <button className="sidebar-settings" type="button"><Settings2 size={16} /><span>Workspace settings</span></button>
        <div className="sidebar-user">
          <div className="user-avatar">VB</div>
          <div><strong>Velclaw Builder</strong><span>Owner</span></div>
          <span className="user-online" />
        </div>
      </aside>

      <section className="workspace-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Velclaw</span><span className="breadcrumb-slash">/</span><strong>{route === "/" ? "Workspace" : route.slice(1)}</strong>
          </div>
          <div className="topbar-actions">
            <div className="command-search"><Search size={15} /><span>Search workspace</span><kbd><Command size={11} /> K</kbd></div>
            <button className="topbar-icon" type="button" aria-label="Notifications"><Bell size={17} /><i /></button>
            <div className="topbar-divider" />
            <div className="topbar-branch"><GitBranch size={14} /><span>main</span><ChevronDown size={13} /></div>
            <button
              className="mobile-menu-trigger"
              type="button"
              aria-label={advancedMenuOpen ? "Close advanced options" : "Open advanced options"}
              aria-expanded={advancedMenuOpen}
              onClick={advancedMenuOpen ? closeAdvancedMenu : openAdvancedMenu}
            >
              {advancedMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </header>
        {advancedMenuOpen && (
          <>
            <button className={`mobile-menu-backdrop ${menuPhase}`} type="button" aria-label="Close advanced options" onClick={closeAdvancedMenu} />
            <aside className={`mobile-advanced-menu ${menuPhase}`} aria-label="Advanced workspace options">
              <div className="mobile-menu-header">
                <div><span className="panel-overline">ADVANCED OPTIONS</span><strong>Workspace controls</strong></div>
                <button className="icon-button" type="button" aria-label="Close menu" onClick={closeAdvancedMenu}><X size={17} /></button>
              </div>
              <button className="mobile-menu-option menu-option-1" type="button" onClick={() => closeAdvancedMenu()}>
                <Search size={17} /><span><strong>Search workspace</strong><small>Find projects, files and reviews</small></span><kbd><Command size={10} /> K</kbd>
              </button>
              <button className="mobile-menu-option menu-option-2" type="button" onClick={() => closeAdvancedMenu()}>
                <GitBranch size={17} /><span><strong>Branch</strong><small>main · synced 2m ago</small></span><ChevronDown size={15} />
              </button>
              <button className="mobile-menu-option menu-option-3" type="button" onClick={() => closeAdvancedMenu()}>
                <Settings2 size={17} /><span><strong>Workspace settings</strong><small>Configure workspace preferences</small></span><ChevronDown size={15} />
              </button>
              <div className="mobile-menu-status"><CircleDot size={14} /><span><strong>Local preview healthy</strong><small>Velclaw Desktop Workspace</small></span></div>
            </aside>
          </>
        )}
        <main className="page-canvas">{children}</main>
      </section>
    </div>
  );
}
