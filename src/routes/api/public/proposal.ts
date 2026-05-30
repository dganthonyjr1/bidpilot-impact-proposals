import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const QuerySchema = z.object({ id: z.string().uuid() });

export const Route = createFileRoute("/api/public/proposal")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let input: z.infer<typeof QuerySchema>;
        try {
          input = QuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
        } catch (e) {
          return Response.json(
            { success: false, error: "Invalid proposal link", details: (e as Error).message },
            { status: 400 },
          );
        }

        const { data: proposal, error: proposalError } = await supabaseAdmin
          .from("proposals")
          .select("*")
          .eq("id", input.id)
          .maybeSingle();

        if (proposalError || !proposal) {
          return Response.json({ success: false, error: "Proposal not found" }, { status: 404 });
        }

        const { data: contractor } = proposal.contractor_id
          ? await supabaseAdmin
              .from("contractors")
              .select("id, user_id, business_name, phone, email, logo_url, primary_color")
              .eq("id", proposal.contractor_id)
              .maybeSingle()
          : { data: null };

        return Response.json({ success: true, proposal, contractor });
      },
    },
  },
});