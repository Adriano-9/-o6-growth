"use client";

import { Target } from "lucide-react";
import { Field, FormShell } from "../_components/FormShell";
import { useOfferBook } from "../_lib/store";

export default function ICPPage() {
  const { state, setICP, hydrated } = useOfferBook();
  const i = state.icp;
  const set = (patch: Partial<typeof i>) => setICP({ ...i, ...patch });

  if (!hydrated) return null;

  return (
    <FormShell
      title="ICP"
      description="Perfil ideal de cliente — características demográficas e ponto-chave de decisão."
      icon={<Target className="h-5 w-5" />}
    >
      <Field
        label="Idade"
        value={i.idade}
        onChange={(v) => set({ idade: v })}
        placeholder="Ex.: 28-45"
      />
      <Field
        label="Sexo"
        value={i.sexo}
        onChange={(v) => set({ sexo: v })}
        placeholder="F / M / Ambos"
      />
      <Field
        label="Renda"
        value={i.renda}
        onChange={(v) => set({ renda: v })}
        placeholder="Faixa salarial"
      />
      <Field
        label="Profissão"
        value={i.profissao}
        onChange={(v) => set({ profissao: v })}
      />
      <Field
        label="Momento de Vida"
        value={i.momentoVida}
        onChange={(v) => set({ momentoVida: v })}
        placeholder="Ex.: recém-casados, transição de carreira"
        full
        textarea
      />
      <Field
        label="Objetivo Principal"
        value={i.objetivoPrincipal}
        onChange={(v) => set({ objetivoPrincipal: v })}
        full
        textarea
      />
      <Field
        label="Problema Principal"
        value={i.problemaPrincipal}
        onChange={(v) => set({ problemaPrincipal: v })}
        full
        textarea
      />
    </FormShell>
  );
}
