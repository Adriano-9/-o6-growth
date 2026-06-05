"use client";

import { Package } from "lucide-react";
import { Field, FormShell } from "../_components/FormShell";
import { useOfferBook } from "../_lib/store";

export default function OfertaPage() {
  const { state, setOferta, hydrated } = useOfferBook();
  const o = state.oferta;
  const set = (patch: Partial<typeof o>) => setOferta({ ...o, ...patch });

  if (!hydrated) return null;

  return (
    <FormShell
      title="Oferta"
      description="Construção da oferta — produto, mecanismo único, garantia e prova."
      icon={<Package className="h-5 w-5" />}
    >
      <Field
        label="Produto"
        value={o.produto}
        onChange={(v) => set({ produto: v })}
        full
      />
      <Field
        label="Ticket"
        value={o.ticket}
        onChange={(v) => set({ ticket: v })}
        placeholder="R$"
      />
      <Field
        label="Garantia"
        value={o.garantia}
        onChange={(v) => set({ garantia: v })}
        placeholder="Ex.: 7 dias, satisfação ou reembolso"
      />
      <Field
        label="Transformação"
        value={o.transformacao}
        onChange={(v) => set({ transformacao: v })}
        textarea
        full
      />
      <Field
        label="Diferencial"
        value={o.diferencial}
        onChange={(v) => set({ diferencial: v })}
        textarea
        full
      />
      <Field
        label="Mecanismo Único"
        value={o.mecanismoUnico}
        onChange={(v) => set({ mecanismoUnico: v })}
        textarea
        full
      />
      <Field
        label="Prova"
        value={o.prova}
        onChange={(v) => set({ prova: v })}
        textarea
        full
        placeholder="Resultados, depoimentos, dados, cases..."
      />
    </FormShell>
  );
}
