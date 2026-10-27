---
name: writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
---

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

Setup notes (personal skills directory paths per runtime): see [reference.md](reference.md). Per-runtime tool docs with the exact path: [claude-code-tools.md](../using-superpowers/references/claude-code-tools.md), [codex-tools.md](../using-superpowers/references/codex-tools.md), [copilot-tools.md](../using-superpowers/references/copilot-tools.md), [gemini-tools.md](../using-superpowers/references/gemini-tools.md).

You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents comply), and refactor (close loopholes).

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

**REQUIRED BACKGROUND:** You MUST understand dmi-superpowers:test-driven-development before using this skill.

**The eval procedure lives in `docs/evals/README.md` (ADR-0006):** dispatch subagents against the current skill text to establish a baseline, make the change, re-run, and report both arms. `AGENTS.md` gates PRs on that evidence, so produce it there rather than inventing a method. That skill defines the fundamental RED-GREEN-REFACTOR cycle. This skill adapts TDD to documentation.

Official guidance pointer and "What is a Skill?": see [reference.md](reference.md).

## TDD Mapping for Skills

| TDD Concept | Skill Creation |
|-------------|----------------|
| **Test case** | Pressure scenario with subagent |
| **Production code** | Skill document (SKILL.md) |
| **Test fails (RED)** | Agent violates rule without skill (baseline) |
| **Test passes (GREEN)** | Agent complies with skill present |
| **Refactor** | Close loopholes while maintaining compliance |
| **Write test first** | Run baseline scenario BEFORE writing skill |
| **Watch it fail** | Document exact rationalizations agent uses |
| **Minimal code** | Write skill addressing those specific violations |
| **Watch it pass** | Verify agent now complies |
| **Refactor cycle** | Find new rationalizations → plug → re-verify |

The entire skill creation process follows RED-GREEN-REFACTOR.

When to create a skill, skill types, and directory structure: see [reference.md](reference.md).

## SKILL.md Structure

**Frontmatter (YAML):**
- Two required fields: `name` and `description` (see [agentskills.io/specification](https://agentskills.io/specification) for all supported fields)
- Max 1024 characters total
- `name`: Use letters, numbers, and hyphens only (no parentheses, special chars)
- `description`: Third-person, describes ONLY when to use (NOT what it does)
  - Start with "Use when..." to focus on triggering conditions
  - Include specific symptoms, situations, and contexts
  - **NEVER summarize the skill's process or workflow** (see SDO section for why)
  - Keep under 500 characters if possible

Full SKILL.md template: see [examples.md](examples.md).

## Skill Discovery Optimization (SDO)

**Critical for discovery:** Future agents need to FIND your skill

### 1. Rich Description Field

**Purpose:** Your agent reads the description to decide which skills to load for a given task. Make it answer: "Should I read this skill right now?"

**Format:** Start with "Use when..." to focus on triggering conditions

**CRITICAL: Description = When to Use, NOT What the Skill Does**

The description should ONLY describe triggering conditions. Do NOT summarize the skill's process or workflow in the description.

**Why this matters:** Testing revealed that when a description summarizes the skill's workflow, an agent may follow the description instead of reading the full skill content. A description saying "code review between tasks" caused an agent to do ONE review, even though the skill's flowchart clearly showed TWO reviews (spec compliance then code quality).

When the description was changed to just "Use when executing implementation plans with independent tasks" (no workflow summary), the agent correctly read the flowchart and followed the two-stage review process.

**The trap:** Descriptions that summarize workflow create a shortcut agents will take. The skill body becomes documentation agents skip.

```yaml
# ❌ BAD: Summarizes workflow - agents may follow this instead of reading skill
description: Use when executing plans - dispatches subagent per task with code review between tasks

# ❌ BAD: Too much process detail
description: Use for TDD - write test first, watch it fail, write minimal code, refactor

# ✅ GOOD: Just triggering conditions, no workflow summary
description: Use when executing implementation plans with independent tasks in the current session

# ✅ GOOD: Triggering conditions only
description: Use when implementing any feature or bugfix, before writing implementation code
```

**Content:**
- Use concrete triggers, symptoms, and situations that signal this skill applies
- Describe the *problem* (race conditions, inconsistent behavior) not *language-specific symptoms* (setTimeout, sleep)
- Keep triggers technology-agnostic unless the skill itself is technology-specific
- If skill is technology-specific, make that explicit in the trigger
- Write in third person (injected into system prompt)
- **NEVER summarize the skill's process or workflow**

More bad/good description examples: see [examples.md](examples.md).

Keyword coverage and descriptive naming guidance: see [reference.md](reference.md).

Token efficiency techniques and examples: see [examples.md](examples.md).

Cross-referencing other skills (guidance and why no `@` links): see [reference.md](reference.md).

## Flowchart Usage

Flowchart example: see [examples.md](examples.md).

**Use flowcharts ONLY for:**
- Non-obvious decision points
- Process loops where you might stop too early
- "When to use A vs B" decisions

**Never use flowcharts for:**
- Reference material → Tables, lists
- Code examples → Markdown blocks
- Linear instructions → Numbered lists
- Labels without semantic meaning (step1, helper2)

Graphviz style rules and flowchart rendering tool: see [examples.md](examples.md).

Code example guidance: see [examples.md](examples.md).

File organization patterns: see [reference.md](reference.md).

## The Iron Law (Same as TDD)

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

This applies to NEW skills AND EDITS to existing skills.

Write skill before testing? Delete it. Start over.
Edit skill without testing? Same violation.

**No exceptions:**
- Not for "simple additions"
- Not for "just adding a section"
- Not for "documentation updates"
- Don't keep untested changes as "reference"
- Don't "adapt" while running tests
- Delete means delete

**REQUIRED BACKGROUND:** The dmi-superpowers:test-driven-development skill explains why this matters. Same principles apply to documentation.

Testing approaches by skill type, common rationalizations for skipping testing, the prohibitions-vs-recipes discussion ("Match the Form to the Failure"), the full bulletproofing/rationalization catalog, the RED-GREEN-REFACTOR phase elaboration, and wording-test evidence for micro-testing: see [bulletproofing.md](bulletproofing.md). For the complete pressure-scenario methodology (writing pressure scenarios, pressure types, plugging holes systematically, meta-testing): see [testing-skills-with-subagents.md](testing-skills-with-subagents.md).

Anti-pattern examples (narrative examples, multi-language dilution, code-in-flowcharts, generic labels): see [examples.md](examples.md).

## STOP: Before Moving to Next Skill

**After writing ANY skill, you MUST STOP and complete the deployment process.**

**Do NOT:**
- Create multiple skills in batch without testing each
- Move to next skill before current one is verified
- Skip testing because "batching is more efficient"

**The deployment checklist below is MANDATORY for EACH skill.**

Deploying untested skills = deploying untested code. It's a violation of quality standards.

## Skill Creation Checklist (TDD Adapted)

Full RED/GREEN/REFACTOR/Quality-Checks checklist phases: see [bulletproofing.md](bulletproofing.md).

**Deployment:**
- [ ] Commit skill to git and push to your fork (if configured)
- [ ] Consider contributing back via PR (if broadly useful)

Discovery workflow and the bottom line: see [reference.md](reference.md).
