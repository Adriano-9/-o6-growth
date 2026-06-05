"use client";

import { Building2 } from "lucide-react";
import { Field, FormShell } from "../_components/FormShell";
import { useOfferBook } from "../_lib/store";

export default function ClientesPage() {
  const { state, setCliente, hydrated } = useOfferBook();
  const c = state.cliente;

  const set = (patch: Partial<typeof c>) => setCliente({ ...c, ...patch });

  if (!hydrated) return null;

  return (
    <FormShell
      title="Cliente"
      description="Dossiê base do cliente — empresa, canais públicos e contexto comercial."
      icon={<Building2 className="h-5 w-5" />}
    >
      <Field
        label="Empresa"
        value={c.empresa}
        onChange={(v) => set({ empresa: v })}
        placeholder="Razão social ou marca"
        full
      />
      <Field
        label="Site"
        value={c.site}
        onChange={(v) => set({ site: v })}
        placeholder="https://"
      />
      <Field
        label="Instagram"
        value={c.instagram}
        onChange={(v) => set({ instagram: v })}
        placeholder="@perfil"
      />
      <Field
        label="Nicho"
        value={c.nicho}
        onChange={(v) => set({ nicho: v })}
        placeholder="Ex.: Estética avançada"
      />
      <Field
        label="Cidade"
        value={c.cidade}
        onChange={(v) => set({ cidade: v })}
      />
      <Field
        label="Estado"
        value={c.estado}
        onChange={(v) => set({ estado: v })}
        placeholder="UF"
      />
      <Field
        label="Ticket Médio"
        value={c.ticketMedio}
        onChange={(v) => set({ ticketMedio: v })}
        placeholder="R$"
      />
      <Field
        label="Fonte de Leads Atual"
        value={c.fonteLeads}
        onChange={(v) => set({ fonteLeads: v })}
        placeholder="Meta Ads, indicação, orgânico..."
        full
      />
    </FormShell>
  );
}
