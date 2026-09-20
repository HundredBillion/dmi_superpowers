---
name: migrating-safely
description: Use when replacing or removing a database shape, public API, event contract, dependency, service, or feature that active consumers must leave without downtime or data loss
---

# Migrating Safely

## Overview

Make every migration phase independently deployable, observable, and
reversible. Old and new binaries may run together during a rollout; preserve a
compatible state until evidence shows every consumer has moved.

**Coexistence invariant:** while any old or rollback-image producer can run,
every new database/API/event field is optional to consumers. Every new producer
continues emitting the old representation. State both directions separately for
the database, API, and events; no later task may tighten the new field yet. A
coexistence schema that lists the new field as required is invalid while an old
or rollback producer can omit it.

## Inventory Before Design

Do not infer migration scope from search hits alone. Build a census:

| Consumer | Reads | Writes | Contract | Owner | Current usage evidence |
| --- | --- | --- | --- | --- | --- |

Include application code, jobs, scripts, reports, database access, public API
clients, emitted and consumed events, caches, and operational tooling. Give
each consumer its own usage signal; an aggregate counter cannot prove that a
quiet consumer has migrated.

## Phase Sequence

Use separate tasks and deploys for phases whose rollback or compatibility
conditions differ:

1. **Measure:** establish per-consumer baselines and reconciliation queries.
2. **Expand:** add the new shape or interface without removing the old one.
   Old and new binaries must both work against this state. Record a compatibility
   matrix for old, new, and rollback-image producers and consumers across the
   database, API, and event formats. Deploy acceptance for a new field before
   any producer can emit it; prove the rollback image tolerates traffic and data
   created after expansion. During coexistence, consumers treat the new field
   as optional and producers retain the old field. A schema must not require the
   new field until every old producer is retired.
3. **Bridge writes:** dual-write or translate at one controlled boundary.
   Define authority, retry/idempotency behavior, and divergence detection.
4. **Backfill:** migrate historical data in bounded, restartable batches.
   Checkpoint progress, throttle load, and reconcile source and destination.
5. **Switch reads:** move consumers incrementally while the write bridge remains.
   Compare behavior and retain a fast rollback path.
6. **Stop old writes:** disable the old write path in its own phase, while the
   old shape still exists. Completion means no database write, API response, or
   event emission produces the legacy field, including dual-field output.
   Observe this state in a separate deploy before contract.
7. **Contract:** remove the old database shape, API, event, flags, compatibility
   code, and documentation only after the zero-use gate passes.

One task may not combine two numbered phases. In particular, bridging writes
does not switch reads, and reads do not switch until the historical backfill has
reconciled successfully.

If a system has no historical data, write bridge, or external consumers, mark
that phase `Not applicable` with evidence rather than silently omitting it.

## Required Gate for Every Phase

Record these fields in the plan:

- **Prerequisites:** verified prior phases and compatibility assumptions
- **Success evidence:** exact commands, metrics, queries, or contract tests
- **Abort threshold:** the measured condition that stops rollout
- **Rollback action:** how to return traffic or reads without destroying data
- **Bake period:** how long the evidence must remain healthy

Rollback usually means reverting application behavior while retaining additive
schema or data. Do not make rollback delete newly collected data.

## Destructive-Step Gate

Contract is a separate, final change. Before it begins, require observed zero
usage for every inventoried surface during the agreed bake period:

- no old database reads or writes;
- no calls to the old API contract;
- no production or consumption of the old event shape;
- no remaining owned or external consumers without a migration decision.

Search results and passing tests support this gate but do not replace production
usage evidence. If telemetry cannot distinguish consumers, add that telemetry
before migration.

Zero use means zero access to or emission of the legacy field, including
dual-field traffic. Counting only traffic that contains the old field without
the new one is insufficient.

## Backfill Safety

A backfill must be idempotent and resumable from a durable checkpoint. Use a
dedicated migration ledger keyed by batch range with status, attempts, and last
update; do not infer progress only from partially written destination rows.
Specify batch key/order, batch size, throttling signal, retry policy, lock
strategy, reconciliation query, and completion criterion. Expose completed,
pending, retrying, failed, and divergent row/range counts plus checkpoint lag.
Commit progress only after the batch mutation and post-write reconciliation
succeed. Record failed attempts in durable state that survives rollback of the
data mutation. Test a failed batch, retry, stopped run, and resumed run; prove
that progress neither skips work nor advances on rollback. A high-water mark advances only across a
contiguous completed range. If locking or concurrency can skip rows, keep
skipped ranges in a durable pending set and requeue them; completion requires
that set to be empty.
Reconciliation detects omissions but is not a substitute for making them
eligible again. Do not put an unbounded table update on the request path or in
the schema deploy.

Before the first production batch, the plan must name the ledger schema, batch
key, a concrete initial batch size, throttle signal **and threshold**, retry
policy, and all progress
metrics above. “Choose during rollout” or “add after the first batch” does not
pass this gate.

## Completion Report

Report the current phase, evidence actually observed, remaining consumers,
rollback state, and next gated phase. Never describe a migration as complete
because code for later phases exists or because proposed checks are expected to
pass.

## Common Mistakes

- Combining read switch, old-write shutdown, and deletion in one deploy
- Measuring aggregate traffic instead of each consumer
- Treating database zero-use as proof that API and event consumers are gone
- Backfilling without restart checkpoints or reconciliation
- Making a destructive `down` migration the rollback plan
- Dropping compatibility code before the bake period finishes
