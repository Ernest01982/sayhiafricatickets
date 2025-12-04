import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type TicketTypeRow = { id: string; name: string; price: number };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY");
const geminiKey = Deno.env.get("GEMINI_API_KEY") || "";

const payfastMerchantId = Deno.env.get("PAYFAST_MERCHANT_ID") || "10000100";
const payfastMerchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY") || "46f0cd694581a";
const payfastReturnUrl = Deno.env.get("PAYFAST_RETURN_URL") || "https://sayhi.africa/pay/success";
const payfastCancelUrl = Deno.env.get("PAYFAST_CANCEL_URL") || "https://sayhi.africa/pay/cancel";
const payfastNotifyUrl = Deno.env.get("PAYFAST_NOTIFY_URL") || "https://example.com/payfast/notify";

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const readJson = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};

const ok = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

const error = (message: string, status = 400) => ok({ error: message }, status);

const getEvents = async () => {
  if (!supabase) return [];
  const { data, error: err } = await supabase
    .from("events")
    .select("id,title,date,venue,status,ticket_types(id,name,price)")
    .order("date", { ascending: true })
    .limit(10);
  if (err || !data) return [];
  return data as Array<{ id: string; title: string; date: string; status: string; venue: string; ticket_types: TicketTypeRow[] }>;
};

const buildPayfastLink = (params: Record<string, string>) => {
  const search = new URLSearchParams(params);
  return `https://sandbox.payfast.co.za/eng/process?${search.toString()}`;
};

const createOrder = async (args: { eventId: string; total: number; quantity: number; ticketType: string; phone?: string }) => {
  if (!supabase) return null;
  const { data, error: err } = await supabase
    .from("orders")
    .insert({
      event_id: args.eventId,
      customer_name: "WhatsApp User",
      customer_email: "whatsapp@sayhi.africa",
      customer_phone: args.phone || "unknown",
      total_amount: args.total,
      status: "PENDING",
      channel: "WHATSAPP",
    })
    .select("id")
    .maybeSingle();
  if (err) return null;
  return data?.id as string | null;
};

const generatePaymentLink = async (eventName: string, ticketType: string, quantity: number, phone?: string) => {
  let total = Math.max(1, quantity) * 100;
  let eventId: string | null = null;
  let ticketTypeId: string | null = null;

  if (supabase) {
    const { data: event } = await supabase
      .from("events")
      .select("id,title,status,ticket_types(id,name,price)")
      .ilike("title", `%${eventName}%`)
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (event) {
      eventId = event.id;
      const match = Array.isArray(event.ticket_types)
        ? (event.ticket_types as TicketTypeRow[]).find((t) => t.name.toLowerCase() === ticketType.toLowerCase()) ??
          (event.ticket_types as TicketTypeRow[])[0]
        : null;
      if (match) {
        ticketTypeId = match.id;
        total = Number(match.price || 0) * Math.max(1, quantity);
      }
      const orderId = await createOrder({ eventId, total, quantity, ticketType, phone });
      if (orderId) {
        const link = buildPayfastLink({
          merchant_id: payfastMerchantId,
          merchant_key: payfastMerchantKey,
          amount: total.toFixed(2),
          item_name: `${eventName} x${quantity}`,
          return_url: payfastReturnUrl,
          cancel_url: payfastCancelUrl,
          notify_url: payfastNotifyUrl,
          custom_str1: orderId,
          custom_str2: eventName,
          custom_str3: ticketType,
          custom_str4: ticketTypeId || "",
          custom_int1: String(quantity),
        });
        return { link, total, eventTitle: event.title, ticketType: ticketTypeId ? ticketType : ticketType, quantity };
      }
    }
  }

  const fallback = buildPayfastLink({
    merchant_id: payfastMerchantId,
    merchant_key: payfastMerchantKey,
    amount: total.toFixed(2),
    item_name: `${eventName} x${quantity}`,
    return_url: payfastReturnUrl,
    cancel_url: payfastCancelUrl,
    notify_url: payfastNotifyUrl,
    custom_str2: eventName,
    custom_str3: ticketType,
    custom_int1: String(quantity),
  });

  return { link: fallback, total, eventTitle: eventName, ticketType, quantity };
};

