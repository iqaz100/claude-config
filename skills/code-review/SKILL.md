---
name: code-review
description: Full-stack code review for Angular + Django REST Framework projects. Orchestrates django-reviewer and angular-reviewer agents in parallel. Use when user wants to review code, check a PR, or audit changed files.
---

# Code Review

## Step 1 — Identify files to review

Determine scope in this order:

1. **User specified files/paths** — use those directly
2. **Current git diff** — run `git diff --name-only HEAD` to get changed files
3. **Staged changes** — run `git diff --name-only --cached` if nothing in (2)
4. **Fallback** — ask the user which files to review

Separate the file list into two buckets based on **extension AND path**:

- **Django bucket** — file matches any of:
  - extension `.py`
  - path contains a segment named `backend` (e.g. `backend/pubs/views.py`)

- **Angular bucket** — file matches any of:
  - extension `.ts`, `.html`, `.scss`, or `.css`
  - path contains a segment named `frontend` (e.g. `frontend/src/app/pubs/`)

A file can land in both buckets only if both conditions are somehow true (edge case — flag it to the user).
If a `.py` file is inside a `frontend/` path, trust the path over the extension and skip it (likely a script, not DRF code).

If neither bucket has files, tell the user and stop.

## Step 2 — Run specialist agents in parallel

Spawn agents based on which buckets are non-empty.
**If both buckets have files — spawn both agents simultaneously** (parallel tool calls).

### For Python files → `django-reviewer` agent
Pass:
- The list of `.py` file paths to review
- Instruction to read each file and apply DRF review standards

### For TypeScript/HTML files → `angular-reviewer` agent
Pass:
- The list of `.ts` and `.html` file paths to review
- Instruction to read each file and apply Angular review standards

## Step 3 — Synthesize results

Combine both agents' outputs into one report with this structure:

```
## Code Review

### Backend (Django)
[django-reviewer findings, or "No Python files reviewed"]

### Frontend (Angular)
[angular-reviewer findings, or "No TypeScript files reviewed"]

### Summary
- X blockers, Y major issues, Z minor issues
- [One sentence overall assessment]
```

Preserve each agent's severity grouping (BLOCKER → MAJOR → MINOR).
Do not duplicate issues that appear in both reports.
If both agents report clean code, say so clearly — don't pad the report.

## Notes

- If the file list is very large (>20 files), ask the user if they want to narrow scope first
- If a file doesn't exist or can't be read, note it and continue — don't abort the whole review
- Do not fix issues yourself unless the user explicitly asks — the review output is for the user to act on
