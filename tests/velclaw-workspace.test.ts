import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const screenPath = resolve(process.cwd(), "app/(tabs)/index.tsx");
const screenSource = readFileSync(screenPath, "utf8");

describe("Velclaw workspace dashboard", () => {
  it("keeps the product surface and primary project visible", () => {
    expect(screenSource).toContain("VELCLAW");
    expect(screenSource).toContain("starter-vite-tsx");
    expect(screenSource).toContain("Ship ideas, not setup.");
  });

  it("exposes the build and preview actions", () => {
    expect(screenSource).toContain("const runBuild = () =>");
    expect(screenSource).toContain("const deployPreview = () =>");
    expect(screenSource).toContain("Run build");
    expect(screenSource).toContain("Preview");
    expect(screenSource).toContain("setBuildState(\"success\")");
  });

  it("includes both overview and runtime workspace panels", () => {
    expect(screenSource).toContain('useState<"overview" | "runtime">');
    expect(screenSource).toContain("Workspace pulse");
    expect(screenSource).toContain("terminal / preview");
    expect(screenSource).toContain("Ship flow");
  });
});
