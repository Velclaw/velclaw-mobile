import { describe, expect, it } from "vitest";

describe("GitHub OAuth credentials", () => {
  it("are accepted by GitHub's OAuth endpoint without exposing the secret", async () => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    expect(clientId, "GITHUB_CLIENT_ID is required").toBeTruthy();
    expect(clientSecret, "GITHUB_CLIENT_SECRET is required").toBeTruthy();

    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        device_code: "velclaw-validation-placeholder",
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });
    const payload = (await response.json()) as { error?: string };
    expect(response.status).toBe(200);
    expect(payload.error).not.toBe("incorrect_client_credentials");
  });
});
