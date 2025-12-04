import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY");
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
    return ok();
  } catch (err) {
    console.error("PayFast notify error:", err);
    return error("Processing error", 500);
  }
});
