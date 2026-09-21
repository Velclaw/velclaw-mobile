import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

const githubHeaders = (accessToken?: string) => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
});

const demoRepositories = [
  { id: 1, name: "starter-vite-tsx", fullName: "velclaw/starter-vite-tsx", private: false, language: "TypeScript", stars: 24, updatedAt: "2h ago" },
  { id: 2, name: "agent-core", fullName: "velclaw/agent-core", private: true, language: "Node.js", stars: 8, updatedAt: "yesterday" },
  { id: 3, name: "velclaw-web", fullName: "velclaw/velclaw-web", private: true, language: "TypeScript", stars: 12, updatedAt: "3d ago" },
];

const demoTree = [
  { name: "app", path: "app", type: "dir", size: 0 },
  { name: "components", path: "components", type: "dir", size: 0 },
  { name: "server", path: "server", type: "dir", size: 0 },
  { name: "package.json", path: "package.json", type: "file", size: 1840 },
  { name: "README.md", path: "README.md", type: "file", size: 4280 },
  { name: "tsconfig.json", path: "tsconfig.json", type: "file", size: 620 },
];

function toText(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : "text" in part ? part.text : ""))
      .join("\n");
  }
  return "";
}

async function githubFetch<T>(path: string, accessToken?: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(accessToken),
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  return (await response.json()) as T;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  github: router({
    startDeviceFlow: publicProcedure.mutation(async () => {
      if (!ENV.githubClientId) {
        return {
          mode: "demo" as const,
          verificationUri: "https://github.com/login/device",
          userCode: "VELCLAW-DEMO",
          deviceCode: "demo-device-code",
          interval: 5,
        };
      }

      const response = await fetch("https://github.com/login/device", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: ENV.githubClientId, scope: "repo read:user" }),
      });
      if (!response.ok) throw new Error("GitHub device authorization failed");
      const data = (await response.json()) as { device_code: string; user_code: string; verification_uri: string; interval?: number };
      return { mode: "github" as const, ...data, verificationUri: data.verification_uri, userCode: data.user_code, deviceCode: data.device_code, interval: data.interval ?? 5 };
    }),

    pollDeviceFlow: publicProcedure.input(z.object({ deviceCode: z.string() })).mutation(async ({ input }) => {
      if (!ENV.githubClientId || input.deviceCode === "demo-device-code") {
        return { status: "complete" as const, accessToken: "demo-github-token", user: { login: "velclaw", name: "Velclaw Builder", avatarUrl: "https://github.com/github.png" } };
      }

      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: ENV.githubClientId, client_secret: ENV.githubClientSecret, device_code: input.deviceCode, grant_type: "urn:ietf:params:oauth:grant-type:device_code" }),
      });
      const data = (await response.json()) as { access_token?: string; error?: string };
      if (data.error === "authorization_pending") return { status: "pending" as const };
      if (!data.access_token) return { status: "error" as const, message: data.error ?? "GitHub authorization failed" };
      const user = await githubFetch<{ login: string; name: string | null; avatar_url: string }>("/user", data.access_token);
      return { status: "complete" as const, accessToken: data.access_token, user: { login: user.login, name: user.name, avatarUrl: user.avatar_url } };
    }),

    repositories: publicProcedure.input(z.object({ accessToken: z.string().optional() }).optional()).query(async ({ input }) => {
      if (!input?.accessToken || input.accessToken === "demo-github-token") return demoRepositories;
      const repos = await githubFetch<Array<{ id: number; name: string; full_name: string; private: boolean; language: string | null; stargazers_count: number; updated_at: string }>>("/user/repos?per_page=30&sort=updated", input.accessToken);
      return repos.map((repo) => ({ id: repo.id, name: repo.name, fullName: repo.full_name, private: repo.private, language: repo.language ?? "Unknown", stars: repo.stargazers_count, updatedAt: new Date(repo.updated_at).toLocaleDateString() }));
    }),

    branches: publicProcedure.input(z.object({ owner: z.string(), repo: z.string(), accessToken: z.string().optional() })).query(async ({ input }) => {
      if (!input.accessToken || input.accessToken === "demo-github-token") return ["main", "develop", "preview/velclaw"];
      const branches = await githubFetch<Array<{ name: string }>>(`/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/branches?per_page=30`, input.accessToken);
      return branches.map((branch) => branch.name);
    }),

    tree: publicProcedure.input(z.object({ owner: z.string(), repo: z.string(), branch: z.string(), path: z.string().optional(), accessToken: z.string().optional() })).query(async ({ input }) => {
      if (!input.accessToken || input.accessToken === "demo-github-token") return demoTree;
      const path = input.path ? `/${input.path}` : "";
      const contents = await githubFetch<Array<{ name: string; path: string; type: string; size?: number }> | { name: string; path: string; type: string; size?: number }>(`/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/contents${path}?ref=${encodeURIComponent(input.branch)}`, input.accessToken);
      const list = Array.isArray(contents) ? contents : [contents];
      return list.map((entry) => ({ name: entry.name, path: entry.path, type: entry.type, size: entry.size ?? 0 }));
    }),

    file: publicProcedure.input(z.object({ owner: z.string(), repo: z.string(), branch: z.string(), path: z.string(), accessToken: z.string().optional() })).query(async ({ input }) => {
      if (!input.accessToken || input.accessToken === "demo-github-token") {
        return { path: input.path, language: input.path.endsWith(".json") ? "json" : "typescript", content: input.path.endsWith("package.json") ? '{\n  "scripts": { "dev": "vite", "build": "tsc && vite build" },\n  "dependencies": { "vite": "latest", "typescript": "latest" }\n}' : "export const workspace = {\n  name: \"starter-vite-tsx\",\n  strict: true,\n};\n" };
      }
      const file = await githubFetch<{ path: string; content?: string; encoding?: string }>(`/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/contents/${input.path}?ref=${encodeURIComponent(input.branch)}`, input.accessToken);
      const content = file.content && file.encoding === "base64" ? Buffer.from(file.content, "base64").toString("utf8") : file.content ?? "";
      return { path: file.path, language: input.path.endsWith(".json") ? "json" : "typescript", content };
    }),
  }),

  ai: router({
    review: publicProcedure.input(z.object({ filePath: z.string().min(1).max(500), code: z.string().min(1).max(30000), language: z.string().max(40).default("typescript") })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        model: "gpt-5-mini",
        reasoning: { effort: "low" },
        maxTokens: 1200,
        messages: [
          { role: "system", content: "You are Velclaw's senior code reviewer. Return strict JSON only with keys summary (string), risk (low|medium|high), findings (array of objects with line (integer), severity (info|warning|error), title (string), detail (string), fix (string)). Focus on actionable correctness, security, performance, and TypeScript issues. If there are no issues, return an empty findings array." },
          { role: "user", content: `Review this ${input.language} file at ${input.filePath}:\n\n${input.code}` },
        ],
        response_format: { type: "json_object" },
      });
      const raw = toText(response.choices[0]?.message.content);
      try {
        return JSON.parse(raw) as { summary: string; risk: "low" | "medium" | "high"; findings: Array<{ line: number; severity: "info" | "warning" | "error"; title: string; detail: string; fix: string }> };
      } catch {
        return { summary: raw || "Review completed.", risk: "low" as const, findings: [] };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
