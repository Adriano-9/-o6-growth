export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string;
  landing_path: string;
};

const STORAGE_KEY = "o6_attribution_v1";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function cleanToken(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const token = value.trim().toLowerCase();
  // Only short campaign tokens; never store free text, URLs, email or phone-like values.
  if (!/^[a-z][a-z0-9_-]{0,63}$/.test(token) || /\d{5,}/.test(token)) return null;
  return token;
}

export function classifyReferrer(value: unknown, ownHost?: string): string {
  if (typeof value !== "string" || !value) return "direct";
  try {
    const host = new URL(value).hostname.toLowerCase();
    if (ownHost && host === ownHost.toLowerCase()) return "internal";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
    if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.com") return "facebook";
    if (host === "google.com" || host.endsWith(".google.com") || host.endsWith(".google.com.br")) return "google";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
    if (host === "youtube.com" || host.endsWith(".youtube.com")) return "youtube";
    if (host === "t.co" || host === "x.com" || host === "twitter.com") return "x";
    return "external";
  } catch {
    return "direct";
  }
}

export function normalizeLandingPath(value: unknown): string {
  if (typeof value !== "string") return "/other";
  const path = value.split("?")[0].split("#")[0];
  if (path === "/") return "/";
  const section = path.match(/^\/(links|saude|advocacia|servicos|briefing|produto)(?:\/|$)/);
  return section ? `/${section[1]}` : "/other";
}

export function normalizeAttribution(input: Record<string, unknown>): Attribution {
  const utms = Object.fromEntries(UTM_KEYS.map((key) => [key, cleanToken(input[key])])) as Pick<Attribution, (typeof UTM_KEYS)[number]>;
  const referrer = typeof input.referrer === "string" &&
    /^(direct|internal|instagram|facebook|google|linkedin|youtube|x|external)$/.test(input.referrer)
    ? input.referrer : "direct";
  return { ...utms, referrer, landing_path: normalizeLandingPath(input.landing_path) };
}

export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? normalizeAttribution(value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  const existing = readAttribution();
  if (existing) return existing;
  const params = new URLSearchParams(window.location.search);
  const input: Record<string, unknown> = {
    referrer: classifyReferrer(document.referrer, window.location.hostname),
    landing_path: window.location.pathname,
  };
  for (const key of UTM_KEYS) input[key] = params.get(key);
  const attribution = normalizeAttribution(input);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Private browsing can disable sessionStorage; form submission still works.
  }
  return attribution;
}
