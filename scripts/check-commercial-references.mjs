import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const targets = ["app/servicos", "app/produto", "app/offer-book-dashboard", "components/o6", "docs/content", "skills/offerbook-generator.md"];
const forbidden = [
  { expression: /R\$\s*4\.800|2×\s*R\$\s*2\.500/i, message: "preço legado de Sprint" },
  { expression: /R\$\s*1\.500\s*\/\s*m[eê]s|m[ií]nimo\s*3\s*meses/i, message: "condição legada de Retainer" },
  { expression: /Produto\s*[23]\s*[·.-]\s*(Implementa[cç][aã]o|Continuidade)/i, message: "SKU público legado" },
  { expression: /autom[aã]c[aã]o\s+de\s+atendimento/i, message: "automação anunciada como serviço independente" },
  { expression: /dashboard\s+como\s+(b[oô]nus|entrega padr[aã]o)/i, message: "dashboard anunciado como benefício padrão", allowNegated: true },
  { expression: /CRM\s+como\s+(b[oô]nus|entrega padr[aã]o)/i, message: "CRM anunciado como benefício padrão", allowNegated: true },
];

function filesIn(directory) {
  if (statSync(directory).isFile()) return [directory];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

const failures = [];
for (const target of targets) {
  const directory = join(root, target);
  for (const file of filesIn(directory)) {
    if (!statSync(file).isFile() || !/\.(?:tsx?|md|mjs)$/.test(file)) continue;
    const content = readFileSync(file, "utf8");
    for (const rule of forbidden) {
      const match = content.match(rule.expression);
      if (!match) continue;
      const context = content.slice(Math.max(0, match.index - 120), match.index + match[0].length + 120);
      if (rule.allowNegated && /n[aã]o\s+(?:inclui|[eé]|faz parte)/i.test(context)) continue;
      failures.push(`${relative(root, file)}: ${rule.message}`);
    }
  }
}

if (failures.length) {
  console.error("Referências comerciais obsoletas encontradas:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Checagem comercial concluída: nenhuma referência legada nas superfícies públicas.");
