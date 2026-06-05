"use client";

import { Stethoscope } from "lucide-react";
import { Field, FormShell } from "../_components/FormShell";
import { useOfferBook } from "../_lib/store";

export default function DiagnosticoPage() {
  const { state, setDiagnostico, hydrated } = useOfferBook();
  const d = state.diagnostico;
  const set = (patch: Partial<typeof d>) => setDiagnostico({ ...d, ...patch });

  if (!hydrated) return null;

  return (
    <FormShell
      title="Diagnóstico"
      description="Raio-X operacional do cliente — onde o pipeline vaza, onde acelera."
      icon={<Stethoscope className="h-5 w-5" />}
    >
      <Field
        label="Tempo médio de resposta ao lead"
        value={d.tempoResposta}
        onChange={(v) => set({ tempoResposta: v })}
        placeholder="Ex.: 5 min, 1 hora, 1 dia"
      />
      <Field
        label="Origem dos leads"
        value={d.origemLeads}
        onChange={(v) => set({ origemLeads: v })}
        placeholder="Ex.: Meta Ads, Google, indicação"
      />
      <Field
        label="CRM utilizado"
        value={d.crm}
        onChange={(v) => set({ crm: v })}
        placeholder="Ex.: HubSpot, RD Station, planilha"
      />
      <Field
        label="Número de vendedores"
        value={d.vendedores}
        onChange={(v) => set({ vendedores: v })}
        placeholder="Ex.: 3"
      />
      <Field
        label="Ticket médio"
        value={d.ticketMedio}
        onChange={(v) => set({ ticketMedio: v })}
        placeholder="R$"
      />
      <Field
        label="Conversão atual"
        value={d.conversaoAtual}
        onChange={(v) => set({ conversaoAtual: v })}
        placeholder="Ex.: 12%"
      />
      <Field
        label="Leads por mês"
        value={d.leadsMes}
        onChange={(v) => set({ leadsMes: v })}
        placeholder="Ex.: 200"
      />
    </FormShell>
  );
}
