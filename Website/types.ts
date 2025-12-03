
export enum UserRole {
  PROMOTER = 'PROMOTER',
  ADMIN = 'ADMIN',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  sold: number;
  capacity: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: EventStatus;
  revenue: number;
  ticketsSold: number;
  totalCapacity: number;
  ticketTypes: TicketType[];
  imageUrl: string;
  description?: string;
}

export interface MessageCampaign {
  id: string;
  title: string;
  audience: string;
  status: 'Sent' | 'Draft' | 'Scheduled';
  cost: number;
  sentAt?: string;
  content: string;
  type: 'MARKETING' | 'UTILITY';
}

export interface Coupon {
  id: string;
  code: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  usageCount: number;
  maxUsage: number;
  status: 'ACTIVE' | 'EXPIRED' | 'PAUSED';
  expiryDate: string;
}

export interface FinancialStat {
  label: string;
  value: string | number;
  trend?: number; // percentage
  trendLabel?: string;
  prefix?: string;
  suffix?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketType: string;
  quantity: number;
  total: number;
  status: 'PAID' | 'PENDING' | 'REFUNDED' | 'COMP';
  date: string;
  channel: 'WHATSAPP' | 'WEB' | 'DOOR' | 'ADMIN';
}

export interface Ticket {
  id: string;
  code: string;
  qr_code: string;
  status: 'VALID' | 'USED' | 'INVALID';
  holderName: string;
  type: string;
  orderId: string;
}

export interface EventFinance {
  eventId: string;
  eventName: string;
  grossSales: number;
  serviceFees: number;
  paymentFees: number;
  messagingCosts: number;
  netPayout: number;
  status: 'PAID' | 'PENDING' | 'PROCESSING';
}

export interface RiskAlert {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'PAYMENT_VELOCITY' | 'DUPLICATE_SCANS' | 'MULTIPLE_ACCOUNTS';
  description: string;
  user: string;
  timestamp: string;
  status: 'OPEN' | 'RESOLVED' | 'IGNORED';
}

export interface CheckInLog {
  id: string;
  timestamp: string;
  gate: string;
  ticketType: string;
  status: 'SUCCESS' | 'DENIED' | 'DUPLICATE';
  scannedBy: string;
}

export interface GateStat {
  name: string;
  count: number;
  velocity: number; // scans per minute
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE';
}