const formatEvents = (events: Awaited<ReturnType<typeof getEvents>>) =>
  events
    .map((ev, idx) => {
      const status = ev.status && ev.status !== "PUBLISHED" ? ` [${ev.status}]` : "";
      const types = Array.isArray(ev.ticket_types) && ev.ticket_types.length
        ? (ev.ticket_types as TicketTypeRow[])
            .map((t) => `  - ${t.name}: R${t.price}`)
            .join("\n")
        : "  - Standard: R100";
      return `${idx + 1}. ${ev.title} (${ev.date})${status}\n${types}`;
    })
    .join("\n\n");

const buildReply = (args: { events: Awaited<ReturnType<typeof getEvents>>; message: string; phone?: string }) => {
  const { events, message } = args;
  const lower = message.toLowerCase();
  const ticketMatch = message.match(/(?:ticket|qr|id)[^a-zA-Z0-9]?[:#]?\s*([A-Za-z0-9-]{6,})/i);
  const qtyMatch = message.match(/(\d+)\s*(?:tickets|tix|x)/i);
  const quantity = qtyMatch ? Math.max(1, parseInt(qtyMatch[1], 10)) : 1;

  if (ticketMatch) {
    return { type: "ticket-check", ticketId: ticketMatch[1] };
  }

  if (!events.length || lower.includes("hi") || lower.includes("event") || lower.includes("ticket")) {
    return { type: "list", body: `Here are events you can book:\n${formatEvents(events)}\n\nReply with the option number, ticket type, and quantity.` };
  }

  const indexMatch = message.match(/(\d+)/);
  let selected = events[0];
  if (indexMatch) {
    const idx = parseInt(indexMatch[1], 10) - 1;
    if (events[idx]) selected = events[idx];
  }

  const ticketNames = Array.isArray(selected.ticket_types)
    ? (selected.ticket_types as TicketTypeRow[]).map((t) => t.name.toLowerCase())
    : [];
  const matchedType =
    ticketNames.find((n) => lower.includes(n)) ||
    (ticketNames.length ? ticketNames[0] : "General Admission");

  return {
    type: "payment",
    event: selected,
    ticketType: matchedType,
    quantity,
  };
};

const checkTicketStatus = async (ticketId: string) => {
  if (!supabase) return "Ticket validation unavailable.";
  const { data, error: err } = await supabase
    .from("tickets")
    .select("status, holder_name")
    .or(`id.eq.${ticketId},qr_code.eq.${ticketId}`)
    .maybeSingle();
  if (err || !data) return "Invalid Ticket.";
  return `Status: ${data.status} | Holder: ${data.holder_name || "Unknown"}`;
};

const summarize = async (prompt: string) => {
  if (!geminiKey) return null;
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return null;
    const text = parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("\n").trim();
    return text || null;
  } catch {
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return error("Method not allowed", 405);
  }

  const body = await readJson(req);
  if (!body || typeof body.message !== "string") {
    return error("Message is required", 400);
  }

  const phone = typeof body.phone === "string" ? body.phone : "unknown";
  const events = await getEvents();
  const intent = buildReply({ events, message: body.message, phone });

  try {
    if (intent.type === "ticket-check" && intent.ticketId) {
      const status = await checkTicketStatus(intent.ticketId);
      return ok({ response: status });
    }

    if (intent.type === "list" || !intent.event) {
      return ok({ response: intent.body });
    }

    const payment = await generatePaymentLink(intent.event.title, intent.ticketType, intent.quantity, phone);
    const baseReply = `Great choice! ${intent.event.title}\n${intent.ticketType} x${intent.quantity}\nTotal: R${payment.total.toFixed(2)}\n\nPay here: ${payment.link}\n\nAfter PayFast confirms, your QR tickets arrive in this chat.`;

    const flavoured = await summarize(
      `Rewrite for WhatsApp in 2 short lines, friendly and clear:\n${baseReply}`
    );
    return ok({ response: flavoured || baseReply });
  } catch (err) {
    console.error("Function error:", err);
    return error("System Error. Please try again.", 500);
  }
});
