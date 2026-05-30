import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sendSmsViaGHL } from "@/lib/ghl.server";

const BodySchema = z.object({
  to: z.string().min(7).max(20),
  body: z.string().min(1).max(500),
});

export const Route = createFileRoute("/api/public/test-sms-ghl")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input;
        try { input = BodySchema.parse(await request.json()); }
        catch (e) { return Response.json({ error: "Invalid request", details: (e as Error).message }, { status: 400 }); }
        const result = await sendSmsViaGHL({ to: input.to, body: input.body });
        return Response.json(result, { status: result.ok ? 200 : 400 });
      },
    },
  },
});