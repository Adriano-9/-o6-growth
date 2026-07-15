/**
 * Monta um DiagnosisReport diretamente a partir de evidências reais —
 * sem scoring genérico de capabilities, sem abstração de vertical.
 * Escrito deliberadamente para o caso Jhun/Empório (playbook
 * docs/playbooks/diagnostico-completo.md); generalizar só quando um
 * caso real diferente exigir.
 */
import type {
  ClassificacaoTempoResposta,
  ClientContext,
  DiagnosisGap,
  DiagnosisReport,
  PainEvidence,
  ServiceRecommendation,
  SeveridadeGap,
} from "./types";

export type BuildDiagnosisReportInput = {
  clientContext: ClientContext;
  /** Dados medidos de verdade — ex.: testes manuais de tempo de resposta no WhatsApp. */
  painEvidence: PainEvidence[];
  /** Respostas do questionário de ~20 perguntas (opcional). */
  interviewAnswers?: Record<string, string>;
};

/**
 * Extrai minutos de um valor medido em texto pt-BR ("2h11min", ">20min",
 * "45 min", "1h"). Retorna undefined quando não há número interpretável.
 * Para valores com ">" (limite inferior, medição ainda aberta), retorna o
 * mínimo conhecido — o texto original continua sendo a fonte no relatório.
 */
export function parseDurationMinutes(raw: string): number | undefined {
  const s = raw.toLowerCase().replace(/\s+/g, "");
  const hourMatch = s.match(/(\d+)h(?:(\d+)(?:min)?)?/);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60 + (hourMatch[2] ? parseInt(hourMatch[2], 10) : 0);
  }
  const minMatch = s.match(/(\d+)min/);
  if (minMatch) return parseInt(minMatch[1], 10);
  return undefined;
}

/**
 * Detecta contato ainda em aberto ("sem resposta ainda, já se passaram X
 * minutos") — diferente de "respondeu em X minutos". Um contato aberto
 * é pior que um contato lento-mas-concluído: não sabemos quando (se)
 * será respondido, e o cliente pode desistir a qualquer momento.
 */
export function isUnresolved(ev: PainEvidence): boolean {
  return /sem resposta/i.test(ev.valorMedido) || /sem resposta/i.test(ev.descricao);
}

/**
 * Thresholds do playbook seção 7: <5min excelente, 5-30 aceitável, >30
 * crítico — mas só se aplica a interações CONCLUÍDAS (respondeu em X
 * minutos). Contato ainda sem resposta é SEMPRE crítico, independente
 * de quantos minutos já se passaram — o problema não é velocidade, é
 * estar em aberto.
 */
export function classifyResponseTime(
  minutes: number,
  unresolved = false,
): ClassificacaoTempoResposta {
  if (unresolved) return "critico";
  if (minutes < 5) return "excelente";
  if (minutes <= 30) return "aceitavel";
  return "critico";
}

function severityFor(unresolved: boolean, minutes: number | undefined, descricao: string): SeveridadeGap {
  if (unresolved) return "alta";
  const mentionsLostSale = /venda perdida|pedido perdido|perd(eu|i) (a )?venda/i.test(descricao);
  if (mentionsLostSale) return "alta";
  if (minutes === undefined) return "media";
  const c = classifyResponseTime(minutes);
  if (c === "critico") return "alta";
  if (c === "aceitavel") return "media";
  return "baixa";
}

/**
 * Sinal de custo usado para ranquear: contato em aberto pesa mais que
 * qualquer tempo medido (é um risco ativo, não uma métrica de lentidão);
 * minutos medidos acima do threshold crítico contam mais; menção
 * explícita a venda perdida conta mais ainda.
 */
function costSignal(ev: PainEvidence): number {
  const minutes = parseDurationMinutes(ev.valorMedido);
  const unresolvedBoost = isUnresolved(ev) ? 20_000 : 0;
  const lostSaleBoost = /venda perdida|pedido perdido/i.test(ev.descricao) ? 10_000 : 0;
  return unresolvedBoost + lostSaleBoost + (minutes ?? 0);
}

