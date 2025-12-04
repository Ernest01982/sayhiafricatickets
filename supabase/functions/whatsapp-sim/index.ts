import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type TicketTypeRow = { id: string; name: string; price: number };
type SessionState = {
  step?: "list" | "ticket" | "quantity" | "details";
  eventId?: string;
  eventTitle?: string;
  ticketTypes?: TicketTypeRow[];
  ticketType?: TicketTypeRow | null;
  quantity?: number | null;
  name?: string | null;
  email?: string | null;
};

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

const payfastMerchantId = Deno.env.get("PAYFAST_MERCHANT_ID") || "10004002"; // Sandbox defaults
const payfastMerchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY") || "q1cd2rdny4a53";
const payfastReturnUrl = Deno.env.get("PAYFAST_RETURN_URL") || "https://sayhi.africa/pay/success";
const payfastCancelUrl = Deno.env.get("PAYFAST_CANCEL_URL") || "https://sayhi.africa/pay/cancel";
const payfastNotifyUrl = Deno.env.get("PAYFAST_NOTIFY_URL") || "https://illeefvnyyilddhhwooz.functions.supabase.co/payfast-notify";
const frontendBaseUrl = Deno.env.get("FRONTEND_URL") || "https://sayhiafricatickets.netlify.app";

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

