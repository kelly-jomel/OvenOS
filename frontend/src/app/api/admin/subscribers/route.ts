export const dynamic = "force-static";
export const revalidate = false;

import { NextResponse } from "next/server";

export interface SubscriberRecord {
  bakery_id: string;
  trading_name: string;
  country: string;
  owner_email: string;
  owner_name: string;
  subscription_plan: "free" | "pro";
  subscription_status: "active" | "cancelled" | "past_due";
  subscription_start_date: string;
  subscription_end_date: string | null;
  mrr: number;
}

export const MOCK_SUBSCRIBERS: SubscriberRecord[] = [
  {
    bakery_id: "bk-901",
    trading_name: "Atelier du Pain & Viennoiserie",
    country: "France",
    owner_email: "pierre.laurent@atelier-pain.fr",
    owner_name: "Pierre Laurent",
    subscription_plan: "pro",
    subscription_status: "active",
    subscription_start_date: "2026-08-15",
    subscription_end_date: "2027-08-15",
    mrr: 5.0,
  },
  {
    bakery_id: "bk-902",
    trading_name: "Velvet Crumb Bakery Co.",
    country: "United States",
    owner_email: "sarah@velvetcrumb.com",
    owner_name: "Sarah Chen",
    subscription_plan: "pro",
    subscription_status: "active",
    subscription_start_date: "2026-09-01",
    subscription_end_date: "2027-09-01",
    mrr: 6.0,
  },
  {
    bakery_id: "bk-903",
    trading_name: "Golden Crust Patisserie",
    country: "United Kingdom",
    owner_email: "clara.b@goldencrust.co.uk",
    owner_name: "Clara Bell",
    subscription_plan: "pro",
    subscription_status: "active",
    subscription_start_date: "2026-07-20",
    subscription_end_date: "2027-07-20",
    mrr: 5.0,
  },
  {
    bakery_id: "bk-904",
    trading_name: "Sugar & Sourdough Micro-Bakery",
    country: "Australia",
    owner_email: "marcus@sugarsourdough.com.au",
    owner_name: "Marcus Rossi",
    subscription_plan: "free",
    subscription_status: "active",
    subscription_start_date: "2026-10-10",
    subscription_end_date: null,
    mrr: 0.0,
  },
  {
    bakery_id: "bk-905",
    trading_name: "Nordic Crumb Patisserie",
    country: "Sweden",
    owner_email: "elena@nordiccrumb.se",
    owner_name: "Elena Larsson",
    subscription_plan: "pro",
    subscription_status: "active",
    subscription_start_date: "2026-06-12",
    subscription_end_date: "2027-06-12",
    mrr: 5.0,
  },
  {
    bakery_id: "bk-906",
    trading_name: "Artisan Crust Cottage Bakes",
    country: "United States",
    owner_email: "hannah@artisancrust.org",
    owner_name: "Hannah Miller",
    subscription_plan: "free",
    subscription_status: "active",
    subscription_start_date: "2026-11-01",
    subscription_end_date: null,
    mrr: 0.0,
  },
];

export async function GET() {
  return NextResponse.json(MOCK_SUBSCRIBERS, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
