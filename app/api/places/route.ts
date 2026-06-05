import { NextRequest, NextResponse } from "next/server";
import { PlaceResult } from "@/app/oportunidades/_lib/types";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Parse "Rua X, 123 - Bairro, Salvador - BA, 40000-000, Brazil" */
function parseAddress(address: string): { cidade: string; estado: string } {
  if (!address) return { cidade: "", estado: "" };

  // "City - ST," or "City - ST " (end)
  const match = address.match(/,\s*([^,]+?)\s*-\s*([A-Z]{2})\s*(?:,|$)/);
  if (match) {
    return { cidade: match[1].trim(), estado: match[2].trim() };
  }

  // Fallback — last segment before country
  const parts = address.split(",").map((p) => p.trim());
  const stateIdx = parts.findIndex((p) => /^[A-Z]{2}$/.test(p));
  if (stateIdx > 0) {
    return { cidade: parts[stateIdx - 1], estado: parts[stateIdx] };
  }

  return { cidade: "", estado: "" };
}

function cleanPhone(raw: string | undefined): string {
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").trim();
}

// ─────────────────────────────────────────────────────────────
// Serper.dev Maps API call (single page)
// ─────────────────────────────────────────────────────────────

type SerperPlace = {
  title?: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  category?: string;
  phoneNumber?: string;
  website?: string;
  placeId?: string;
};

async function fetchSerperPage(
  query: string,
  page: number,
  num: number,
  apiKey: string,
): Promise<SerperPlace[]> {
  const res = await fetch("https://google.serper.dev/maps", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num, page, gl: "br", hl: "pt-br" }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Serper ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { places?: SerperPlace[] };
  return data.places ?? [];
}

// ─────────────────────────────────────────────────────────────
// POST /api/places
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "SERPER_API_KEY não configurada",
        setup:
          "Adicione SERPER_API_KEY=<sua_key> em .env.local. Obtenha em https://serper.dev",
      },
      { status: 503 },
    );
  }

  let body: { query?: string; cidade?: string; limit?: number };
  try {
    body = (await req.json()) as { query?: string; cidade?: string; limit?: number };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { query, cidade, limit = 20 } = body;
  if (!query || !cidade) {
    return NextResponse.json(
      { error: "query e cidade são obrigatórios" },
      { status: 400 },
    );
  }

  const fullQuery = `${query} ${cidade}`;
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(Math.min(limit, 200) / PAGE_SIZE);

  const allPlaces: SerperPlace[] = [];

  try {
    for (let page = 1; page <= totalPages; page++) {
      const places = await fetchSerperPage(
        fullQuery,
        page,
        PAGE_SIZE,
        apiKey,
      );
      allPlaces.push(...places);
      // Stop early if Serper returned fewer than a full page
      if (places.length < PAGE_SIZE) break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[api/places]", msg);
    return NextResponse.json(
      { error: msg },
      { status: 502 },
    );
  }

  const results: PlaceResult[] = allPlaces
    .slice(0, limit)
    .map((p) => {
      const { cidade: cidadeParsed, estado } = parseAddress(p.address ?? "");
      return {
        nome: p.title ?? "",
        site: p.website ?? "",
        telefone: cleanPhone(p.phoneNumber),
        endereco: p.address ?? "",
        instagram: "",
        cidade: cidadeParsed,
        estado,
        googleRating: p.rating != null ? Number(p.rating) : null,
        googleReviews: p.ratingCount != null ? Number(p.ratingCount) : null,
        categoria: p.category ?? query,
        googlePlaceId: p.placeId ?? "",
      };
    })
    .filter((r) => r.nome.length > 0);

  return NextResponse.json({
    results,
    total: results.length,
    pages: totalPages,
    query: fullQuery,
  });
}

// GET not allowed — explicit 405
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
