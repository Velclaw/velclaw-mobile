import { describe, expect, it } from "vitest";
import { buildReviewUrl, getWebRoute } from "../client/src/lib/routes";

describe("desktop web routing", () => {
  it("maps supported pages and falls back to workspace", () => {
    expect(getWebRoute("/")).toBe("/");
    expect(getWebRoute("/projects")).toBe("/projects");
    expect(getWebRoute("/files")).toBe("/files");
    expect(getWebRoute("/review")).toBe("/review");
    expect(getWebRoute("/unknown")).toBe("/");
  });

  it("encodes review context in a stable URL", () => {
    expect(buildReviewUrl({ owner: "velclaw", repo: "starter-vite-tsx", branch: "preview/ui", path: "src/app shell.tsx" })).toBe(
      "/review?owner=velclaw&repo=starter-vite-tsx&branch=preview%2Fui&path=src%2Fapp+shell.tsx",
    );
  });
});
