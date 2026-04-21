---
name: code-review-agent
description: Fan-out code review: generates a git diff between the current branch and a target branch named by the user, runs 5 specialist subagents (Architecture, Security, Performance, Code Quality, Tests) in parallel via Anthropic API, then a synthesis agent produces one prioritized Markdown report (🔴/🟡/🟢). Use when user says "przejrzyj diff", "zrób review PR", "zrób review do maina", "sprawdź zmiany względem <branch>", "porównaj z <branch>", or pastes/uploads a .diff / .patch file.
---

# Code Review Agent

Fan-out review via Anthropic API: 5 specialists run in parallel, synthesis agent combines results.

## Workflow

### Step 1 — Determine the diff

**Primary path — branch comparison (preferred):**
Extract the target branch from the user's message (e.g. "do maina" → `main`, "względem develop" → `develop`, "review PR do feature/xyz" → `feature/xyz`).
Then generate the diff with three-dot notation (compares current branch against the merge base, which is the correct PR diff):

```bash
git diff <target-branch>...HEAD
```

If the user does not specify a branch, ask: "Względem którego brancha zrobić review?"

**Fallback — explicit diff from user:**
If the user pastes raw diff text or uploads a `.diff` / `.patch` file, use that directly (skip the git command).

### Step 2 — Build project context

Read and concatenate into `$REVIEW_CONTEXT`:
- Active project `CLAUDE.md` (use Read tool on the nearest CLAUDE.md)  
- Relevant memory files from `~/.claude/memory/` (read `MEMORY.md` index, then load relevant entries)

This context is injected into every subagent's system prompt so language-specific standards are applied.

### Step 3 — Save diff to temp file

```bash
DIFF_FILE="/tmp/review_$(date +%s).patch"
# write diff content to $DIFF_FILE using Write tool
```

### Step 4 — Run the review script

```bash
REVIEW_CONTEXT="<context from Step 2>" \
  node ~/.claude/skills/code-review-agent/scripts/review.mjs "$DIFF_FILE"
```

The script prints progress to stderr and the final Markdown report to stdout.

### Step 5 — Present report

Output the script's stdout directly in chat as Markdown.

## Prerequisites

- `ANTHROPIC_API_KEY` set in environment
- Node.js ≥ 18
- `@anthropic-ai/sdk` package available:

```bash
npm install -g @anthropic-ai/sdk
# or locally in the project
npm install @anthropic-ai/sdk
```

## Subagents

| Agent | Focus area |
|-------|-----------|
| 🏗️ Architecture | Module structure, layer separation, design patterns, coupling |
| 🔒 Security | Auth, injections (SQL/XSS/cmd), secrets in code, data exposure |
| ⚡ Performance | N+1 queries, missing indexes, expensive loops, memory leaks |
| ✨ Code Quality | DRY, naming, dead code, magic numbers, complexity |
| 🧪 Tests | Coverage of changed code, edge cases, test quality, mocking |

## Output format

Each section uses `🔴 Critical / 🟡 Warning / 🟢 Good practice` markers.
Synthesis agent adds:
- Executive summary (3–5 sentences)
- Top 3 action items before merge

## Customising subagent prompts

Edit system prompts in `scripts/review.mjs` — each `SUBAGENTS` entry has a `systemPrompt` field.
The `{CONTEXT}` placeholder is replaced at runtime with CLAUDE.md + memory content.
