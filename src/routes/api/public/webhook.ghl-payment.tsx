import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import process from "node:process";

/**
 * GHL payment webhook. Configure in GHL Workflow as "Webhook" action
 * triggered by Order Form Submitted / Invoice Paid for each tier product.
 *
 * Security: requires ?token=<GHL_WEBHOOK_TOKEN> query param matching the
 * server secret. Set this same token on the webhook URL in GHL.
 *
 * Expected payload (GHL standard order webhook):
 *  {
 *    contact: { email, phone, first_name, last_name },
 *    order: { amount, currency, products: [{ name, price }] }
 *  }
 * We also accept flat fields (email, amount, product_name) for flexibility.
 */

const TIER_BY_NAME: Record<string, string> = {
  apprentice: "apprentice",
  journeyman: "journeyman",
  "master gc": "master_gc",
  "master_gc": "master_gc",
  principal: "principal",
};

function tierFromPayload(p: any): string | null {
  const productName: string =
    p?.order?.products?.[0]?.name ||
    p?.product_name ||
    p?.productName ||
    p?.product ||
    "";
  const key = String(productName).toLowerCase().trim();
  for (const [needle, tier] of Object.entries(TIER_BY_NAME)) {
    if (key.includes(needle)) return tier;
  }
  // Fallback: classify by amount (USD)
  const amount = Number(p?.order?.amount ?? p?.amount ?? p?.total ?? 0);
  if (amount >= 6000) return "principal";
  if (amount >= 450) return "master_gc";
  if (amount >= 250) return "journeyman";
  return null;
}

export const Route = createFileRoute("/api/public/webhook/ghl-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const expected = process.env.GHL_WEBHOOK_TOKEN;
        if (!expected || token !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body: any = await request.json().catch(() => ({}));
        const email: string | undefined =
          body?.contact?.email || body?.email || body?.customer?.email;
        if (!email) return new Response("Missing email", { status: 400 });

        const tier = tierFromPayload(body);
        if (!tier) return new Response("Unrecognized product", { status: 400 });

        const lower = email.toLowerCase();
        // Find contractor by primary email or billing_email
        const { data: existing, error: findErr } = await supabaseAdmin
          .from("contractors")
          .select("id, email, billing_email")
          .or(`email.eq.${lower},billing_email.eq.${lower}`)
          .limit(1)
          .maybeSingle();
        if (findErr) return new Response(findErr.message, { status: 500 });
        if (!existing) {
          // Stash for later — when the user signs up with this email we can
          // attach the plan. For now just 200 so GHL doesn't retry forever.
          console.log("[ghl-payment] no contractor for", lower, "tier=", tier);
          return Response.json({ ok: true, matched: false });
        }

        const { error: upErr } = await supabaseAdmin
          .from("contractors")
          .update({
            subscription_tier: tier,
            subscription_status: "active",
            billing_email: lower,
            last_payment_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (upErr) return new Response(upErr.message, { status: 500 });

        return Response.json({ ok: true, contractor_id: existing.id, tier });
      },
    },
  },
});