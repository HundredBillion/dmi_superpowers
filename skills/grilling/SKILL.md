---
name: grilling
description: Interview the user relentlessly about a plan or design. Use when the user wants to stress-test a plan before building, or uses any 'grill' trigger phrases.
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a question can be answered by exploring the codebase, explore the codebase instead.

When a question requires explaining a piece of code first, format that explanation with `dmi-superpowers:say` (code-findings mode, explanatory beats only): say in plain terms what the code does and what is happening, paired with the exact file/function, then ask your question. Do not wrap the question itself in the four-beat — the question is your "Your call".
