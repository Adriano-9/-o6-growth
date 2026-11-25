"use client";

import { useState } from "react";

type Props = {
  label: string;
  className?: string;
  /** Link de pagamento fixo do Mercado Pago (ou WhatsApp). Usado quando o checkout automático não está ativo ou falha. */
  fallbackUrl: string;
  /** true quando o servidor tem MERCADOPAGO_ACCESS_TOKEN: cria a preferência e volta para o site após pagar. */
  autoCheckout: boolean;
};

const base =
  "group inline-flex items-center justify-between gap-5 rounded-[2px] bg-[#f2542d] px-5 py-4 text-[15px] font-bold text-[#170904] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60";

export function CheckoutButton({ label, className = "", fallbackUrl, autoCheckout }: Props) {
  const [loading, setLoading] = useState(false);

  if (!autoCheckout) {
    return (
      <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className={`${base} ${className}`}>
        {label}
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </a>
    );
  }

  async function startCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/diagnostico", { method: "POST" });
      const data: unknown = await res.json();
      const url = typeof data === "object" && data !== null && "url" in data ? (data as { url?: unknown }).url : undefined;
      if (!res.ok || typeof url !== "string" || !url) throw new Error("checkout indisponível");
      window.location.href = url;
    } catch {
      // Sem checkout automático, a venda não se perde: cai no link fixo.
      window.location.href = fallbackUrl;
    }
  }

  return (
    <button type="button" onClick={startCheckout} disabled={loading} className={`${base} ${className}`}>
      {loading ? "Abrindo pagamento..." : label}
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </button>
  );
}
