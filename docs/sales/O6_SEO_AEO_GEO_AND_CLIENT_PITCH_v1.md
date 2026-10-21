# O6 - SEO, AEO, GEO e conversa comercial v1

Data: 2026-10-20  
Status: base de alinhamento; validar o Diagnóstico Express antes de vender como automação pronta

## Decisão de posicionamento

SEO, AEO e GEO devem aparecer como uma camada de qualidade em sites, landing pages e conteúdo digital da O6, não como três promessas independentes de resultado.

- **SEO**: tornar páginas compreensíveis e elegíveis para descoberta em mecanismos de busca, cobrindo conteúdo, estrutura técnica, experiência e contexto local quando aplicável.
- **AEO**: organizar conteúdo para responder perguntas de forma direta e legível por experiências que apresentam respostas, como snippets e assistentes. Não há garantia de ocupar esses espaços.
- **GEO**: práticas para melhorar a clareza da entidade, a qualidade das fontes e a possibilidade de sistemas generativos encontrarem e referenciarem a marca. O nome do campo ainda é usado de formas diferentes; não é um fator de ranking que a O6 possa controlar.

O Google orienta que as boas práticas de SEO continuam sendo a base para as experiências generativas da Busca. Não promete inclusão nem recomenda atalhos especiais para IA. A O6 não deve vender posição no Google, snippet, citação por IA, tráfego, leads ou receita garantidos.

## Onde aplicar

### Site institucional

- Páginas rastreáveis, título e descrição únicos, hierarquia correta de headings, links internos e imagens com texto alternativo útil.
- Sitemap, robots, canonical, indexação e desempenho verificados antes/depois da publicação.
- Oferta, serviços, autoria, localização e contato explicados sem contradições.
- Dados estruturados apenas quando representarem conteúdo visível e real da página.

### Landing pages

- Prioridade é a conversão da campanha: público, oferta, provas verificáveis, objeções e uma ação principal.
- SEO é relevante quando a página deve receber tráfego orgânico. Em LP de mídia paga ou teste temporário, indexação pode não ser o objetivo.
- AEO pode orientar perguntas reais e respostas concisas; não adicionar FAQ artificial nem schema sem conteúdo correspondente.
- GEO depende também de reputação e referências externas; uma página bem estruturada não força uma IA a citar a empresa.

### Portfólio

- Manter o design e os trabalhos aprovados; melhorar descoberta sem refazer o material.
- Cada projeto pode ter título, descrição, contexto, escopo e evidências próprias, desde que os dados sejam verdadeiros e autorizados.
- Metadados, headings, texto alternativo, links e navegação devem facilitar leitura humana e rastreamento.

### Busca local e avaliações do Google

- Em negócios locais, revisar Google Business Profile, nome/endereço/telefone coerentes, páginas de localização quando justificadas e o caminho de contato.
- Orientar o cliente a convidar todos os clientes reais, de forma neutra, para deixar uma avaliação; responder com profissionalismo.
- Nunca comprar avaliações, oferecer benefício, pedir apenas avaliações positivas ou solicitar conteúdo/nota específica. O Google proíbe incentivos e seleção de clientes satisfeitos, e pode remover avaliações ou restringir o perfil.
- Gestão de perfil, respostas recorrentes e monitoramento não estão automaticamente incluídos em um projeto de site; definir escopo antes de vender.

### Entrega comercial de sites e LPs

Oferta recomendada: **site ou landing page com fundamentos de SEO e estrutura de conteúdo preparada para respostas diretas e descoberta por IA**.

Incluir no escopo conforme o projeto: auditoria básica, metadados, headings, rastreabilidade, estrutura de conteúdo, links, imagens e schema pertinente. Search Console, analytics, pesquisa de consultas, monitoramento contínuo e otimização mensal são escopos adicionais, com acesso, instrumentação e limites definidos.

Não apresentar AEO e GEO como “hack”, pacote de posição ou recurso que o código sozinho resolve. Resultado depende de qualidade da oferta e conteúdo, concorrência, autoridade, indexação, fontes externas e mudanças nas plataformas.

## Pitch de descoberta para reunião com cliente

### Abertura

“Antes de sugerir um site ou campanha, quero entender o que você quer que a pessoa faça, como ela encontra a empresa hoje e o que já foi tentado. Assim a gente define se o desafio é ser encontrado, explicar melhor a oferta, gerar confiança ou facilitar o contato.”

### Perguntas de briefing

1. Qual serviço ou produto é prioridade e para quem?
2. Como os clientes chegam hoje: indicação, busca, redes sociais, anúncios ou outros canais?
3. Quais perguntas e dúvidas aparecem antes da compra?
4. Qual ação a página precisa gerar: ligação, WhatsApp, formulário, compra ou agendamento?
5. Há dados, avaliações, casos ou credenciais que podemos publicar com autorização?
6. O site precisa atrair busca orgânica ou será usado principalmente em campanha paga e compartilhamento direto?
7. Quais acessos e métricas existem hoje, e quem aprova conteúdo e investimento?

### Explicação curta para o cliente

“SEO ajuda a página a ser entendida e descoberta na busca. AEO organiza as informações para responder perguntas com clareza. GEO é o conjunto de práticas que pode ajudar sistemas de IA a entender a marca e considerar suas fontes. A base é conteúdo útil, estrutura técnica e confiança; ninguém sério consegue garantir posição ou citação. Primeiro definimos o objetivo e depois medimos o que é possível com os dados disponíveis.”

