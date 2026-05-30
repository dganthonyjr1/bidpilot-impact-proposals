import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Schedule the 24h / 72h / 7d follow-up cadence for a proposal that was
 * just sent to a client. Safe to call multiple times — cancels any
 * existing pending rows first so re-sends don't duplicate.
 */
export async function scheduleProposalFollowups(proposalId: string) {
  await supabaseAdmin
    .from("proposal_followups")
    .update({ status: "cancelled" })
    .eq("proposal_id", proposalId)
    .eq("status", "pending");

  const now = Date.now();
  const rows = [
    { proposal_id: proposalId, step: "24h", channels: "both",  scheduled_at: new Date(now + 24 * 60 * 60 * 1000).toISOString() },
    { proposal_id: proposalId, step: "72h", channels: "sms",   scheduled_at: new Date(now + 72 * 60 * 60 * 1000).toISOString() },
    { proposal_id: proposalId, step: "7d",  channels: "both",  scheduled_at: new Date(now + 7  * 24 * 60 * 60 * 1000).toISOString() },
  ];
  const { error } = await supabaseAdmin.from("proposal_followups").insert(rows);
  if (error) throw new Error(`schedule followups: ${error.message}`);
}

export async function cancelProposalFollowups(proposalId: string) {
  await supabaseAdmin
    .from("proposal_followups")
    .update({ status: "cancelled" })
    .eq("proposal_id", proposalId)
    .eq("status", "pending");
}

export function followupMessage(step: "24h" | "72h" | "7d", opts: { clientName: string; business: string; url: string }) {
  const { clientName, business, url } = opts;
  switch (step) {
    case "24h":
      return {
        subject: `Your estimate from ${business} is ready`,
        sms: `Hi ${clientName}, your estimate from ${business} is ready and expires in 72 hours. Review & accept: ${url}`,
        html: `<p>Hi ${clientName},</p><p>Your estimate from <strong>${business}</strong> is ready and expires in 72 hours.</p><p><a href="${url}">Review and accept your proposal</a></p>`,
      };
    case "72h":
      return {
        subject: `Quick check-in on your ${business} estimate`,
        sms: `Hi ${clientName}, just checking in — any questions on your ${business} estimate? ${url}`,
        html: `<p>Hi ${clientName},</p><p>Just checking in — any questions on your <strong>${business}</strong> estimate? <a href="${url}">View it here</a>.</p>`,
      };
    case "7d":
      return {
        subject: `Your ${business} estimate expires today`,
        sms: `Hi ${clientName}, your ${business} estimate expires today. Reply to extend or approve now: ${url}`,
        html: `<p>Hi ${clientName},</p><p>Your <strong>${business}</strong> estimate expires today. <a href="${url}">Approve now</a> or reply to extend.</p>`,
      };
  }
}