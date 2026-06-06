import { Request, Response } from "express";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const FROM = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";
const TO = process.env.TWILIO_WHATSAPP_TO ?? "";

// Optional Resend email fallback
const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_TO = process.env.RESEND_TO_EMAIL ?? "";

async function sendViaTwilio(message: string): Promise<boolean> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !TO || ACCOUNT_SID.startsWith("ACxxxxx")) {
    console.log("[WhatsApp] Twilio credentials not configured. Message:", message);
    return false;
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
  const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
  const body = new URLSearchParams({ From: FROM, To: TO, Body: message });

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const errText = await res.text();
    try {
      const errJson = JSON.parse(errText);
      if (errJson.code === 63007) {
        console.warn(
          `[WhatsApp] ⚠️  Twilio Sandbox not activated. ` +
          `The number ${TO} must first send the sandbox join keyword to ${FROM} on WhatsApp. ` +
          `Find your keyword at: https://console.twilio.com → Messaging → Try it out → WhatsApp`
        );
      } else {
        console.error("[WhatsApp] Twilio error:", errJson);
      }
    } catch {
      console.error("[WhatsApp] Twilio error:", errText);
    }
    return false;
  }
  return true;
}

async function sendViaResend(message: string): Promise<boolean> {
  if (!RESEND_KEY || !RESEND_TO || RESEND_KEY.startsWith("re_xxxxx")) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "campusos@yourapp.com",
      to: RESEND_TO,
      subject: "CampusOS Admin Alert",
      text: message,
    }),
  });
  return res.ok;
}

export async function handleWhatsAppSend(req: Request, res: Response) {
  const { message, urgent } = req.body as { message: string; urgent: boolean };
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const [whatsapp, email] = await Promise.allSettled([
    sendViaTwilio(message),
    sendViaResend(message),
  ]);

  const sent = whatsapp.status === "fulfilled" && whatsapp.value;
  const emailSent = email.status === "fulfilled" && email.value;

  console.log(`[WhatsApp] urgent=${urgent} sent=${sent} email=${emailSent} msg="${message.slice(0, 60)}..."`);

  return res.json({ success: true, whatsapp: sent, email: emailSent, demo: !sent });
}
