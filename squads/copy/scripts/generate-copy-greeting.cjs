#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const { buildOutput } = require('./load-context.cjs');
const runtimePaths = require('./runtime-paths.cjs');

const ROOT = process.cwd();
const DEFAULT_CONFIG_PATH = path.join(ROOT, 'squads', 'copy', 'config.yaml');
const DEFAULT_AGENT_PATH = path.join(ROOT, 'squads', 'copy', 'agents', 'copy-chief.md');
const DEFAULT_SESSION_COMMAND = 'node squads/copy/scripts/set-active-context.cjs --business=aiox --product=<slug>';

function loadYamlFile(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8')) || {};
}

function loadAgentDefinition(agentPath) {
  const content = fs.readFileSync(agentPath, 'utf8');
  const match = content.match(/```ya?ml\n([\s\S]*?)\n```/);
  if (!match) {
    throw new Error(`No YAML block found in ${path.relative(ROOT, agentPath)}`);
  }
  return yaml.load(match[1]) || {};
}

function formatCommandList(commands, maxItems) {
  return (commands || []).slice(0, maxItems).map((item) => `- \`${item}\``).join('\n');
}

function formatPathList(paths, maxItems) {
  return (paths || []).slice(0, maxItems).map((item) => `  - \`${item}\``).join('\n');
}

function buildContextSection(context, settings) {
  if (settings.activation?.show_context_report === false) {
    return '';
  }

  const lines = [
    '## Active Product Context',
    '',
    `- Business: \`${context.business_slug}\``,
    `- Product: \`${context.product_slug}\``,
    `- Campaign: \`${context.campaign_slug || 'not_set'}\``,
    `- Operational brief status: \`${context.operational_brief?.status || context.readiness.status}\``,
    `- FINAL allowed: \`${context.operational_brief?.final_allowed ? 'yes' : 'no'}\``,
  ];

  if ((context.readiness.reasons || []).length > 0) {
    lines.push(`- Product readiness: ${(context.readiness.reasons || []).join(' | ')}`);
  }

  if ((context.operational_brief?.notes || []).length > 0) {
    lines.push(`- Operational notes: ${(context.operational_brief.notes || []).join(' | ')}`);
  }

  if (settings.activation?.show_preload_report !== false) {
    lines.push('');
    lines.push('## Preloaded References');
    lines.push('');
    lines.push(`- Session context: \`${context.session_context_path}\``);
    if (context.company_offerbook_index) {
      lines.push(`- Company offerbook index: \`${context.company_offerbook_index}\``);
    }
    if ((context.resolved_paths.shared_files || []).length > 0) {
      lines.push('- Shared files:');
      lines.push(formatPathList(context.resolved_paths.shared_files, settings.preload?.max_shared_files || 4));
    }
    if ((context.resolved_paths.company_narrative_files || []).length > 0) {
      lines.push('- Legacy company narrative artifacts:');
      lines.push(formatPathList(context.resolved_paths.company_narrative_files, settings.preload?.max_shared_files || 4));
    }
    if ((context.resolved_paths.product_files || []).length > 0) {
      lines.push('- Product files:');
      lines.push(formatPathList(context.resolved_paths.product_files, settings.preload?.max_product_files || 6));
    }
    if ((context.resolved_paths.product_narrative_files || []).length > 0) {
      lines.push('- Product narrative artifacts:');
      lines.push(formatPathList(context.resolved_paths.product_narrative_files, settings.preload?.max_product_files || 6));
    }
    if ((context.resolved_paths.campaign_files || []).length > 0) {
      lines.push('- Campaign files:');
      lines.push(formatPathList(context.resolved_paths.campaign_files, settings.preload?.max_product_files || 6));
    }
  }

  const blockers = [
    ...(context.readiness.missing_required || []).map((item) => ({
      id: item.id,
      path: item.path || 'missing',
    })),
    ...((context.campaign_context?.missing_required || []).map((item) => ({
      id: 'campaign_brief',
      path: item,
    }))),
  ];

  if (blockers.length > 0) {
    lines.push('');
    lines.push('## Blockers');
    lines.push('');
    lines.push(...blockers.map((item) => `- \`${item.id}\`: \`${item.path}\``));
  }

  return lines.join('\n');
}

function generateGreeting() {
  const config = loadYamlFile(DEFAULT_CONFIG_PATH);
  const agentDef = loadAgentDefinition(DEFAULT_AGENT_PATH);
  const settings = config.settings || {};
  const sessionPath = runtimePaths.getCopySessionContextPath();
  const context = fs.existsSync(sessionPath) ? buildOutput({ task: 'copy-chief', format: 'json' }) : null;

  const intro = context
    ? context.campaign_slug
      ? 'Copy Chief ativo. Contexto de produto e campanha carregado do runtime da sessao.'
      : 'Copy Chief ativo. Contexto de produto carregado do runtime da sessao.'
    : [
        'Copy Chief ativo. Nenhum contexto de produto foi inicializado nesta sessao.',
        '',
        '## Session Bootstrap',
        '',
        `- Inicialize com: \`${DEFAULT_SESSION_COMMAND}\``,
        '- Para trabalho estrategico ou FINAL, inclua `--campaign-slug=<slug>`.',
        '- Depois rode `*show-context` para conferir o preload canônico antes de escrever copy.',
        `- Runtime path: \`${runtimePaths.toWorkspaceRelative(sessionPath)}\``,
      ]
        .filter(Boolean)
        .join('\n');

  const parts = [
    intro,
    context ? buildContextSection(context, settings) : null,
    '## Starter Commands\n\n' + formatCommandList(agentDef.commands, settings.activation?.quick_commands_limit || 6),
  ];

  return `${parts.filter(Boolean).join('\n\n')}\n`;
}

function main() {
  process.stdout.write(generateGreeting());
}

if (require.main === module) {
  main();
}

module.exports = {
  generateGreeting,
};
