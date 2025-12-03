import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import { processUserMessage } from './agent';

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS for frontend testing
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // Set this in Meta Dashboard
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // From Meta
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // From Meta

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
