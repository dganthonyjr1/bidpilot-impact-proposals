import process from "node:process";

/**
 * Normalize a US phone number to E.164 (+1XXXXXXXXXX). Strips hyphens,
 * spaces, parens. If already starts with +, returned as-is.
 */
export function toE164US(input: string): string {
  const trimmed = (input || "").trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export type SmsResult =
  | { ok: true; sid: string; to: string }
  | { ok: false; error: string; status?: number };

/**
 * Send an SMS via the Twilio REST API using account credentials stored
 * as project secrets. Returns a result object — never throws.
 */
export async function sendSms(opts: {
  to: string;
  body: string;
  from?: string;
}): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = opts.from || process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    return { ok: false, error: "Twilio not configured (missing SID/TOKEN/FROM)" };
  }
  const to = toE164US(opts.to);
  const fromE164 = toE164US(from);
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({ To: to, From: fromE164, Body: opts.body });
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      },
    );
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json?.message || `Twilio error ${res.status}`,
      };
    }
    return { ok: true, sid: json.sid, to };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error calling Twilio" };
  }
}