---
name: learn
description: Save a lesson, correction, or good practice to global memory so it applies in all future conversations. Use when the user says "remember that", "don't do X again", "always do Y", "learn from this", or explicitly wants to save a rule for future sessions.
---

# Learn — Save a Lesson to Global Memory

## What this does

Saves a rule or lesson to `C:\Users\piotr\.claude\memory\feedback_global.md` so it is available in all future conversations across all projects.

## Workflow

1. **Identify the lesson** from the user's message or current conversation context.
   - If the user corrected a mistake → save to "Things to AVOID"
   - If the user confirmed a good practice → save to "Things to DO"
   - If unclear, ask: "Should I add this to AVOID or DO?"

2. **Format the entry**:
   ```
   - [YYYY-MM-DD] Rule in one sentence. **Why:** reason from context. **How to apply:** when this rule kicks in.
   ```

3. **Read the current file**, then **append the entry** to the correct section in `feedback_global.md`.

4. **Confirm** to the user: "Saved to global memory: [brief summary of the rule]"

## Rules for saving

- Lead with the actionable rule, not the story.
- Include **Why** — it helps judge edge cases later.
- Include **How to apply** — makes the rule specific enough to act on.
- Do NOT save: code patterns derivable from the codebase, temporary task state, git history.
- DO save: behavioral corrections, stylistic preferences, workflow preferences, things Claude got wrong.

## Example

User: "Don't add trailing summaries at the end of responses, I can read the diff."

Saved entry:
```
- [2026-03-27] Do not summarize what was just done at the end of a response. **Why:** User finds it redundant — they can read the diff/output themselves. **How to apply:** After completing any task, stop without a closing summary paragraph.
```
