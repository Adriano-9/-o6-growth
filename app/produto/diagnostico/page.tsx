import { Suspense } from "react";
import DiagnosticoExpress from "./DiagnosticoExpress";
import { SalesPage } from "./_components/SalesPage";

// Parâmetros que indicam volta do Mercado Pago (ou Stripe legado) ou acesso ao resultado.
// Com qualquer um deles, a página mostra o fluxo de verificação/formulário/resultado.
const FLOW_PARAMS = ["payment_id", "mp_status", "status", "external_reference", "token", "session_id", "checkout"];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DiagnosticoPage({ searchParams }: Props) {
  const params = await searchParams;
  const inFlow = FLOW_PARAMS.some((key) => params[key] !== undefined);

  if (inFlow) {
    return (
      <Suspense
        fallback={
          <main className="grid min-h-screen place-items-center bg-[#0D0D0D] text-sm font-black uppercase tracking-widest text-white">
            Carregando diagnóstico...
          </main>
        }
      >
        <DiagnosticoExpress />
      </Suspense>
    );
  }

  // Checkout automático só quando o servidor tem a credencial do Mercado Pago.
  // Sem ela, os botões usam o link de pagamento fixo (NEXT_PUBLIC_MP_EXPRESS_URL).
  const autoCheckout = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
  return <SalesPage autoCheckout={autoCheckout} />;
}
