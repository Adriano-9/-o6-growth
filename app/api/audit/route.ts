import { NextRequest, NextResponse } from "next/server";
import { load as cheerioLoad } from "cheerio";

type AuditInput = {
  prospectId: string;
  auditUrl: string;
};

type Recommendation = {
  priority: "P1" | "P2" | "P3";
  title: string;
  description: string;
  impact_brl?: number;
};

type AuditResult = {
  prospectId: string;
  auditUrl: string;
  seoScore: number;
  performanceScore: number;
  uxScore: number;
  trustScore: number;
  conversionScore: number;
  mobileScore: number;
  contentScore: number;
  overallScore: number;
  psiDesktopScore?: number;
  psiMobileScore?: number;
  recommendations: Recommendation[];
};

// ─────────────────────────────────────────────────────────────
// Fetch PageSpeed Insights
// ─────────────────────────────────────────────────────────────

async function fetchPSI(
  url: string,
  strategy: "desktop" | "mobile",
): Promise<number | undefined> {
  const key = process.env.GOOGLE_PSI_KEY;
  if (!key) return undefined;

  try {
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${key}&strategy=${strategy}`,
      { timeout: 30000 },
    );
    if (!res.ok) return undefined;

    const data = (await res.json()) as {
      lighthouseResult?: { categories?: { performance?: { score?: number } } };
    };
    const score = data.lighthouseResult?.categories?.performance?.score;
    return score ? Math.round(score * 100) : undefined;
  } catch {
    return undefined;
  }
}

// ─────────────────────────────────────────────────────────────
// Fetch and analyze HTML
// ─────────────────────────────────────────────────────────────

async function fetchAndAnalyzeHTML(
  url: string,
): Promise<{
  seoScore: number;
  uxScore: number;
  trustScore: number;
  conversionScore: number;
  contentScore: number;
}> {
  let seoScore = 0;
  let uxScore = 0;
  let trustScore = 0;
  let conversionScore = 0;
  let contentScore = 0;

  try {
    const res = await fetch(url, { timeout: 30000 });
    if (!res.ok) return { seoScore, uxScore, trustScore, conversionScore, contentScore };

    const html = await res.text();
    const $ = cheerioLoad(html);

    // ─── SEO Score (0-100)
    seoScore += $("title").length ? 10 : 0;
    seoScore += $('meta[name="description"]').length ? 10 : 0;
    seoScore += $('h1').length ? 10 : 0;
    seoScore += $('h2').length ? 10 : 0;
    seoScore += $("meta[name=viewport]").length ? 10 : 0;
    const altImages = $("img[alt]").length;
    const totalImages = $("img").length;
    seoScore += totalImages > 0 ? Math.round((altImages / totalImages) * 20) : 0;

    // ─── UX Score (0-100)
    uxScore += $("[role=navigation]").length || $("nav").length ? 15 : 0;
    uxScore += $("button").length > 0 ? 10 : 0;
    uxScore += $("input[type=text], input[type=email]").length ? 10 : 0;
    uxScore += $("footer").length ? 10 : 0;
    uxScore += $("a").length > 0 ? 10 : 0;
    const style = $("style").text().length + ($("link[rel=stylesheet]").length * 50);
    uxScore += style > 100 ? 15 : style > 0 ? 10 : 0;
    uxScore = Math.min(100, uxScore);

    // ─── Trust Score (0-100) — cpia legal, contato, certificações
    const footerText = $("footer").text().toLowerCase();
    const bodyText = $("body").text().toLowerCase();
    trustScore += footerText.includes("copyright") || footerText.includes("©") ? 15 : 0;
    trustScore += bodyText.includes("https") ? 10 : 0;
    trustScore += bodyText.includes("privacy") || bodyText.includes("política") ? 15 : 0;
    trustScore += bodyText.includes("contact") || bodyText.includes("contato") ? 10 : 0;
    trustScore += (bodyText.match(/\d{2,}\s*\d{4,}-\d{4,}/g) || []).length > 0 ? 15 : 0; // phone
    trustScore = Math.min(100, trustScore);

    // ─── Conversion Score (0-100) — CTAs, forms, clarity
    const ctaButtons = $('button, a[class*="btn"], a[class*="cta"]').length;
    const forms = $("form").length;
    conversionScore += ctaButtons > 0 ? 20 : 0;
    conversionScore += forms > 0 ? 20 : 0;
    conversionScore += bodyText.match(/\d+%|desconto|promocao|gratis/gi)?.length || 0 > 0 ? 15 : 0;
    conversionScore += bodyText.length > 500 ? 15 : 0;
    conversionScore += $("[alt*=logo], img[src*=logo]").length ? 10 : 0;
    conversionScore = Math.min(100, conversionScore);

    // ─── Content Score (0-100) — profundidade, estrutura
    const wordCount = bodyText.split(/\s+/).length;
    contentScore += wordCount > 500 ? 20 : wordCount > 200 ? 10 : 0;
    contentScore += $("p").length > 3 ? 15 : $("p").length > 0 ? 5 : 0;
    contentScore += $("ul, ol").length > 0 ? 10 : 0;
    contentScore += $("img").length > 2 ? 15 : $("img").length > 0 ? 10 : 0;
    contentScore += $("[class*=section]").length > 0 ? 10 : 0;
    contentScore += $("video, iframe[src*=youtube]").length > 0 ? 15 : 0;
    contentScore = Math.min(100, contentScore);
  } catch {
    // Fallback: network error
  }

  return { seoScore, uxScore, trustScore, conversionScore, contentScore };
}

// ─────────────────────────────────────────────────────────────
// Generate recommendations based on scores
// ─────────────────────────────────────────────────────────────

function generateRecommendations(audit: Omit<AuditResult, 'recommendations'>): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // P1: < 40
  if (audit.conversionScore < 40) {
    recommendations.push({
      priority: "P1",
      title: "Adicionar CTAs de conversão",
      description: "Botões de call-to-action não foram detectados. Adicione 'Solicitar Orçamento', 'Agendar Consulta', etc.",
      impact_brl: 5000,
    });
  }
  if (audit.seoScore < 40) {
    recommendations.push({
      priority: "P1",
      title: "Otimizar SEO técnico",
      description: "Title, meta description ou headings faltando. Impacta visibility em Google.",
      impact_brl: 3000,
    });
  }

  // P2: 40-60
  if (audit.trustScore < 50) {
    recommendations.push({
      priority: "P2",
      title: "Adicionar página de contato/privacidade",
      description: "Informações de contato e política de privacidade aumentam confiabilidade.",
      impact_brl: 2000,
    });
  }
  if (audit.contentScore < 50) {
    recommendations.push({
      priority: "P2",
      title: "Enriquecer conteúdo da página",
      description: "Adicionar mais texto, seções e imagens para estabelecer autoridade.",
      impact_brl: 2500,
    });
  }
  if (audit.uxScore < 50) {
    recommendations.push({
      priority: "P2",
      title: "Melhorar navegação e estrutura",
      description: "Menu, footer e linkagem interna podem ser aprimorados.",
      impact_brl: 1500,
    });
  }

  // P3: 60+
  if (audit.performanceScore < 70) {
    recommendations.push({
      priority: "P3",
      title: "Otimizar velocidade de carregamento",
      description: "Comprimir imagens, minificar CSS/JS, usar CDN.",
      impact_brl: 1000,
    });
  }
  if (audit.mobileScore < 70) {
    recommendations.push({
      priority: "P3",
      title: "Melhorar responsividade mobile",
      description: "Testar em dispositivos móveis e ajustar viewport.",
      impact_brl: 800,
    });
  }

  return recommendations;
}

// ─────────────────────────────────────────────────────────────
// POST /api/audit
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: AuditInput;
  try {
    body = (await req.json()) as AuditInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { prospectId, auditUrl } = body;
  if (!prospectId || !auditUrl) {
    return NextResponse.json(
      { error: "prospectId e auditUrl são obrigatórios" },
      { status: 400 },
    );
  }

  try {
    // Fetch PSI scores (performance)
    const [psiDesktop, psiMobile] = await Promise.all([
      fetchPSI(auditUrl, "desktop"),
      fetchPSI(auditUrl, "mobile"),
    ]);

    const performanceScore = psiDesktop ? Math.round((psiDesktop + (psiMobile ?? psiDesktop)) / 2) : 50;
    const mobileScore = psiMobile ?? 50;

    // Analyze HTML
    const { seoScore, uxScore, trustScore, conversionScore, contentScore } =
      await fetchAndAnalyzeHTML(auditUrl);

    // Calculate overall score (média dos 7)
    const overallScore = Math.round(
      (seoScore + performanceScore + uxScore + trustScore + conversionScore + mobileScore + contentScore) / 7,
    );

    // Build audit result
    const auditResult: AuditResult = {
      prospectId,
      auditUrl,
      seoScore,
      performanceScore,
      uxScore,
      trustScore,
      conversionScore,
      mobileScore,
      contentScore,
      overallScore,
      psiDesktopScore: psiDesktop,
      psiMobileScore: psiMobile,
      recommendations: [],
    };

    // Generate recommendations
    auditResult.recommendations = generateRecommendations(auditResult);

    // Persist in Supabase
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    );

    const { error: upsertErr } = await sb.from("audits").upsert(
      {
        prospect_id: prospectId,
        seo_score: seoScore,
        performance_score: performanceScore,
        ux_score: uxScore,
        trust_score: trustScore,
        conversion_score: conversionScore,
        mobile_score: mobileScore,
        content_score: contentScore,
        overall_score: overallScore,
        recommendations: auditResult.recommendations,
        audit_url: auditUrl,
        psi_desktop_score: psiDesktop,
        psi_mobile_score: psiMobile,
      },
      { onConflict: "prospect_id" },
    );

    if (upsertErr) {
      console.error("[api/audit] Supabase upsert failed:", upsertErr);
      return NextResponse.json(
        { error: "Falha ao salvar auditoria", details: upsertErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json(auditResult, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[api/audit]", msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
