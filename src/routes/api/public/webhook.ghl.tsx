import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateProposalNumber } from "@/lib/pricing";

export const Route = createFileRoute("/api/public/webhook/ghl")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const contractorId = url.searchParams.get("contractor");
        if (!contractorId) return new Response("Missing contractor", { status: 400 });

        const body: any = await request.json().catch(() => ({}));
        const insert = {
          contractor_id: contractorId,
          proposal_number: generateProposalNumber(),
          status: "draft",
          source: "ghl",
          client_name: body.full_name || `${body.first_name || ""} ${body.last_name || ""}`.trim() || "Unknown",
          client_email: body.email || null,
          client_phone: body.phone || null,
          job_address: body.address1 || body.address || null,
          job_state: (body.state || "").slice(0, 2).toUpperCase() || null,
          trade_type: body.custom_fields?.trade_type || null,
          job_description: body.custom_fields?.job_description || body.message || "GHL lead",
          raw_input: body,
        };

        const { data, error } = await supabaseAdmin.from("proposals").insert(insert).select("id").single();
        if (error) return new Response(error.message, { status: 500 });
        return Response.json({ ok: true, proposal_id: data.id });
      },
      OPTIONS: async () => new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } }),
    },
  },
});