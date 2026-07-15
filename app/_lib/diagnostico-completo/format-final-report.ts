/**
 * Formata um DiagnosisReport (saída de buildDiagnosisReport, ver
 * build-report.ts) em markdown pronto para enviar ao cliente — peça
 * final do fluxo descrito no playbook docs/playbooks/diagnostico-completo.md
 * (seção 8, modelo de relatório). Só consome o DiagnosisReport já
 * montado — nenhuma lógica de scoring, ranking ou classificação vive
 * aqui; isso é responsabilidade exclusiva de build-report.ts.
 */
import type {
  ClassificacaoTempoResposta,
  DiagnosisReport,
  ServiceRecommendation,
  SeveridadeGap,
} from "./types";

const CLASSIFICACAO_LABEL: Record<ClassificacaoTempoResposta, string> = {
  excelente: "🟢 Excelente",
  aceitavel: "🟡 Aceitável",
  critico: "🔴 Crítico",
};

const SEVERIDADE_LABEL: Record<SeveridadeGap, string> = {
  alta: "🔴 Alta",
  media: "🟡 Média",
  baixa: "🟢 Baixa",
};

const SERVICO_LABEL: Record<ServiceRecommendation["servico"], string> = {
  site_simples: "Site simples",
  site_completo: "Site completo",
  manutencao_mensal: "Manutenção mensal",
  sprint: "Sprint",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatServico(s: ServiceRecommendation): string {
  const preco = s.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (s.escopoDefinido && s.escopo) {
    return `- **${SERVICO_LABEL[s.servico]}** — ${preco}: ${s.escopo}`;
  }
  // Sprint hoje: preço existe, escopo não — nunca inventar o que não foi definido.
  return `- **${SERVICO_LABEL[s.servico]}** — ${preco} (escopo a definir)`;
}

export function formatFinalReport(report: DiagnosisReport, clientName: string): string {
  const lines: string[] = [];

  // 1. Header
  lines.push(`# Diagnóstico Completo O6 — ${clientName}`);
  lines.push(`\n*Gerado em ${formatDate(report.dataGeracao)}*`);
  lines.push(`\n---\n`);

  // 2. Resumo executivo
  lines.push(`## Resumo executivo\n`);
  lines.push(report.resumoExecutivo);
  lines.push(`\n*Como foi feito: ${report.comoFoiFeito}*\n`);

  // 3. Scoreboard
  lines.push(`## Tempo de resposta por canal\n`);
  if (report.scoreTempoRespostaPorCanal.length > 0) {
    lines.push(`| Canal | Tempo medido | Classificação |`);
    lines.push(`|---|---|---|`);
    for (const s of report.scoreTempoRespostaPorCanal) {
      const tempo = s.tempoMedidoMinutos !== undefined ? `${s.tempoMedidoMinutos} min` : "não medido";
      lines.push(`| ${s.canal} | ${tempo} | ${CLASSIFICACAO_LABEL[s.classificacao]} |`);
    }
  } else {
    lines.push(`Nenhum canal testado ainda.`);
  }
  lines.push("");

  // 4. Até 3 gaps
  lines.push(`## Principais gaps encontrados\n`);
  if (report.gaps.length > 0) {
    report.gaps.forEach((gap, i) => {
      lines.push(`### Gap ${i + 1}: ${gap.titulo}\n`);
      lines.push(`**O que está acontecendo:** ${gap.oQueEstaAcontecendo}\n`);
      const evidencia =
        typeof gap.fonte === "string"
          ? "Declarado na entrevista com o cliente."
          : `${gap.fonte.canal} — ${gap.fonte.valorMedido} (${gap.fonte.fonte === "teste_manual" ? `teste manual em ${gap.fonte.dataMedicao}` : "declarado na entrevista"}).`;
      lines.push(`**Evidência:** ${evidencia}\n`);
      lines.push(`**Severidade:** ${SEVERIDADE_LABEL[gap.severidade]}\n`);
      if (gap.impactoFinanceiroEstimado !== undefined) {
        const impacto = gap.impactoFinanceiroEstimado.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        lines.push(`**Impacto financeiro estimado:** ${impacto}/mês\n`);
      } else {
        lines.push(`**Impacto financeiro estimado:** não quantificável com os dados coletados\n`);
      }
      lines.push(`**Recomendação:** ${gap.oQueResolveria}\n`);
    });
  } else {
    lines.push(`Nenhum gap identificado com os dados disponíveis até o momento.\n`);
  }

  // 5. Serviços recomendados
  lines.push(`## Serviços recomendados\n`);
  if (report.proximosPassosRecomendados.length > 0) {
    for (const s of report.proximosPassosRecomendados) {
      lines.push(formatServico(s));
    }
  } else {
    lines.push(`Nenhum serviço recomendado neste momento — sem gaps que justifiquem.`);
  }
  lines.push("");

  // 6. Footer
  lines.push(`---\n`);
  lines.push(`*Relatório gerado por O6 Growth — diagnóstico comercial baseado em dados reais, sem métricas inventadas.*`);
  if (report.validadeProposta) {
    lines.push(`\n*Proposta válida até: ${report.validadeProposta}*`);
  }

  return lines.join("\n");
}
