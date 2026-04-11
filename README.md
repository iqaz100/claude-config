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