const createOrder = async (args: { eventId: string; total: number; quantity: number; ticketType: string; phone?: string; customerName?: string; customerEmail?: string }) => {
  if (!supabase) return null;
  const { data, error: err } = await supabase
    .from("orders")
    .insert({
      event_id: args.eventId,
      customer_name: args.customerName || "WhatsApp User",
      customer_email: args.customerEmail || "whatsapp@sayhi.africa",
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

const generatePaymentLink = async (eventName: string, ticketType: string, quantity: number, phone?: string, customerName?: string, customerEmail?: string) => {
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
      const orderId = await createOrder({ eventId, total, quantity, ticketType, phone, customerName, customerEmail });
      if (orderId) {
        const link = `${frontendBaseUrl.replace(/\/$/, "")}/pay?amt=${total.toFixed(2)}&ref=${orderId}&name=${encodeURIComponent(customerName || "Customer")}&email=${encodeURIComponent(customerEmail || "")}`;
        return { link, total, eventTitle: event.title, ticketType: ticketTypeId ? ticketType : ticketType, quantity };
      }
    }
  }

  const fallbackLink = `${frontendBaseUrl.replace(/\/$/, "")}/pay?amt=${total.toFixed(2)}&ref=${Date.now()}&name=${encodeURIComponent(customerName || "Customer")}&email=${encodeURIComponent(customerEmail || "")}`;
  return { link: fallbackLink, total, eventTitle: eventName, ticketType, quantity };
};

const formatEvents = (events: Awaited<ReturnType<typeof getEvents>>) =>
  events
    .map((ev, idx) => {
      return `${idx + 1}. ${ev.title} (${ev.date})`;
    })
    .join("\n");

const buildReply = (args: { events: Awaited<ReturnType<typeof getEvents>>; message: string; state?: SessionState }) => {
  const { events, message, state } = args;
  const current: SessionState = state || {};

  const lower = message.toLowerCase();
  const ticketMatch = message.match(/(?:ticket|qr|id)[^a-zA-Z0-9]?[:#]?\s*([A-Za-z0-9-]{6,})/i);
  const numbers = (message.match(/\d+/g) || []).map((n) => parseInt(n, 10));
  const eventNumber = numbers.length > 0 ? numbers[0] : NaN;
  const typeNumber = numbers.length > 1 ? numbers[1] : NaN;
  const qtyNumber = numbers.length > 2 ? numbers[2] : numbers.length === 2 ? numbers[1] : NaN;
  const emailMatch = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const nameCandidate = message
    .replace(emailMatch ? emailMatch[0] : "", "")
    .replace(/\d+/g, "")
    .replace(/(tickets?|tix|general|vip|early|option|select|choose|pay|payment|link)/gi, "")
    .trim();

  if (ticketMatch) {
    return { type: "ticket-check", ticketId: ticketMatch[1] };
  }

  // Greeting or start over
  if (!events.length || lower.includes("hi") || lower.includes("hello")) {
    return {
      type: "list",
      body: `Here are events you can book:\n${formatEvents(events)}\n\nReply with the event number to continue.`,
      state: { step: "list" },
    };
  }

  let nextState: SessionState = { ...(current || {}) };

  // Ensure we have the current event object
  let event = events.find((e) => e.id === nextState.eventId) || events[0];
  const ticketTypes = Array.isArray(event.ticket_types) ? event.ticket_types : [];

  // Step 1: Event selection
  if (nextState.step !== "ticket" && nextState.step !== "quantity" && nextState.step !== "details") {
    const idx = !Number.isNaN(eventNumber) ? eventNumber - 1 : -1;
    event = idx >= 0 && events[idx] ? events[idx] : event;
    nextState = {
      step: "ticket",
      eventId: event.id,
      eventTitle: event.title,
      ticketTypes,
      ticketType: null,
      quantity: null,
      email: null,
      name: null,
    };
    const options = ticketTypes.map((t, i) => `${i + 1}. ${t.name} - R${t.price}`).join("\n");
    return { type: "flow", state: nextState, response: `Great, "${event.title}". Ticket options:\n${options}\n\nWhich ticket type number do you want?` };
  }

  // Step 2: Ticket type selection
  if (!nextState.ticketType) {
    const idx = !Number.isNaN(typeNumber) ? typeNumber - 1 : -1;
    const picked = idx >= 0 && ticketTypes[idx] ? ticketTypes[idx] : ticketTypes.find((t) => lower.includes(t.name.toLowerCase()));
    if (picked) {
      nextState = { ...nextState, ticketType: picked, step: "quantity" };
    } else {
      const options = ticketTypes.map((t, i) => `${i + 1}. ${t.name} - R${t.price}`).join("\n");
      return { type: "flow", state: nextState, response: `Ticket options:\n${options}\n\nWhich ticket type number do you want?` };
    }
  }

  // Step 3: Quantity
  if (!nextState.quantity || nextState.quantity < 1) {
    if (!Number.isNaN(qtyNumber) && qtyNumber > 0) {
      nextState = { ...nextState, quantity: qtyNumber, step: "details" };
    } else {
      return { type: "flow", state: nextState, response: `How many "${nextState.ticketType?.name}" tickets do you need?` };
    }
  }

  // Step 4: Details (name + email)
  if (emailMatch && !nextState.email) {
    nextState.email = emailMatch[0];
  }
  if (!nextState.name && nameCandidate && nameCandidate.length > 2) {
    nextState.name = nameCandidate;
  }
  if (!nextState.email || !nextState.name) {
    return { type: "flow", state: nextState, response: `Please send your Name & Surname AND your Email to finish the invoice.` };
  }

  // Ready for payment
  nextState.step = "details";
  return { type: "flow", state: nextState };
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
  const clientState: SessionState | undefined = body.state;
  const events = await getEvents();
  const intent = buildReply({ events, message: body.message, state: clientState });

  try {
    if (intent.type === "ticket-check" && intent.ticketId) {
      const status = await checkTicketStatus(intent.ticketId);
      return ok({ response: status, state: clientState || {} });
    }

    if (intent.type === "list") {
      return ok({ response: intent.body, state: intent.state || {} });
    }

    if (intent.type === "flow") {
      const state = intent.state || {};
      const event = events.find((e) => e.id === state.eventId) || events[0];

      if (!state.ticketType) {
        const types = Array.isArray(event.ticket_types) ? event.ticket_types : [];
        const options = types.map((t, idx) => `${idx + 1}. ${t.name} - R${t.price}`).join("\n");
        return ok({
          response: intent.response || `Great, "${event.title}". Ticket options:\n${options}\n\nWhich ticket type number do you want?`,
          state,
        });
      }

      if (!state.quantity || state.quantity < 1) {
        return ok({
          response: intent.response || `How many "${state.ticketType}" tickets do you need?`,
          state,
        });
      }

      if (!state.email || !state.name) {
        return ok({
          response: intent.response || `Please send your Name & Surname AND your Email to finish the invoice.`,
          state,
        });
      }

      const payment = await generatePaymentLink(
        state.eventTitle || event.title || "Event",
        typeof state.ticketType === "string" ? state.ticketType : state.ticketType?.name || "General Admission",
        state.quantity,
        phone,
        state.name || undefined,
        state.email || undefined
      );
      const baseReply = `Almost there! ${state.eventTitle || event.title}\n${typeof state.ticketType === "string" ? state.ticketType : state.ticketType?.name} x${state.quantity}\nTotal: R${payment.total.toFixed(2)}\nPay here: ${payment.link}\nAfter payment, QR tickets and invoice will be sent here.`;
      const flavoured = await summarize(`Rewrite for WhatsApp in 2 short lines, friendly and clear:\n${baseReply}`);
      return ok({ response: flavoured || baseReply, state: { step: "list" } });
    }

    return ok({ response: "How can I help?", state: clientState || {} });
  } catch (err) {
    console.error("Function error:", err);
    return error("System Error. Please try again.", 500);
  }
});
