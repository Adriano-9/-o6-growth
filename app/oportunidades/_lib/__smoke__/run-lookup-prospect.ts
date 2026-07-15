/**
 * Teste isolado de lookupProspectByName com prospects reais da tabela.
 * Exige .env.local com NEXT_PUBLIC_SUPABASE_URL/ANON_KEY + rede que
 * resolva o host do Supabase.
 *
 * Rodar: npx tsx --env-file=.env.local app/oportunidades/_lib/__smoke__/run-lookup-prospect.ts
 */
import { lookupProspectByName } from "../lookup-prospect";

async function main() {
  for (const nome of ["Clínica Flórida", "Nudik", "Negócio Que Não Existe 123"]) {
    console.log(`\n=== lookup: "${nome}" ===`);
    const result = await lookupProspectByName(nome);
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((e) => {
  console.error("smoke test falhou:", e);
  process.exit(1);
});
