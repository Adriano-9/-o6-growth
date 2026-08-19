/**
 * Referência de caso real: Jhun.
 *
 * Não há informação suficiente nesta sessão para classificar o modelo de
 * negócio do Jhun em nenhuma vertical específica (solo-service,
 * local-retail, program-membership, etc.). Em vez de inventar uma
 * vertical fake, este arquivo reexporta a genérica — quando houver
 * informação real, criar uma vertical dedicada (ou reusar uma das
 * existentes se o modelo bater) e atualizar o registry.
 */
import { GENERIC_VERTICAL } from "./generic";
import type { VerticalConfig } from "../types";

export const UNCLASSIFIED_JHUN_VERTICAL: VerticalConfig = {
  ...GENERIC_VERTICAL,
  id: "unclassified-jhun",
  label: "Não classificado (Jhun — pendente de informação real do negócio)",
  description:
    "Placeholder explícito: usa a configuração genérica até haver dado real suficiente para definir a vertical correta.",
};

export type { VerticalConfig };
