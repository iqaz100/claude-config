# Automatic Memory — Global Rules

## When to save memories automatically

Save a memory **without being asked** when:
- The user corrects a mistake ("nie, nie rób X", "to źle", "stop doing X")
- The user confirms a non-obvious good practice ("tak dokładnie", "perfect", "keep doing that")
- The user shares information about their role, goals, or preferences
- The user mentions ongoing project context, decisions, or deadlines
- The user references external resources (Jira project, Slack channel, dashboard URL)

Always save **immediately** when the user explicitly says:
- "zapamiętaj", "zapisz", "remember", "save this"
- "nie rób tego więcej", "zawsze rób X"

## Memory files location

`C:\Users\piotr\.claude\memory\`

Index file: `MEMORY.md` — always update when adding a new memory file.

## Memory types

| Type | File pattern | Use for |
|------|-------------|---------|
| `feedback` | `feedback_*.md` | Corrections and confirmed good practices |
| `user` | `user_*.md` | User's role, skills, preferences |
| `project` | `project_*.md` | Ongoing work, decisions, deadlines |
| `reference` | `reference_*.md` | External resources (Jira, Slack, dashboards) |

## Feedback file format

File: `feedback_global.md`

```
- [YYYY-MM-DD] Rule. **Why:** reason. **How to apply:** when this kicks in.
```

Corrections → "Things to AVOID" section.
Confirmed practices → "Things to DO" section.

## When to read memories

- At the start of every conversation when the task seems related to past work.
- Always when the user references something from a previous session.
- Always when the user says "pamiętasz?", "ostatnio mówiłem", "jak wcześniej".
