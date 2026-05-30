import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { cancelProposalFollowups } from "@/lib/followups.server";
import { notifyContractorOfDecision } from "@/lib/notify-contractor.server";

const BodySchema = z.object({
  proposalId: z.string().uuid(),
  reason: z.string().trim().max(1000).optional().nullable(),
});

export const Route = createFileRoute("/api/public/decline-proposal")({
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
        } catch (e) {
          return Response.json(
            { success: false, error: "Invalid request", details: (e as Error).message },
            { status: 400 },
          );
        }

        const { error: updateError } = await supabaseAdmin
          .from("proposals")
          .update({ status: "declined" })
          .eq("id", input.proposalId);
        if (updateError) {
          return Response.json({ success: false, error: updateError.message }, { status: 500 });
        }

        try { await cancelProposalFollowups(input.proposalId); } catch {}

        try {
          await notifyContractorOfDecision({
            proposalId: input.proposalId,
            decision: "declined",
            declineReason: input.reason || null,
          });
        } catch (e) {
          console.warn("notify decline failed:", (e as Error).message);
        }

        return Response.json({ success: true, status: "declined" });
      },
    },
  },
});