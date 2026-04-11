---
name: debug-tdd
description: Debug a reported bug using TDD — first writes a failing unit test that reproduces the bug, then fixes the bug until the test passes. Use when user reports a bug, says "fix this", "something is broken", or wants a test-first bug fix approach. Covers both Angular (Jasmine/Karma) and Django (unittest) stacks.
---

# Debug TDD

Fix bugs the right way: prove the bug exists with a test, then kill it.

## Workflow

### 1. Understand the bug

Ask the user ONE question if the description is vague:
> "What's the exact symptom — what do you see vs. what you expect?"

Then immediately start investigating. Ask questions if you need to.

### 2. Diagnose — find the root cause

Use Explore agent or Grep/Read to trace the code path:

- [ ] Locate the relevant code (service, component, view, model)
- [ ] Identify **why** it fails — not just where, but the root cause
- [ ] Check existing tests — what's already covered, what's missing
- [ ] Run `git log` on affected files to spot recent regressions

### 3. Write the failing test (RED)

Write ONE unit test that:
- Targets the **exact broken behavior** (not a broad test)
- Uses the **public interface** only — no mocking internals
- Has a name that reads like a spec: `"should return 404 when pub does not exist"`

**Run the test and confirm it fails.** If it passes, the test doesn't reproduce the bug — revise it.

#### Angular (Jest)
```typescript
it('should [describe expected behavior]', () => {
  // Arrange
  // Act
  // Assert — this must FAIL before the fix
});
```

Run: `ng test --include=path/to/file.spec.ts`

#### Django (pytest)
```python
def test_should_describe_expected_behavior(self):
    # Arrange
    # Act
    # Assert — this must FAIL before the fix
```

Run: `poetry run python ./src/manage.py test src.<app>.tests.<TestClass>.<method>`

### 4. Fix the bug (GREEN)

Make **the minimal change** to pass the test:

- [ ] Change only what's necessary — no opportunistic refactoring
- [ ] Do not modify the test to make it pass
- [ ] Run the test — it must now pass
- [ ] Run the full test suite to ensure no regressions

### 5. Done

Work is complete when:
- [ ] The new test passes (GREEN)
- [ ] All existing tests still pass
- [ ] No new tests were needed (one targeted test is enough)

Report: "Bug fixed. Test `[test name]` now passes."

## Rules

- **Never skip RED.** If you can't make the test fail first, you don't understand the bug.
- **One test per bug.** Don't add tests for adjacent behavior — that's scope creep.
- **Fix the root cause, not the symptom.** If the test passes but the real bug could still happen via another path, keep digging.
- **Don't modify the test to pass.** The test describes truth; the code must conform to it.
