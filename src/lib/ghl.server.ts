import process from "node:process";
import { toE164US } from "./twilio.server";

export type GhlSmsResult =
  | { ok: true; messageId?: string; conversationId?: string; to: string }
  | { ok: false; error: string; status?: number };

/**
 * Send an SMS via GoHighLevel's Conversations API using a Private
 * Integration Token (PIT). Requires an A2P-verified number on the
 * sub-account. Never throws — returns a result object.
 *
 * Flow:
 *   1. Upsert a contact by phone (so we have a contactId).
 *   2. POST /conversations/messages with type=SMS.
 */
export async function sendSmsViaGHL(opts: {
  to: string;
  body: string;
  fromNumber?: string;
}): Promise<GhlSmsResult> {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const fromNumber = opts.fromNumber || process.env.GHL_FROM_NUMBER;

  if (!token || !locationId || !fromNumber) {
    return {
      ok: false,
      error: "GHL not configured (missing GHL_API_TOKEN/GHL_LOCATION_ID/GHL_FROM_NUMBER)",
    };
  }

  const to = toE164US(opts.to);
  const from = toE164US(fromNumber);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    Version: "2021-04-15",
  };

  try {
    // 1. Upsert contact to get a contactId
    const upsertRes = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
      method: "POST",
      headers,
      body: JSON.stringify({ locationId, phone: to }),
    });
    const upsertJson: any = await upsertRes.json().catch(() => ({}));
    if (!upsertRes.ok) {
      return {
        ok: false,
        status: upsertRes.status,
        error: upsertJson?.message || `GHL contact upsert failed (${upsertRes.status})`,
      };
    }
    const contactId: string | undefined =
      upsertJson?.contact?.id || upsertJson?.id;
    if (!contactId) {
      return { ok: false, error: "GHL upsert returned no contactId" };
    }

    // 2. Send the SMS
    const msgRes = await fetch("https://services.leadconnectorhq.com/conversations/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "SMS",
        contactId,
        message: opts.body,
        fromNumber: from,
        toNumber: to,
      }),
    });
    const msgJson: any = await msgRes.json().catch(() => ({}));
    if (!msgRes.ok) {
      return {
        ok: false,
        status: msgRes.status,
        error: msgJson?.message || `GHL send failed (${msgRes.status})`,
      };
    }
    return {
      ok: true,
      messageId: msgJson?.messageId || msgJson?.id,
      conversationId: msgJson?.conversationId,
      to,
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error calling GHL" };
  }
}