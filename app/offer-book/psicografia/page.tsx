"use client";

import { Brain } from "lucide-react";
import { Field, FormShell } from "../_components/FormShell";
import { useOfferBook } from "../_lib/store";

export default function PsicografiaPage() {
  const { state, setPsicografia, hydrated } = useOfferBook();
  const p = state.psicografia;
  const set = (patch: Partial<typeof p>) => setPsicografia({ ...p, ...patch });

  if (!hydrated) return null;

  return (
    <FormShell
      title="Psicografia"
      description="Mapa interno do ICP — o que move, o que trava, o que sonha."
      icon={<Brain className="h-5 w-5" />}
    >
      <Field
        label="Desejos"
        value={p.desejos}
        onChange={(v) => set({ desejos: v })}
        textarea
        full
      />
      <Field
        label="Medos"
        value={p.medos}
        onChange={(v) => set({ medos: v })}
        textarea
        full
      />
      <Field
        label="Objeções"
        value={p.objecoes}
        onChange={(v) => set({ objecoes: v })}
        textarea
        full
      />
      <Field
        label="Frustrações"
        value={p.frustracoes}
        onChange={(v) => set({ frustracoes: v })}
        textarea
        full
      />
      <Field
        label="Sonhos"
        value={p.sonhos}
        onChange={(v) => set({ sonhos: v })}
        textarea
        full
      />
      <Field
        label="Crenças"
        value={p.crencas}
        onChange={(v) => set({ crencas: v })}
        textarea
        full
      />
    </FormShell>
  );
}
