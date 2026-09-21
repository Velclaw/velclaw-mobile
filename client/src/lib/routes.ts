export type WebRoute = "/" | "/projects" | "/files" | "/review";

export function getWebRoute(pathname: string): WebRoute {
  if (pathname === "/projects") return "/projects";
  if (pathname === "/files") return "/files";
  if (pathname === "/review") return "/review";
  return "/";
}

export function buildReviewUrl(params: { owner: string; repo: string; branch: string; path: string }) {
  const query = new URLSearchParams({ owner: params.owner, repo: params.repo, branch: params.branch, path: params.path });
  return `/review?${query.toString()}`;
}
