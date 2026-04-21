#!/usr/bin/env node
/**
 * Code Review Agent — Fan-out via Anthropic API
 *
 * Usage:
 *   node review.mjs <diff-file>
 *   git diff HEAD | node review.mjs
 *
 * Env vars:
 *   ANTHROPIC_API_KEY   — required
 *   REVIEW_CONTEXT      — optional, project standards from CLAUDE.md + memory
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS_SUBAGENT = 1024;
const MAX_TOKENS_SYNTHESIS = 2048;

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

function readDiff() {
  const filePath = process.argv[2];
  if (filePath) {
    try {
      return readFileSync(filePath, 'utf-8');
    } catch (err) {
      fatal(`Cannot read diff file "${filePath}": ${err.message}`);
    }
  }
  // Fallback: stdin
  try {
    return readFileSync('/dev/stdin', 'utf-8');
  } catch {
    fatal('No diff file provided and stdin is not available.');
  }
}

const projectContext = process.env.REVIEW_CONTEXT?.trim() || '';
const contextSection = projectContext
  ? `\n\n## Project-specific standards\n${projectContext}`
  : '';

// ---------------------------------------------------------------------------
// Subagent definitions
// ---------------------------------------------------------------------------

const SUBAGENTS = [
  {
    name: 'Architecture',
    emoji: '🏗️',
    systemPrompt: `You are a senior software architect reviewing a code diff.

Focus EXCLUSIVELY on: module structure, layer separation (e.g. view/service/model), dependency direction, coupling, cohesion, design patterns, and interface design.
Do NOT comment on security, performance, naming style, or test coverage.

Severity scale:
🔴 Critical — blocks merge (e.g. circular dependency, broken layer boundary)
🟡 Warning  — should fix before merge (e.g. unnecessary coupling, God class)
🟢 Good     — optional improvement or praise

Output: bullet list grouped by severity. Be specific: quote the file/function/line where relevant. Omit sections with no findings.${contextSection}`,
  },
  {
    name: 'Security',
    emoji: '🔒',
    systemPrompt: `You are a security engineer reviewing a code diff.

Focus EXCLUSIVELY on: input validation, SQL injection, XSS, command injection, authentication, authorization gaps, hardcoded secrets or tokens, insecure defaults, sensitive data exposure, CSRF, and dependency vulnerabilities.
Do NOT comment on architecture, performance, naming, or tests.

Severity scale:
🔴 Critical — blocks merge (e.g. SQL injection, hardcoded secret, missing auth check)
🟡 Warning  — should fix before merge (e.g. insufficient validation, missing rate limit)
🟢 Good     — optional hardening or praise

Output: bullet list grouped by severity. Quote the vulnerable pattern. Omit sections with no findings.${contextSection}`,
  },
  {
    name: 'Performance',
    emoji: '⚡',
    systemPrompt: `You are a performance engineer reviewing a code diff.

Focus EXCLUSIVELY on: N+1 database queries, missing DB indexes on filtered/joined columns, expensive computations inside loops, unnecessary re-renders or recomputations, memory leaks, blocking I/O, missing caching opportunities, and large payload sizes.
Do NOT comment on architecture, security, naming, or tests.

Severity scale:
🔴 Critical — blocks merge (e.g. N+1 in a hot path, O(n²) on unbounded input)
🟡 Warning  — should fix before merge (e.g. missing index on FK, full table scan)
🟢 Good     — optional optimisation or praise

Output: bullet list grouped by severity. Quote the problematic pattern. Omit sections with no findings.${contextSection}`,
  },
  {
    name: 'Code Quality',
    emoji: '✨',
    systemPrompt: `You are a senior developer reviewing a code diff for readability and maintainability.

Focus EXCLUSIVELY on: DRY violations, misleading or unclear names (variables, functions, classes), dead code, magic numbers/strings, excessive complexity (deep nesting, long functions), inconsistent style, and missing or wrong comments/docstrings.
Do NOT comment on architecture, security, performance, or test coverage.

Severity scale:
🔴 Critical — blocks merge (e.g. name that actively misleads, logic hidden in noise)
🟡 Warning  — should fix before merge (e.g. duplicated block, magic constant)
🟢 Good     — optional polish or praise

Output: bullet list grouped by severity. Quote the problematic code. Omit sections with no findings.${contextSection}`,
  },
  {
    name: 'Tests',
    emoji: '🧪',
    systemPrompt: `You are a QA engineer reviewing a code diff.

Focus EXCLUSIVELY on: test coverage of changed/new code paths, missing edge cases, test naming clarity, test isolation (side effects, shared state), quality of assertions, over-mocking vs under-mocking, and flaky test patterns.
Do NOT comment on architecture, security, performance, or naming in non-test code.

Severity scale:
🔴 Critical — blocks merge (e.g. new business logic with zero tests, test that never fails)
🟡 Warning  — should fix before merge (e.g. missing error path test, brittle assertion)
🟢 Good     — optional improvement or praise

Output: bullet list grouped by severity. Reference specific test file/function where relevant. Omit sections with no findings.${contextSection}`,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fatal(msg) {
  console.error(`\nERROR: ${msg}\n`);
  process.exit(1);
}

function log(msg) {
  process.stderr.write(`${msg}\n`);
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

async function callSubagent(client, agent, diff) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS_SUBAGENT,
    system: agent.systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            // Cache the diff so repeated runs (e.g. re-synthesis) are cheaper.
            // With Promise.all the first write populates the cache; subsequent
            // sequential calls (synthesis, retries) benefit from cache hits.
            cache_control: { type: 'ephemeral' },
            text: `Review the following diff and report findings in your area only.\n\n\`\`\`diff\n${diff}\n\`\`\``,
          },
        ],
      },
    ],
  });
  return {
    name: agent.name,
    emoji: agent.emoji,
    review: response.content[0].text,
  };
}

async function callSynthesis(client, results) {
  const reviewsBlock = results
    .map((r) => `### ${r.emoji} ${r.name}\n\n${r.review}`)
    .join('\n\n---\n\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS_SYNTHESIS,
    system: `You are a lead engineer synthesising code review findings from five specialist reviewers into a single, actionable report.

Your output must follow this structure exactly:

## Executive Summary
3–5 sentences. Overall quality signal, biggest risk, merge readiness.

## 🔴 Critical — must fix before merge
Deduplicated list from all reviewers. Each item: one sentence + area tag (e.g. [Security]).

## 🟡 Warnings — should fix before merge
Deduplicated list. Each item: one sentence + area tag.

## 🟢 Good practices
Deduplicated list of positives / optional improvements.

## Top 3 action items
Numbered list. Most impactful things to address first.

Rules:
- Deduplicate: if multiple reviewers flag the same issue, merge into one entry.
- Preserve severity from reviewers — do not downgrade a 🔴 to 🟡.
- If a section is empty, omit it entirely (do not write "None").
- Be direct. No filler phrases like "Great job overall" unless warranted.${contextSection}`,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            cache_control: { type: 'ephemeral' },
            text: `Synthesise these specialist reviews:\n\n${reviewsBlock}`,
          },
        ],
      },
    ],
  });

  return response.content[0].text;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    fatal('ANTHROPIC_API_KEY environment variable is not set.');
  }

  const diff = readDiff();
  if (!diff.trim()) {
    fatal('Diff is empty. Nothing to review.');
  }

  const client = new Anthropic();

  log('\n⏳ Running 5 specialist reviewers in parallel...\n');

  // Fan-out
  const results = await Promise.all(
    SUBAGENTS.map((agent) => {
      log(`  → ${agent.emoji} ${agent.name}`);
      return callSubagent(client, agent, diff);
    }),
  );

  log('\n⏳ Synthesising results...\n');
  const synthesis = await callSynthesis(client, results);

  // ---------------------------------------------------------------------------
  // Build final report
  // ---------------------------------------------------------------------------
  const separator = '\n\n---\n\n';
  const sections = results.map(
    (r) => `## ${r.emoji} ${r.name}\n\n${r.review}`,
  );

  const report = [
    '# Code Review Report',
    '',
    ...sections,
    '---',
    '',
    '## 📋 Synthesis',
    '',
    synthesis,
  ].join('\n');

  // Print to stdout so the orchestrator (Claude Code) can display it
  process.stdout.write(report + '\n');
}

main().catch((err) => {
  fatal(err.message);
});
