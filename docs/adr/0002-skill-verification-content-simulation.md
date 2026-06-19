# Skill changes are verified by content-simulation in-session; live triggering is verified post-reinstall

The runtime loads skills from the plugin cache
(`~/.claude/plugins/cache/dmi-marketplace/dmi-superpowers/<version>/skills/`), a copy of
this repo populated at install time, and a session loads skills only at startup. So edits
to `skills/` in the working tree are **not** invokable in the current session — not even by
dispatched subagents, which inherit the parent session's already-loaded skills.

We therefore verify skill work in two stages:

1. **In-session (now):** static checks (frontmatter, `grep` for inserted directives) plus
   *content-simulation* — paste the `SKILL.md` body into a subagent as its instructions and
   confirm it moves behaviour from the no-skill **RED** baseline to the desired **GREEN**
   output. This validates that the skill *content* changes behaviour, independent of plugin
   loading.
2. **Post-merge (manual):** reinstall/sync the plugin and start a fresh session to confirm
   real triggering — that `say` fires standalone and that `systematic-debugging` / `grilling`
   actually invoke it at their reporting moments.

We rejected a mid-TSP "sync + restart" step: a subagent still cannot pick up skills the
parent session loaded at startup, so it would not make live in-session tests pass anyway.
