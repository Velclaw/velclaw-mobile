import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homePath = resolve(process.cwd(), "client/src/pages/HomePage.tsx");
const homeSource = readFileSync(homePath, "utf8");
const shellSource = readFileSync(resolve(process.cwd(), "client/src/components/DesktopShell.tsx"), "utf8");

describe("Velclaw desktop workspace", () => {
  it("keeps the product surface and primary project visible", () => {
    expect(homeSource).toContain("VELCLAW");
    expect(homeSource).toContain("starter-vite-tsx");
    expect(homeSource).toContain("Ship ideas, <em>not setup.</em>");
  });

  it("exposes build and preview actions", () => {
    expect(homeSource).toContain("const runBuild = () =>");
    expect(homeSource).toContain("Run build");
    expect(homeSource).toContain("Preview");
    expect(homeSource).toContain("setBuilt(true)");
  });

  it("uses desktop sidebar navigation instead of a bottom tab bar", () => {
    expect(shellSource).toContain("DESKTOP WORKSPACE");
    expect(shellSource).toContain("primary-nav");
    expect(shellSource).toContain("File explorer");
    expect(shellSource).not.toContain("tab" + "Bar");
  });
});
