# Atribuição O6

`captureAttribution()` e `readAttribution()` são exportados de `./attribution`.
Chame `captureAttribution()` no client ao abrir a landing page e
`readAttribution()` no submit. O tipo retornado é `Attribution | null`.
O primeiro acesso da sessão vence. O armazenamento é `sessionStorage`; não
há cookie ou identificador de usuário.

Campos: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`,
`referrer` e `landing_path`. UTMs são tokens curtos sem texto livre. Referrer
é uma categoria (`instagram`, `google`, `external`, etc.), não uma URL.
Landing path é reduzido à seção pública. Valores inválidos viram `null`.

Cliques dos CTAs de `/links` são enviados por `sendBeacon` para
`POST /api/analytics/links/click` e gravados no `connector_logs` existente.
O relatório `GET /api/analytics/links/report?days=30` devolve somente totais
por CTA. Aceita filtros `utm_*` e `referrer`; exige
`Authorization: Bearer <ANALYTICS_REPORT_TOKEN>`. Configure esse segredo
somente no servidor. Consultas aceitam no máximo 90 dias.

O evento é best-effort: bloqueadores, JavaScript desativado e indisponibilidade
do Supabase podem causar perda de cliques. A tabela existente tem policy
`anon all`; por isso o evento nunca contém URL completa, IP, user agent,
identificador de sessão ou dados de formulário. A proteção do relatório não
substitui uma futura policy privada para uma tabela analítica dedicada.