/** Evidência é sobre tempo de resposta? (contato em aberto ou minutos medidos) */
export function isResponseTimeEvidence(ev: PainEvidence): boolean {
  return isUnresolved(ev) || parseDurationMinutes(ev.valorMedido) !== undefined;
}

/**
 * Evidência é sobre no-show/falta por ausência de processo de confirmação?
 * Gap operacional, não gap de tempo de resposta — precisa de frase própria
 * em vez do fallback genérico de "métrica não-temporal".
 */
export function isNoShowEvidence(ev: PainEvidence): boolean {
  return /no-?show/i.test(ev.valorMedido) || /no-?show|confirmaç[aã]o/i.test(ev.descricao);
}

function parseNoShowCount(valorMedido: string): string {
  const match = valorMedido.match(/(\d+)/);
  return match ? match[1] : valorMedido;
}

function gapFromEvidence(ev: PainEvidence): DiagnosisGap {
  const minutes = parseDurationMinutes(ev.valorMedido);
  const unresolved = isUnresolved(ev);

  const medicao =
    ev.fonte === "teste_manual"
      ? `teste manual em ${ev.dataMedicao}`
      : "declarado na entrevista";

  const severidade = severityFor(unresolved, minutes, `${ev.descricao} ${ev.valorMedido}`);

  // Caso 1 — contato em aberto (sem resposta ainda).
  if (unresolved) {
    return {
      titulo: `Contato sem resposta no ${ev.canal}`,
      oQueEstaAcontecendo: `Contato em aberto no ${ev.canal} (${medicao}): ${ev.valorMedido} — não é um caso de resposta lenta, é um cliente esperando sem saber se será atendido. Pior que uma resposta demorada porém concluída, porque o desfecho ainda é incerto.`,
      fonte: ev,
      impactoFinanceiroEstimado: undefined,
      oQueResolveria: `Garantir que nenhum contato no ${ev.canal} fique sem resposta — mesmo uma resposta parcial imediata evita o abandono.`,
      severidade,
    };
  }

  // Caso 2 — no-show/falta por ausência de processo de confirmação. Gap
  // operacional, não gap de tempo de resposta — frase própria em vez do
  // fallback genérico (evita citar "limite de 30 minutos" indevidamente).
  if (isNoShowEvidence(ev)) {
    const count = parseNoShowCount(ev.valorMedido);
    return {
      titulo: `No-show sem processo de confirmação (${ev.canal})`,
      oQueEstaAcontecendo: `${count} no-shows por semana, sem processo de confirmação (${medicao}).`,
      fonte: ev,
      impactoFinanceiroEstimado: undefined,
      oQueResolveria: `Implementar confirmação de horário/pedido (mensagem automática ou ligação) antes do atendimento.`,
      severidade,
    };
  }

  // Caso 3 — métrica NÃO-temporal genérica (fallback). parseDurationMinutes
  // não extraiu minutos, então NÃO faz sentido citar "limite de 30 minutos".
  if (minutes === undefined) {
    return {
      titulo: `${ev.descricao} (${ev.canal})`,
      oQueEstaAcontecendo: `${ev.descricao} no ${ev.canal} (${medicao}): ${ev.valorMedido}.`,
      fonte: ev,
      impactoFinanceiroEstimado: undefined,
      oQueResolveria: `Endereçar diretamente: ${ev.descricao}.`,
      severidade,
    };
  }

  // Caso 4 — tempo de resposta medido (concluído). O texto respeita se o
  // valor está acima ou dentro do limite de 30 min — nunca afirmar "crítico"
  // quando é aceitável.
  const acimaDoLimite = minutes > 30;
  const acontecendo = acimaDoLimite
    ? `${ev.descricao} no ${ev.canal}: ${ev.valorMedido} (${medicao}) — acima do limite de 30 minutos a partir do qual a resposta é considerada crítica.`
    : `${ev.descricao} no ${ev.canal}: ${ev.valorMedido} (${medicao}) — dentro da faixa aceitável (até 30 min), mas ainda há margem para chegar abaixo de 5 min.`;

  return {
    titulo: `Tempo de resposta no ${ev.canal}`,
    oQueEstaAcontecendo: acontecendo,
    fonte: ev,
    // Sem dois números reais (ticket × pedidos perdidos) não estimamos R$ —
    // regra de honestidade do playbook seção 6.
    impactoFinanceiroEstimado: undefined,
    oQueResolveria: `Reduzir o tempo de primeira resposta no ${ev.canal} para menos de ${acimaDoLimite ? "30" : "5"} minutos.`,
    severidade,
  };
}

