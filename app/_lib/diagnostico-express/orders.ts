import "server-only";

import { getSupabaseAdmin } from "@/app/_lib/supabase-admin";
import type { DiagnosisCheckoutSession } from "./stripe";

export type DiagnosisOrder = {
  id: string;
  checkoutSessionId: string;
  paymentStatus: string;
  intakeCompleted: boolean;
  runId: string | null;
};

export async function upsertDiagnosisOrder(
  session: DiagnosisCheckoutSession,
): Promise<DiagnosisOrder> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("diagnostico_express_orders")
    .upsert(
      {
        checkout_session_id: session.id,
        payment_intent_id: session.paymentIntentId,
        customer_email: session.customerDetails.email,
        customer_phone: session.customerDetails.phone,
        amount_total: session.amountTotal,
        currency: session.currency,
        payment_status: session.paymentStatus,
        metadata_json: session.metadata,
      },
      { onConflict: "checkout_session_id" },
    )
    .select("id, checkout_session_id, payment_status, intake_completed, run_id")
    .single();

  if (error || !data) {
    throw new Error(`Não foi possível registrar o pedido: ${error?.message ?? "sem retorno"}`);
  }

  return {
    id: data.id as string,
    checkoutSessionId: data.checkout_session_id as string,
    paymentStatus: data.payment_status as string,
    intakeCompleted: Boolean(data.intake_completed),
    runId: (data.run_id as string | null) ?? null,
  };
}

export async function completeDiagnosisOrder(
  orderId: string,
  runId: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("diagnostico_express_orders")
    .update({ intake_completed: true, run_id: runId })
    .eq("id", orderId);

  if (error) {
    throw new Error(`Não foi possível concluir o pedido: ${error.message}`);
  }
}
