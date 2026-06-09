import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PlaceResult } from "@/app/oportunidades/_lib/types";
import { notifyTelegram, formatNewProspects } from "@/app/_lib/telegram";

// Allow up to 5 min on Vercel Pro+ -- locally Node has no timeout
export const maxDuration = 300;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ApifyPlace = {
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  totalScore?: number;
  reviewsCount?: number;
  phone?: string;
  website?: string;
  categoryName?: string;
  placeId?: string;
  permanentlyClosed?: boolean;
  temporarilyClosed?: boolean;
};

type ProspectRow = {
  nome: string;
  site: string;
  telefone: string;
  instagram: string;
  endereco: string;
  cidade: string;
  estado: string;
  google_rating: number | null;
  google_reviews: number | null;
  categoria: string;
  google_place_id: string | null;
  status: "Novo";
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function cleanPhone(raw: string | undefined): string {
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").trim();
}

/** Fallback city/state parser for when Apify doesn't split the address */
function parseAddressFallback(address: string): { cidade: string; estado: string } {
  if (!address) return { cidade: "", estado: "" };
  const match = address.match(/,\s*([^,]+?)\s*-\s*([A-Z]{2})\s*(?:,|$)/);
  if (match) return { cidade: match[1].trim(), estado: match[2].trim() };
  return { cidade: "", estado: "" };
}

function placeResultToRow(r: PlaceResult): ProspectRow {
  return {
    nome: r.nome,
    site: r.site,
    telefone: r.telefone,
    instagram: r.instagram,
    endereco: r.endereco,
    cidade: r.cidade,
    estado: r.estado,
    google_rating: r.googleRating,
    google_reviews: r.googleReviews,
    categoria: r.categoria,
    google_place_id: r.googlePlaceId || null,
    status: "Novo",
  };
}

// ─────────────────────────────────────────────────────────────
// POST /api/apify-search
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error: "APIFY_TOKEN nao configurada",
        setup:
          "Adicione APIFY_TOKEN=<sua_key> em .env.local. Obtenha em https://apify.com/settings/integrations",
      },
      { status: 503 },
    );
  }

  let body: { query?: string; cidade?: string; limit?: number };
  try {
    body = (await req.json()) as { query?: string; cidade?: string; limit?: number };
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const { query, cidade, limit = 20 } = body;
  if (!query || !cidade) {
    return NextResponse.json(
      { error: "query e cidade sao obrigatorios" },
      { status: 400 },
    );
  }

  const searchQuery = `${query} ${cidade}`;
  const maxPlaces = Math.min(limit, 200);

  // run-sync-get-dataset-items: starts actor, waits, and returns items in one request
  let items: ApifyPlace[];
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items` +
        `?token=${token}&timeout=280&format=json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchStringsArray: [searchQuery],
          maxCrawledPlacesPerSearch: maxPlaces,
          language: "en",
          countryCode: "br",
          includeHistogram: false,
          includeOpeningHours: false,
          includePeopleAlsoSearch: false,
          maxImages: 0,
          exportPlaceUrls: false,
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Apify ${res.status}: ${text.slice(0, 300)}`);
    }

    items = (await res.json()) as ApifyPlace[];
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao chamar Apify";
    console.error("[api/apify-search]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const results: PlaceResult[] = items
    .filter((p) => !p.permanentlyClosed && !p.temporarilyClosed)
    .map((p) => {
      const fallback = parseAddressFallback(p.address ?? "");
      return {
        nome: p.title ?? "",
        site: p.website ?? "",
        telefone: cleanPhone(p.phone),
        instagram: "",
        endereco: p.address ?? "",
        cidade: p.city ?? fallback.cidade,
        estado: p.state ?? fallback.estado,
        googleRating: p.totalScore != null ? Number(p.totalScore) : null,
        googleReviews: p.reviewsCount != null ? Number(p.reviewsCount) : null,
        categoria: p.categoryName ?? query,
        googlePlaceId: p.placeId ?? "",
      };
    })
    .filter((r) => r.nome.length > 0)
    .slice(0, limit);

  // ─────────────────────────────────────────────────────────────
  // Save to Supabase with tri-key deduplication
  // ─────────────────────────────────────────────────────────────

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && results.length > 0) {
    const sb = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // 1. Collect candidate keys for deduplication
    const placeIds = results
      .map((r) => r.googlePlaceId)
      .filter((v): v is string => Boolean(v));
    const sites = results
      .map((r) => r.site)
      .filter((v): v is string => v.length > 5);
    const phones = results
      .map((r) => r.telefone)
      .filter((v): v is string => Boolean(v));

    // 2. Query existing records for all three keys in parallel
    const [byPlaceId, bySite, byPhone] = await Promise.all([
      placeIds.length > 0
        ? sb.from("prospects").select("google_place_id").in("google_place_id", placeIds)
        : Promise.resolve({ data: [] }),
      sites.length > 0
        ? sb.from("prospects").select("site").in("site", sites)
        : Promise.resolve({ data: [] }),
      phones.length > 0
        ? sb.from("prospects").select("telefone").in("telefone", phones)
        : Promise.resolve({ data: [] }),
    ]);

    const existingPlaceIds = new Set(
      ((byPlaceId.data ?? []) as { google_place_id: string }[]).map(
        (r) => r.google_place_id,
      ),
    );
    const existingSites = new Set(
      ((bySite.data ?? []) as { site: string }[]).map((r) => r.site),
    );
    const existingPhones = new Set(
      ((byPhone.data ?? []) as { telefone: string }[]).map((r) => r.telefone),
    );

    // 3. Filter DB duplicates and deduplicate within the batch
    const seenPlaceIds = new Set<string>();
    const seenSites = new Set<string>();
    const seenPhones = new Set<string>();

    const toInsert = results.filter((r) => {
      if (
        r.googlePlaceId &&
        (existingPlaceIds.has(r.googlePlaceId) || seenPlaceIds.has(r.googlePlaceId))
      )
        return false;
      if (
        r.site &&
        r.site.length > 5 &&
        (existingSites.has(r.site) || seenSites.has(r.site))
      )
        return false;
      if (r.telefone && (existingPhones.has(r.telefone) || seenPhones.has(r.telefone)))
        return false;

      if (r.googlePlaceId) seenPlaceIds.add(r.googlePlaceId);
      if (r.site && r.site.length > 5) seenSites.add(r.site);
      if (r.telefone) seenPhones.add(r.telefone);
      return true;
    });

    skipped = results.length - toInsert.length;

    // 4. Insert in chunks of 50
    const CHUNK = 50;
    for (let i = 0; i < toInsert.length; i += CHUNK) {
      const chunk = toInsert.slice(i, i + CHUNK);
      const { error } = await sb
        .from("prospects")
        .insert(chunk.map(placeResultToRow));

      if (error) {
        console.error("[api/apify-search] batch insert error", error);
        errors += chunk.length;
      } else {
        imported += chunk.length;
      }
    }
  }

  // Telegram notification (fire-and-forget)
  if (imported > 0) {
    notifyTelegram(formatNewProspects(imported, searchQuery));
  }

  return NextResponse.json({
    results,
    total: results.length,
    query: searchQuery,
    imported,
    skipped,
    errors,
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
