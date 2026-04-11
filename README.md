# claude-config

My global [Claude Code](https://claude.ai/code) configuration — rules, agents, skills, and memory.

Project-level `CLAUDE.md` files take precedence over this global config.

## Structure

```
.claude/
├── CLAUDE.md                  # Entry point — imports rules from rules/
├── rules/
│   ├── memory.md              # When and how to save/read persistent memory
│   ├── angular.md             # TypeScript/Angular coding standards
│   └── django.md              # Python/Django REST Framework standards
├── agents/
│   ├── angular-reviewer.md    # Reviews Angular/TypeScript code
│   ├── api-planner.md         # Plans new API endpoints (DRF + Angular)
│   ├── django-reviewer.md     # Reviews Django REST Framework code
│   └── test-writer.md         # Writes tests for DRF endpoints and Angular components
├── skills/                    # Slash-command skills (invoked via /skill-name)
│   ├── claude-api/            # Build/debug Claude API apps
│   ├── code-review/           # Full-stack code review (Angular + DRF)
│   ├── debug-tdd/             # TDD-based bug fixing
│   ├── design-an-interface/   # Parallel interface design exploration
│   ├── edit-article/          # Article editing and prose improvement
│   ├── git-guardrails-claude-code/ # Hook that blocks dangerous git commands
│   ├── grill-me/              # Stress-test a plan via Socratic interview
│   ├── improve-codebase-architecture/ # Architectural refactor opportunities
│   ├── learn/                 # Save a lesson to global memory
│   ├── notion-vault/          # Search and manage Notion pages
│   ├── prd-to-issues/         # Break a PRD into GitHub issues
│   ├── prd-to-plan/           # Turn a PRD into a phased implementation plan
│   ├── request-refactor-plan/ # Plan a refactor with tiny commits
│   ├── tdd/                   # Red-green-refactor TDD loop
│   ├── triage-issue/          # Triage a bug and file a GitHub issue
│   ├── write-a-prd/           # Write a PRD via user interview
│   └── write-a-skill/         # Create a new skill
└── memory/
    ├── MEMORY.md              # Index of all memory files (loaded every session)
    └── feedback_global.md     # Corrections and confirmed good practices
```

## Rules

### `rules/memory.md`
Defines when Claude automatically saves memories (corrections, confirmations, user context, project decisions) and how to structure memory files by type: `feedback`, `user`, `project`, `reference`.

### `rules/angular.md`
Standards for TypeScript/Angular development:
- Import order (Angular core → third-party → local)
- Standalone components only, `inject()` over constructor DI
- Signals API (`input()`, `output()`, `signal()`, `computed()`) for new components
- Angular 17+ control flow (`@if`, `@for`) in new templates
- No `any`, explicit return types, `interface` for data shapes

### `rules/django.md`
Standards for Python/Django REST Framework:
- Import order (stdlib → Django → DRF → third-party → local)
- Explicit field lists in serializers (no `fields = "__all__"`)
- Thin views — business logic in service classes or model methods
- Two-class exception pattern (domain exception + DRF `APIException`)
- `factory_boy` in tests, `force_login` for auth

## What's excluded

See `.gitignore`. Not tracked:
- `.credentials.json` — API key
- `settings.json` — local Claude Code settings (MCP servers, permissions, etc.)
- `history.jsonl`, `sessions/`, `projects/` — conversation data
- `backups/`, `cache/`, `debug/`, `file-history/` — generated files
- `plugins/` — marketplace data