/** Catálogo real de preços usado na Proposta_Carol_O6 (playbook seção 9). */
const SERVICE_CATALOG: ServiceRecommendation[] = [
  { servico: "site_simples", preco: 800, escopoDefinido: true, escopo: "Site institucional simples" },
  { servico: "site_completo", preco: 1500, escopoDefinido: true, escopo: "Site completo" },
  { servico: "manutencao_mensal", preco: 500, escopoDefinido: true, escopo: "Manutenção mensal" },
  { servico: "sprint", preco: 4800, escopoDefinido: false }, // escopo indefinido — não prometer conteúdo
];

export function buildDiagnosisReport(input: BuildDiagnosisReportInput): DiagnosisReport {
  const { clientContext, painEvidence, interviewAnswers } = input;

  const ranked = [...painEvidence].sort((a, b) => costSignal(b) - costSignal(a));
  const gaps = ranked.slice(0, 3).map(gapFromEvidence);

  // Só evidências de tempo de resposta entram nesta tabela — métricas
  // não-temporais (ex.: no-shows/semana) não são "tempo de resposta por canal".
  const scoreTempoRespostaPorCanal = painEvidence
    .filter(isResponseTimeEvidence)
    .map((ev) => {
      const minutes = parseDurationMinutes(ev.valorMedido);
      const unresolved = isUnresolved(ev);
      return {
        canal: ev.canal,
        tempoMedidoMinutos: minutes,
        classificacao:
          minutes !== undefined
            ? classifyResponseTime(minutes, unresolved)
            : ("critico" as const), // unresolved sem minutos parseáveis
      };
    });

  const pior = gaps[0];
  const resumoExecutivo = pior
    ? `Foi medido o tempo real de resposta nos canais de atendimento de ${clientContext.nomeNegocio}. O achado principal: ${pior.oQueEstaAcontecendo} Cada contato sem resposta rápida é uma venda em risco.`
    : `Nenhuma evidência medida foi fornecida para ${clientContext.nomeNegocio} — diagnóstico incompleto, sem gaps a reportar.`;

  const datasTestes = [
    ...new Set(painEvidence.filter((e) => e.fonte === "teste_manual").map((e) => e.dataMedicao)),
  ];
  const comoFoiFeito =
    `Teste manual de tempo de resposta como cliente anônimo` +
    (datasTestes.length ? ` (datas: ${datasTestes.join(", ")})` : "") +
    (interviewAnswers && Object.keys(interviewAnswers).length > 0
      ? ` + entrevista estruturada com o dono (${Object.keys(interviewAnswers).length} respostas registradas).`
      : ". Entrevista estruturada ainda não realizada.");

  // Recomenda o que resolve o GAP #1 primeiro (playbook seção 9): gap de
  // resposta/atendimento → manutenção mensal cobre rotina de atendimento;
  // site entra como opção complementar. Sprint listado sem escopo.
  const proximosPassosRecomendados: ServiceRecommendation[] = pior
    ? SERVICE_CATALOG.filter((s) =>
        ["manutencao_mensal", "site_simples", "sprint"].includes(s.servico),
      )
    : [];

  return {
    cliente: clientContext,
    dataGeracao: new Date().toISOString(),
    resumoExecutivo,
    comoFoiFeito,
    gaps,
    scoreTempoRespostaPorCanal,
    proximosPassosRecomendados,
  };
}
