import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateProposalNumber } from "@/lib/pricing";

const Body = z.object({
  slug: z.string().min(1).max(120),
  client_name: z.string().trim().min(1).max(200),
  client_email: z.string().trim().email().max(254),
  client_phone: z.string().trim().min(7).max(30),
  job_address: z.string().trim().max(500).optional().nullable(),
  trade_type: z.string().trim().max(100).optional().nullable(),
  job_description: z.string().trim().min(10).max(5000),
  photos: z.array(z.string().url()).max(8).optional().default([]),
});

type AIShape = {
  scope_of_work: string;
  timeline: string;
  warranty: string;
  exclusions: string[];
  materials: { item: string; description?: string; qty: number; unit: string; retail_price: number; sia_price?: number | null }[];
  labor: { task: string; description?: string; hours: number; rate: number }[];
  tiers: Record<string, { label: string; description: string }>;
};

async function callLovableAI(payload: z.infer<typeof Body>, business: string): Promise<AIShape | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;
  const sys = `You are an expert estimator for ${business} (${payload.trade_type || "general contracting"}). Produce a realistic, professional proposal with itemized materials and labor in USD. Apply a 10% waste factor on flooring/tile/paint/drywall. Return ONLY valid JSON.`;
  const user = `CLIENT: ${payload.client_name}\nADDRESS: ${payload.job_address || "TBD"}\nDESCRIPTION: ${payload.job_description}\n\nReturn JSON: {"scope_of_work":string,"timeline":string,"warranty":string,"exclusions":string[],"materials":[{"item":string,"description":string,"qty":number,"unit":string,"retail_price":number,"sia_price":number}],"labor":[{"task":string,"description":string,"hours":number,"rate":number}],"tiers":{"good":{"label":"Good","description":string},"better":{"label":"Better","description":string},"best":{"label":"Best","description":string}}}`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  try {
    return JSON.parse(json.choices?.[0]?.message?.content || "{}") as AIShape;
  } catch { return null; }
}

export const Route = createFileRoute("/api/public/intake-submit")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }}),
      POST: async ({ request }) => {
        let input: z.infer<typeof Body>;
        try {
          input = Body.parse(await request.json());
        } catch (e) {
          return Response.json({ success: false, error: "Invalid form", details: (e as Error).message }, { status: 400 });
        }

        const { data: contractor } = await supabaseAdmin
          .from("contractors")
          .select("id, business_name, email")
          .eq("slug", input.slug)
          .maybeSingle();
        if (!contractor) return Response.json({ success: false, error: "Contractor not found" }, { status: 404 });

        const ai = await callLovableAI(input, contractor.business_name);

        const validThrough = new Date(); validThrough.setDate(validThrough.getDate() + 30);
        const { data: created, error } = await supabaseAdmin.from("proposals").insert({
          contractor_id: contractor.id,
          proposal_number: generateProposalNumber(),
          status: "draft",
          source: "public-intake",
          client_name: input.client_name,
          client_email: input.client_email,
          client_phone: input.client_phone,
          job_address: input.job_address || null,
          trade_type: input.trade_type || null,
          job_description: input.job_description,
          scope_of_work: ai?.scope_of_work || input.job_description,
          timeline: ai?.timeline || null,
          warranty: ai?.warranty || null,
          exclusions: ai?.exclusions || [],
          materials: ai?.materials || [],
          labor: ai?.labor || [],
          tiers: ai?.tiers || {},
          photos: input.photos || [],
          valid_through: validThrough.toISOString().slice(0, 10),
          raw_input: { source: "public-intake", slug: input.slug },
        }).select("id, proposal_number").single();
        if (error) return Response.json({ success: false, error: error.message }, { status: 500 });

        // Auto-send to client (this also schedules follow-ups via the email route)
        const origin = new URL(request.url).origin;
        try {
          await fetch(`${origin}/api/public/send-proposal-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proposalId: created.id, recipientEmail: input.client_email }),
          });
        } catch (e) { console.warn("intake auto-send failed:", (e as Error).message); }

        // Notify contractor
        if (contractor.email) {
          try {
            await fetch(`${origin}/api/public/send-proposal-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ proposalId: created.id, recipientEmail: contractor.email }),
            });
          } catch (e) { console.warn("intake contractor copy failed:", (e as Error).message); }
        }

        return Response.json({
          success: true,
          proposal_id: created.id,
          proposal_number: created.proposal_number,
          proposal_url: `${origin}/p/${created.id}`,
        });
      },
    },
  },
});