### Fechamento sem pressão

“Com o que você me contou, o próximo passo parece ser [diagnóstico / projeto pontual / retainer]. Vou registrar o escopo, as entregas, o que depende de acesso ou dados e como vamos avaliar o resultado. Se ainda faltar informação, começamos por uma análise delimitada em vez de presumir a solução.”

## Diagnóstico Express: auditoria do estado atual

**Conclusão: ainda não está pronto como fluxo automatizado de ponta a ponta para cliente.** Há código útil, mas partes separadas:

- `app/_lib/diagnostico-completo/build-report.ts` constrói um relatório determinístico a partir de contexto e evidências.
- `app/_lib/diagnostico-completo/format-final-report.ts` formata a saída.
- `app/api/diagnostico/submit/route.ts` aceita o payload e devolve relatório/Markdown. A própria rota declara que não persiste no Supabase.
- `app/_lib/diagnostico-completo/intake-form.html` é um formulário de teste ligado ao endpoint, mas está dentro de `_lib` e não é uma página pública do produto.
- `app/_lib/diagnosis-engine/` é outro motor (capability-based), sem rota, tela ou persistência segundo `docs/registry/SYSTEM_STATE.yaml`.
- `app/api/audit/route.ts` avalia uma URL de prospect e grava em `audits`; não substitui o fluxo de diagnóstico express do cliente.
- `app/api/checkout/diagnostico/route.ts` responde 410, então não há checkout ativo para essa página. A LP antiga ainda chama o diagnóstico de gratuito; essa inconsistência deve ser removida antes de direcionar tráfego.

### Lacunas antes de chamar de pronto

1. Decidir o que “Express” avalia e para quem; não misturar a auditoria de prospect com diagnóstico estratégico de cliente.
2. Criar uma tela pública com formulário, consentimento e estados de envio/erro/conclusão.
3. Validar todos os campos no servidor com schema e limites; hoje a rota valida apenas nome do negócio e se `painEvidence` é array.
4. Persistir entrada, versão do método, relatório e estado de entrega com migration e política de acesso revisadas.
5. Definir saída legível e aprovada por humano; distinguir evidência observada, informação declarada e hipótese.
6. Testar um caso real de ponta a ponta, inclusive falha, repetição, privacidade e envio/retomada do relatório.
7. Corrigir a LP antiga para não dizer “gratuito” nem oferecer checkout enquanto a oferta correspondente estiver indisponível.

Não alterar tabelas existentes nem reativar cobrança sem decisão explícita. O endpoint atual pode servir de base técnica, mas não deve ser tratado como produto final.

## Skills e pesquisa

- O ambiente Codex dispõe da skill `marketing:seo-audit`; ela pode apoiar uma auditoria, mas não foi encontrada nas pastas de skills versionadas do projeto para sincronização direta com Claude.
- Candidato popular para auditoria e SEO técnico: [AgriciDaniel/codex-seo](https://github.com/AgriciDaniel/codex-seo), com cerca de 841 stars na consulta de 2026-10-20. É uma suíte ampla (múltiplos workflows/agentes e integrações), não uma skill pequena; popularidade não prova segurança ou adequação. Revisar licença, scripts, dependências e instruções antes de instalar.
- Candidato para trabalhar com Search Console e métricas reais: [iannuttall/seo](https://github.com/iannuttall/seo), Apache-2.0 e cerca de 586 stars na consulta. Depende de conexão à conta do Search Console/Analytics; keyword/competitor research pode depender de chave DataForSEO ou Ahrefs.
- Candidato a SEO local: [SE Ranking seo-skills](https://github.com/seranking/seo-skills), skill `seo-local`. Abrange Google Business Profile, NAP, citações e reviews, mas o fluxo documentado depende de SE Ranking MCP e pode usar Firecrawl.
- Candidato focado nos três termos: [staksoft/geo-seo-aeo-skill](https://github.com/staksoft/geo-seo-aeo-skill), licença MIT e cerca de 7 stars; código de auditoria Python sem dependências, porém histórico público ainda curto. Serve como checklist a revisar, não como autoridade sobre ranking.
- A suíte [garrettjsmith/localseoskills](https://github.com/garrettjsmith/localseoskills) oferece muitos workflows de SEO local e reviews, mas exige um provedor MCP próprio ou integrações de ferramentas; não é uma instalação leve para o estado atual do O6.
- Decisão atual: não instalar pacote amplo às cegas. Começar com auditoria manual/skill já disponível; quando o Search Console estiver conectado, avaliar o `iannuttall/seo` como ferramenta de dados. Para SEO local, extrair somente um checklist depois de revisão de licença, scripts e dependências.

## Fontes

- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google Search Central: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Search Central: evaluating third-party SEO advice](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)
- [AgriciDaniel/codex-seo](https://github.com/AgriciDaniel/codex-seo)
- [staksoft/geo-seo-aeo-skill](https://github.com/staksoft/geo-seo-aeo-skill)
- [SE Ranking seo-skills](https://github.com/seranking/seo-skills)
- [Google Business Profile: solicitar avaliações](https://support.google.com/business/answer/3474122)
- [Google Business Profile: conteúdo proibido e avaliações falsas](https://support.google.com/business/answer/7400114)
