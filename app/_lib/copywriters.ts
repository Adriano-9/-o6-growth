/**
 * Copywriter voice library.
 *
 * Destila a essência de agents em squads/copy/agents/*.md em "voice cards"
 * compactos para injetar em prompts Claude.
 *
 * Por que aqui e não ler o .md em runtime: rotas Vercel rodam serverless;
 * cada cold start precisaria do fs + parser + 1k+ linhas de YAML por agent.
 * Os .md ficam como referência humana; aqui mantemos só o que vai no prompt.
 */

export type CopywriterId =
  | "dan-kennedy"
  | "eugene-schwartz"
  | "gary-halbert"
  | "jon-benson";

type VoiceCard = {
  id: CopywriterId;
  name: string;
  /**
   * Bloco de voz a injetar antes das INSTRUÇÕES OBRIGATÓRIAS do prompt.
   * Não deve violar restrições do opener (sem preço, sem CTA agressiva).
   * Foco: tom, ritmo, escolha de palavras.
   */
  voiceBlock: string;
};

const VOICES: Record<CopywriterId, VoiceCard> = {
  "dan-kennedy": {
    id: "dan-kennedy",
    name: "Dan Kennedy",
    voiceBlock: `VOZ DE REFERÊNCIA: Dan Kennedy (No B.S. Direct Marketing).
- Direto, sem firula, "no bullshit". Frases curtas. Verbo na cabeça.
- Trate o dono como adulto inteligente, não como prospect.
- Use números concretos (não "muitos clientes", mas "14 clientes/mês").
- Nunca formal. Nunca corporativo. Sem "espero que esteja bem".
- Curiosidade ancorada em fato específico do negócio dele.`,
  },
  "eugene-schwartz": {
    id: "eugene-schwartz",
    name: "Eugene Schwartz",
    voiceBlock: `VOZ DE REFERÊNCIA: Eugene Schwartz (Breakthrough Advertising).
- Linguagem do mercado, não do vendedor. Diga o que ele já pensa.
- Entre na conversa que ele já tem na cabeça — não comece a sua.
- Specificity > cleverness. "às quintas a agenda vaza" > "tem dias ruins".
- Tom de observador atento, não de consultor.
- Frase única e cirúrgica vence parágrafo explicativo.`,
  },
  "gary-halbert": {
    id: "gary-halbert",
    name: "Gary Halbert",
    voiceBlock: `VOZ DE REFERÊNCIA: Gary Halbert (Boron Letters).
- A-Pile: pareça mensagem pessoal, não disparo. Nada de copy "trabalhada".
- Storyteller curto: 1 observação concreta vira gancho.
- Linguagem de bar, não de slide. "tava olhando o site de vocês" > "analisei seu site".
- Provoca sem ofender. Curiosidade > venda.
- Termine sempre como conversa, não como pitch.`,
  },
  "jon-benson": {
    id: "jon-benson",
    name: "Jon Benson",
    voiceBlock: `VOZ DE REFERÊNCIA: Jon Benson (3X VSL).
- Pattern interrupt na primeira frase. Quebre a expectativa.
- Nomeie o vilão (atrito, processo quebrado), nunca o leitor.
- Conduza com revelação, não com pitch. "Sabia que...?" > "Eu posso..."
- Cadência: frase curta, frase curta, frase média. Ritmo.
- Termine com a pergunta que ele NÃO sabe responder.`,
  },
};

export const COPYWRITER_IDS = Object.keys(VOICES) as CopywriterId[];

export function getCopywriterVoice(id: string | null | undefined): string {
  if (!id) return "";
  const card = VOICES[id as CopywriterId];
  if (!card) return "";
  return card.voiceBlock;
}

export function isValidCopywriter(id: string): id is CopywriterId {
  return id in VOICES;
}
