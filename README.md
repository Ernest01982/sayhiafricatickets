# Say HI Africa – WhatsApp Ticketing Platform

Say HI Africa is a WhatsApp-first ticketing suite for African event promoters. The repository contains a Vite/React dashboard and a lightweight Node/Express backend that proxies WhatsApp webhooks and hosts the Gemini-powered agent.

---

## Architecture

1. **Frontend** – Vite + React + Tailwind + Recharts (dashboard, scanner, simulator).
2. **Backend** – Express + Supabase SDK + Gemini agent (handles WhatsApp webhooks and `/chat` endpoint).
3. **Database** – Supabase (PostgreSQL + Row Level Security).
4. **AI layer** – Google Gemini (tool-calling agent).

---

## Frontend (Dashboard) Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment variables** – copy `.env.local.example` and add your keys:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_BROWSER_KEY
   VITE_BACKEND_URL=http://localhost:3000
   ```
   `GEMINI_API_KEY` must come from your Google account in [AI Studio](https://aistudio.google.com/)—keep it private and out of version control. `VITE_BACKEND_URL` should point at the Express server so the WhatsApp simulator can talk to the real agent.
3. **Run the dev server**
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

---

## Backend Server Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```
2. **Create `backend/.env` (you can start from `backend/.env.example`)**
   ```env
   PORT=3000
   API_KEY=your-google-genai-api-key

   # Supabase (Project Settings → API)
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-secret-key

   # Gemini (https://aistudio.google.com/)
   # Use your own Google account's API key; do not commit real keys.

   # Optional – WhatsApp Cloud API creds
   VERIFY_TOKEN=my_secure_verify_token
   WHATSAPP_TOKEN=your-meta-access-token
   PHONE_NUMBER_ID=your-whatsapp-phone-id
   ```
3. **Run the server**
   ```bash
   npm start
   ```
   - Health check: `GET http://localhost:3000/health`
   - Simulator endpoint: `POST http://localhost:3000/chat { "message": "Hi" }`
   - Meta webhook: `POST http://localhost:3000/webhook`

> The backend now surfaces friendly errors if Supabase or Gemini credentials are missing and safely acknowledges webhook calls to avoid retries.

---

## Database Setup (Supabase)

1. Visit [database.new](https://database.new) and create a new project.
2. Open the **SQL Editor** and run the script below.

```sql
-- Enable UUID support
create extension if not exists "uuid-ossp";

-- Strong typing
create type user_role as enum ('PROMOTER', 'ADMIN');
create type event_status as enum ('DRAFT', 'PUBLISHED', 'COMPLETED');
create type order_status as enum ('PAID', 'PENDING', 'REFUNDED', 'COMP');
create type ticket_status as enum ('VALID', 'USED', 'INVALID');

-- PROFILES (extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role user_role default 'PROMOTER',
  organization_name text,
  whatsapp_number text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- EVENTS
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  promoter_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  date date not null,
  time time not null,
  venue text not null,
  image_url text,
  status event_status default 'DRAFT',
  total_capacity int default 0,
  tickets_sold int default 0,
  revenue decimal(12,2) default 0.00,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- TICKET TYPES
create table public.ticket_types (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  price decimal(10,2) not null default 0,
  capacity int not null default 100,
  sold int default 0
);

-- COUPONS
create table public.coupons (
  id uuid default uuid_generate_v4() primary key,
  promoter_id uuid references public.profiles(id) not null,
  code text not null,
  discount_value decimal(10,2) not null,
  discount_type text check (discount_type in ('PERCENTAGE', 'FIXED')),
  max_usage int default 100,
  usage_count int default 0,
  status text default 'ACTIVE',
  expiry_date timestamptz
);

-- ORDERS
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  total_amount decimal(10,2) not null,
  status order_status default 'PENDING',
  channel text default 'WHATSAPP',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- TICKETS
create table public.tickets (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  ticket_type_id uuid references public.ticket_types(id) not null,
  qr_code text unique not null,
  holder_name text,
  status ticket_status default 'VALID',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- CHECK-IN LOGS
create table public.check_in_logs (
  id uuid default uuid_generate_v4() primary key,
  ticket_id uuid references public.tickets(id),
  gate_name text,
  scanner_id text,
  status text,
  timestamp timestamptz default timezone('utc'::text, now())
);

-- RLS
alter table profiles enable row level security;
alter table events enable row level security;
alter table orders enable row level security;

create policy "Public Read Events" on events for select using (true);
create policy "Public Read Ticket Types" on ticket_types for select using (true);
```

---

## Testing the AI Agent (Simulator)

1. Start both servers together with `npm run dev:full` (starts Vite + backend dev server), or start individually:
   - Backend: `npm start` inside `backend/`
   - Frontend: `npm run dev` in the project root
3. Log in as Admin and launch **WhatsApp Simulator**.
4. Send any message. The frontend now calls `POST /chat`, which forwards the request to Gemini and Supabase and streams the response back.

If the backend is offline or missing credentials, the simulator will surface the exact error message instead of silently failing.
