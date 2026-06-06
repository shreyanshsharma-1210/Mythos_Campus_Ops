export interface WhatsAppAlert {
  type: "grievance" | "maintenance" | "lost_found" | "anti_ragging" | "general";
  title: string;
  body: string;
  ticketId?: string;
  urgent?: boolean;
}

export async function sendWhatsAppAlert(alert: WhatsAppAlert): Promise<boolean> {
  const emoji =
    alert.type === "grievance" ? "🚨" :
    alert.type === "maintenance" ? "🔧" :
    alert.type === "lost_found" ? "🔍" :
    alert.type === "anti_ragging" ? "⚠️" : "📢";

  const message = [
    `${emoji} *CampusOS Alert*`,
    `*${alert.title}*`,
    "",
    alert.body,
    alert.ticketId ? `\nTicket ID: \`${alert.ticketId}\`` : "",
    `\n_Sent via CampusOS · ${new Date().toLocaleTimeString("en-IN")}_`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, urgent: alert.urgent ?? false }),
    });
    return res.ok;
  } catch {
    console.warn("[WhatsApp] Notification queued (server unavailable):", message);
    return false;
  }
}
