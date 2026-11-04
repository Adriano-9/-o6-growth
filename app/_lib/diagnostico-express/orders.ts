import "server-only";

import { getSupabaseAdmin } from "@/app/_lib/supabase-admin";
import type { DiagnosisCheckoutSession } from "./stripe";
import type { MercadoPagoPayment } from "./mercadopago";

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
        payment_provider: "stripe",
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

export async function upsertMercadoPagoOrder(
  payment: MercadoPagoPayment,
): Promise<DiagnosisOrder> {
  const supabase = getSupabaseAdmin();
  const checkoutId = `mp_${payment.id}`;

  const { data, error } = await supabase
    .from("diagnostico_express_orders")
    .upsert(
      {
        checkout_session_id: checkoutId,
        payment_intent_id: null,
        customer_email: payment.payerEmail,
        customer_phone: payment.payerPhone,
        amount_total: Math.round(payment.transactionAmount * 100),
        currency: payment.currencyId.toLowerCase(),
        payment_status: payment.status === "approved" ? "paid" : payment.status,
        metadata_json: payment.metadata,
        payment_provider: "mercadopago",
        mp_payment_id: String(payment.id),
        mp_preference_id: payment.externalReference,
      },
      { onConflict: "checkout_session_id" },
    )
    .select("id, checkout_session_id, payment_status, intake_completed, run_id")
    .single();

  if (error || !data) {
    throw new Error(`Não foi possível registrar o pedido MP: ${error?.message ?? "sem retorno"}`);
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
