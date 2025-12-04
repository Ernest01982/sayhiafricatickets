import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { processUserMessage } from './agent';

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS for frontend testing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // Set this in Meta Dashboard
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // From Meta
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // From Meta
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;
const payfastMerchantId = process.env.PAYFAST_MERCHANT_ID || '10000100';
const payfastMerchantKey = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a';
const payfastReturnUrl = process.env.PAYFAST_RETURN_URL || 'https://sayhi.africa/pay/success';
const payfastCancelUrl = process.env.PAYFAST_CANCEL_URL || 'https://sayhi.africa/pay/cancel';
const payfastNotifyUrl = process.env.PAYFAST_NOTIFY_URL || 'http://localhost:3000/payfast/notify';

// Quick health check for uptime monitors and frontend diagnostics
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Verification Endpoint (Required by Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// 2. Message Handling Endpoint (Meta Webhook)
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (!body?.object) {
    return res.sendStatus(404);
  }

  const entry = body.entry?.[0];
  const changeValue = entry?.changes?.[0]?.value;
  const messageObj = changeValue?.messages?.[0];

  if (!messageObj) {
    return res.sendStatus(200);
  }

  const from = messageObj.from;
  const msgBody = messageObj.text?.body;

  if (!msgBody) {
    return res.sendStatus(200);
  }

  console.log(`Received from ${from}: ${msgBody}`);

  // Acknowledge receipt immediately to avoid timeouts
  res.sendStatus(200);

  let replyText = 'System Error.';
  try {
    replyText = await processUserMessage(msgBody, from);
  } catch (agentError: any) {
    console.error('Agent processing error:', agentError?.message || agentError);
    replyText = 'System Error.';
  }

  // Send response back to WhatsApp or simulate locally
  try {
    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
      await axios.post(
        `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: replyText },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`Replied: ${replyText}`);
    } else {
      console.log(`[SIMULATION] Replied: ${replyText}`);
    }
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
  }
});

// 3. Direct Test Endpoint (For Frontend Simulator)
app.post('/chat', async (req, res) => {
  const { message, phone } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const phoneNumber = typeof phone === 'string' && phone.trim().length > 0 ? phone : '123456789';

  try {
    console.log(`[TEST] Message from ${phoneNumber}: ${message}`);
    const response = await processUserMessage(message, phoneNumber);
    res.json({ response });
  } catch (error: any) {
    console.error('Test Chat Error:', error?.message || error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// 4. PayFast IPN handler (sandbox-friendly)
app.post('/payfast/notify', async (req, res) => {
  const payload = req.body || {};
  console.log('PayFast IPN received:', payload);

  const orderId = payload['custom_str1'] || payload['m_payment_id'];
  const ticketTypeId = payload['custom_str4'] || null;
  const quantity = parseInt(payload['custom_int1'] || '1', 10) || 1;

  if (!orderId) {
    return res.status(400).send('Missing order id');
  }

  if (!supabase) {
    console.warn('Supabase not configured; acknowledging IPN only.');
    return res.status(200).send('OK');
  }

  try {
    await supabase.from('orders').update({ status: 'PAID' }).eq('id', orderId);

    if (ticketTypeId) {
      const tickets = Array.from({ length: quantity }).map((_, idx) => ({
        order_id: orderId,
        ticket_type_id: ticketTypeId,
        qr_code: `${orderId}-${Date.now()}-${idx}`,
        holder_name: `${payload['name_first'] || 'Guest'} ${payload['name_last'] || ''}`.trim(),
        status: 'VALID',
      }));
      await supabase.from('tickets').insert(tickets);
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('PayFast notify error:', error?.message || error);
    res.status(500).send('Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
