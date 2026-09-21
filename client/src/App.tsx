import { useEffect, useState } from "react";
import DesktopShell, { type WebRoute } from "@/components/DesktopShell";
import { getWebRoute } from "@/lib/routes";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/ProjectsPage";
import FilesPage from "@/pages/FilesPage";
import ReviewPage from "@/pages/ReviewPage";

export default function App() {
  const [route, setRoute] = useState<WebRoute>(() => getWebRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(getWebRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (nextRoute: WebRoute) => {
    window.history.pushState({}, "", nextRoute);
    setRoute(nextRoute);
  };

  const page = route === "/projects" ? <ProjectsPage onNavigate={navigate} /> : route === "/files" ? <FilesPage onNavigate={navigate} /> : route === "/review" ? <ReviewPage onNavigate={navigate} /> : <HomePage onNavigate={navigate} />;

  return <DesktopShell route={route} onNavigate={navigate}>{page}</DesktopShell>;
}
