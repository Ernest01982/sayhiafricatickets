import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY");
const whatsappToken = Deno.env.get("WHATSAPP_TOKEN") || "";
const phoneNumberId = Deno.env.get("PHONE_NUMBER_ID") || "";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const parseBody = async (req: Request) => {
  const text = await req.text();
  try {
    return { data: JSON.parse(text) as Record<string, string>, raw: text, asForm: null };
  } catch {
    const form = new URLSearchParams(text);
    const obj: Record<string, string> = {};
    form.forEach((v, k) => (obj[k] = v));
    return { data: obj, raw: text, asForm: form };
  }
};

const ok = (msg = "OK") => new Response(msg, { status: 200, headers: corsHeaders });
const error = (msg = "Error", status = 500) => new Response(msg, { status, headers: corsHeaders });

const sendWhatsAppMessage = async (to: string, body: string) => {
  if (!whatsappToken || !phoneNumberId || !to) return;
  const sanitized = to.replace(/[^\d+]/g, "");
  if (!sanitized) return;
  try {
    await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${whatsappToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: sanitized,
        type: "text",
        text: { body },
      }),
    });
  } catch (err) {
    console.error("WhatsApp send error:", err);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return ok();
  if (req.method !== "POST") return error("Method not allowed", 405);

  const parsed = await parseBody(req);
  const payload = parsed.data || {};

  const orderId = payload["custom_str1"] || payload["m_payment_id"];
  const ticketTypeId = payload["custom_str4"] || null;
  const quantity = parseInt(payload["custom_int1"] || "1", 10) || 1;

  if (!orderId) return error("Missing order id", 400);
  if (!supabase) return ok("No supabase client configured");

  try {
    await supabase.from("orders").update({ status: "PAID" }).eq("id", orderId);

    if (ticketTypeId) {
      const tickets = Array.from({ length: quantity }).map((_, idx) => ({
        order_id: orderId,
        ticket_type_id: ticketTypeId,
        qr_code: `${orderId}-${Date.now()}-${idx}`,
        holder_name: `${payload["name_first"] || "Guest"} ${payload["name_last"] || ""}`.trim(),
        status: "VALID",
      }));
      await supabase.from("tickets").insert(tickets);
    }

    // Fetch order + tickets to notify user
    const { data: order } = await supabase
      .from("orders")
      .select("customer_phone, customer_name, customer_email")
      .eq("id", orderId)
      .maybeSingle();
    const { data: tickets } = await supabase
      .from("tickets")
      .select("qr_code")
      .eq("order_id", orderId);

    const ticketList = (tickets || []).map((t) => t.qr_code).join("\n- ");
    const name = order?.customer_name || "there";
    const message = `Hi ${name}, payment received ✅\nYour tickets are ready:\n- ${ticketList || "Ticket issued"}\nShow this QR code at the gate.`;

    if (order?.customer_phone) {
      await sendWhatsAppMessage(order.customer_phone, message);
    }

    return ok();
  } catch (err) {
    console.error("PayFast notify error:", err);
    return error("Processing error", 500);
  }
});
