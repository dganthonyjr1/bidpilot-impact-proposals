import { createServerFn } from "@tanstack/react-start";

/**
 * Create a Retell web call and return the access token the browser SDK needs.
 * Requires RETELL_API_KEY and RETELL_AGENT_ID env vars on the server.
 */
export const createRetellWebCall = createServerFn({ method: "POST" }).handler(
  async () => {
    const apiKey = process.env.RETELL_API_KEY;
    const agentId = process.env.RETELL_AGENT_ID;
    if (!apiKey || !agentId) {
      throw new Error(
        "Voice agent not configured. Add RETELL_API_KEY and RETELL_AGENT_ID secrets.",
      );
    }

    const res = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent_id: agentId }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Retell call failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as {
      access_token: string;
      call_id: string;
    };
    return { accessToken: data.access_token, callId: data.call_id };
  },
);