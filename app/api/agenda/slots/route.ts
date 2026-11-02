import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/app/offer-book/_lib/supabase";
import { isSlotAvailable } from "@/app/agenda/_lib/slots";
import { rowToMeeting } from "@/app/agenda/_lib/types";
import {
  buildCandidateSlots,
  formatSlotLabel,
  O6_TIMEZONE,
} from "../_lib/availability";

function authorized(req: NextRequest): boolean {
  const secret = process.env.O6_WEBHOOK_SECRET;
  return Boolean(secret && req.headers.get("x-o6-secret") === secret);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase não configurado" },
      { status: 503 },
    );
  }

  const rawDays = Number(req.nextUrl.searchParams.get("days") ?? "10");
  const days = Number.isFinite(rawDays)
    ? Math.min(30, Math.max(1, Math.round(rawDays)))
    : 10;

  const candidates = buildCandidateSlots(days);
  if (candidates.length === 0) {
    return NextResponse.json({ timezone: O6_TIMEZONE, slots: [] });
  }

  const from = candidates[0].startsAt;
  const to = candidates[candidates.length - 1].endsAt;

  const { data, error } = await sb
    .from("meetings")
    .select("*")
    .gte("starts_at", from)
    .lte("starts_at", to)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[agenda/slots] meetings read failed", error);
    return NextResponse.json(
      { error: "Falha ao consultar agenda" },
      { status: 502 },
    );
  }

  const meetings = (data ?? []).map((row) =>
    rowToMeeting(row as Record<string, unknown>),
  );

  const slots = candidates
    .filter(({ startsAt, endsAt }) =>
      isSlotAvailable(new Date(startsAt), new Date(endsAt), meetings),
    )
    .slice(0, 20)
    .map((slot) => ({
      ...slot,
      label: formatSlotLabel(slot.startsAt),
    }));

  return NextResponse.json({
    timezone: O6_TIMEZONE,
    slots,
  });
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
