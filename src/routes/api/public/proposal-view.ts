import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BodySchema = z.object({ proposalId: z.string().uuid() });

function getClientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}

export const Route = createFileRoute("/api/public/proposal-view")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
      POST: async ({ request }) => {
        let input: z.infer<typeof BodySchema>;
        try {
          input = BodySchema.parse(await request.json());
        } catch {
          return Response.json({ success: false, error: "Invalid request" }, { status: 400 });
        }

        await supabaseAdmin.from("proposal_views").insert({
          proposal_id: input.proposalId,
          user_agent: request.headers.get("user-agent"),
          ip_address: getClientIp(request),
        });

        // Promote draft -> sent? Actually mark viewed for first non-owner view.
        await supabaseAdmin
          .from("proposals")
          .update({ status: "viewed" })
          .eq("id", input.proposalId)
          .in("status", ["draft", "sent"]);

        return Response.json({ success: true });
      },
    },
  },
});