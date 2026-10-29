# Independent grades

One fresh grader per run, given only the GRADER_TEMPLATE, [checklist.md](checklist.md) and
that run's transcript under a neutral name (`run-NN`). The mapping to arms was frozen in
[blind-map.txt](blind-map.txt) (seeded shuffle, seed 20261029) before any grader ran, and
joined only after all ten grades were in. Grader text is reproduced verbatim.

| Run | Arm | G1 | G2 | G3 |
|-----|-----|----|----|----|
| run-01 | baseline-5 | P | P | F |
| run-02 | baseline-2 | P | P | P |
| run-03 | baseline-1 | P | P | F |
| run-04 | amended-2 | P | P | P |
| run-05 | amended-5 | P | P | P |
| run-06 | baseline-3 | P | P | F |
| run-07 | amended-1 | P | P | P |
| run-08 | baseline-4 | P | P | P |
| run-09 | amended-3 | P | P | P |
| run-10 | amended-4 | P | P | P |

## run-01 (baseline-5)

G1: PASS. Task 3 Step 4.2 takes required status from route segments, `params.require`, `validates … presence`, `belongs_to` without `optional: true`, `if:`/`unless:` conditions and explicit blank checks. "How I got here" says outright that `permit` does not say whether a parameter is required.

G2: PASS. Task 3 lists every `params` read, `render … status:`, `rescue_from` and the constraints from the code into the ledger. The checker then flags anything the code accepts or returns that the page leaves out ("code accepts parameter… table does not list it", "code can return HTTP X, but the page never mentions it"). Task 8 Step 3 confirms every `constraints` value and failure trigger appears in both languages.

G3: FAIL. Task 4 sends missing-required-field probes (`omit-<param>`), but no step sends an invalid value for a constrained field (bad enum value, over-max length). The only 422 example sends a blank name, which is just another omission. Only shapes of the error bodies are saved, not the bodies, and `bin/qa-api-docs` sends no requests.

## run-02 (baseline-2)

G1: PASS. Task 3 Step 3 works out required/optional from `params.require`, form `validates presence`, model validations, DB NOT NULL and `if:`/`unless:` conditions, and says `permit` alone is not enough. Step 4 refines types from form attributes and casts. Allowed values (enum/inclusion rules) are not named explicitly; this is the weakest part of the PASS.

G2: PASS. Task 3 lists every param, required rule, `render`/`head`/`raise` failure and inherited `rescue_from` from the code into the ledger. Task 5 then checks each code row against the pages and flags gaps as `undocumented_accepted` or `doc_missing_en`/`doc_missing_fr`.

G3: PASS. Task 6 Step 7 re-runs the Task 4 Step 2 failure curls, which include a missing required param and a wrong-type value. Each is saved to a transcript, and its status and key structure are compared with the recorded `live_value`; a mismatch reopens the endpoint.

## run-03 (baseline-1)

G1: PASS. Task 3's rules table takes required status from `params.require`, `fetch` with no default, form and model presence validations, `belongs_to` without `optional: true`, and conditional validations. Types come from form attributes and `db/schema.rb`. Neither plan derives allowed values from inclusion or enum checks, though.

G2: PASS. Tasks 3 and 4 list every parameter, status and failure path from the code, and the checker reports anything the code has that the page lacks ("accepted by the code but missing from the page", "the endpoint can return 422, but the page has no example response for it").

G3: FAIL. The invalid requests (missing required field, wrong type, bad token) are in the audit, Task 5, not the QA gate. The gate's only request step, Task 6 Step 5, replays the docs' own examples and compares status codes only, not bodies. The second plan in the file (after the `=====` line) has a gate, Task 8, that sends no requests at all.

The transcript file holds two separate plans split by a `=====` line. The verdicts are the same whichever one is graded.

## run-04 (amended-2)

G1: PASS. The Global Constraints and Task 4 Steps 3–4 say `permit` only lists what an endpoint accepts. "Required" comes from where a request is actually rejected: `params.require`, form and model validations, `belongs_to`, NOT NULL columns, `rescue_from`, and the whole call chain.

G2: PASS. `Checks.citations` scans every enforcement line in every cited file and reports any line that no rule or `not_applicable` entry cites. Statuses are checked in both directions, and orphan pages are reported.

G3: PASS. The gate re-runs every probe against staging (Task 6 Step 4). That includes the `omit` probes, which leave out a required field, and the `invalid` probes, which send a wrong-type value. Task 6 Step 5 then compares each staging status and JSON body shape with the prediction from reading the code and with the docs examples.

## run-05 (amended-5)

G1: PASS. Task 2 Step 4 works out required/optional from where it is enforced: `params.require`/`fetch`, form and model `validates`, `belongs_to`, `null: false` and `allow_nil`. Step 5 gets allowed values from `inclusion`/`enum` and says silent casts are not enforcement. It states that the permit list alone is not enough.

G2: PASS. Task 2 builds the ledger from the code itself (greps, a validation table, failure exits walked in order). Task 5 Step 10 has a fresh reviewer list every param, rule and failure exit from the code without the ledger, then confirm each one appears on the en and fr pages.

G3: PASS. Task 5 Step 6 runs `bin/probe-api-docs` against staging. Its probes include `omit` for each required param and `set: "not-a-real-value"` for each allowed-values list (Task 2 Step 8). It compares the status and top-level body keys with the ledger and records the summary line in the PR description.

## run-06 (baseline-3)

G1: PASS. Task 2 Step 3 works out required/optional, type and default from `params.require`, form and model validations (including `if:`/`unless:`), controller guards, casts and `db/schema.rb`. It says "never from permit" outright and also catches direct `params[:x]` reads.

G2: PASS. Task 2 starts from the code: it lists every param, validation, rescue_from handler and render/status path into endpoints.yml with evidence. The checker then flags each param "accepted by the code but missing from the table" and each status "returned by the code but never mentioned". Task 5 Step 2 adds a row for every failure in the YAML that the page doesn't describe.

G3: FAIL. The QA gate (Task 6 Step 5) only replays each page's example request plus "one documented failure example", and compares just the status and top-level keys. It never requires both a missing-required-field request and an invalid-value request, and it doesn't compare error bodies. The missing-<param> and invalid-<param> probes are only in the audit (Task 3), not the gate.

## run-07 (amended-1)

G1: PASS. The plan explicitly rejects reading only `params.permit`. It requires each parameter's `required` status and type to be backed by an `enforced_at` citation to the line that enforces it: `params.require`, form or model validations, `belongs_to`, `null: false` columns, `rescue_from` handlers or config (Global Constraints and Task 5's decision table).

G2: PASS. Task 4 Step 4 and Task 5 Step 2 are source-back checks: every enforcement line the grep finds in the code must be cited in the ledger or marked "not relevant" with a reason. Routes are also reconciled against the ledger in both directions, and documented parameters and statuses are compared with coded ones in both directions.

G3: PASS. In the QA gate, Task 7 Step 4 re-runs the staging probes. These include an "omit <required param>" probe that expects `missing_status`, plus "wrong type" invalid-value probes, unknown-parameter, bad-token and not-found probes. Each result records the expected and actual status and the response body, and the verdict compares both the status and the body keys. One caveat: a wrong-type probe is only built when the ledger entry defines `wrong_type`, and there is no explicit invalid enum-value probe.

## run-08 (baseline-4)

G1: PASS. Task 4 decides required/optional from `params.require`, presence and custom validations on forms and models, `NOT NULL` columns in `db/schema.rb`, and controller code that renders an error on nil. It says outright that `permit` gives no required/optional information, and takes types from casts and validations such as `numericality` and `inclusion`.

G2: PASS. Task 4 starts from the code and lists every parameter it reads, every `rescue_from`, every explicit error render and every validation error into the ledger. The gate then reports each code-side parameter and failure status or body that the en or fr page leaves out (`code.keys - doc.keys`). Allowed values for `inclusion` are only recorded as a type, not listed one by one.

G3: PASS. Task 5 sends a request with each required parameter left out and a wrong-type value ("abc") for each typed parameter. It also sends one with no token and one with an unknown id. It saves redacted transcripts and compares the status and top-level body keys with the ledger. These requests are in the staging step that feeds the gate, not in `bin/verify-api-docs` itself.

## run-09 (amended-3)

G1: PASS. The audit decides required/optional from where the code enforces it (params.require/fetch, guards, form and model validations, NOT NULL columns), and the manifest validator rejects a param marked required without that citation, saying "A permit list alone does not make a param required."

G2: PASS. Task 3 uses Rails reflection to list every validator, callback, constraint and rescue_from, then fails on any rule the audit has not reviewed. Task 2 does the same from the routes to the docs.

G3: PASS. The Task 5 probe sends an "omit <required param>" case and a "break <param> (rule)" case, plus no-token, bad-token, missing-id and other-customer cases. It records the status and body in probe-results.json and compares both against what the audit expects, and the gate (bin/check-api-docs) fails if any of these mismatch.

## run-10 (amended-4)

G1: PASS. Task 2 traces required/optional status and allowed values to where the code enforces them: params.require, form validations with on:/if:, model validations and belongs_to, schema null: false, before_action and rescue_from. It says outright that permit only lists which keys get through, and each param needs file:line evidence.

G2: PASS. Task 2 walks the code and turns every enforced rule, rescue_from mapping, allowed value and non-2xx path into a contract entry. The comparator then flags anything the code enforces that the page leaves out: "the code accepts X but the page doesn't list it", "can return 422 but the page never mentions it", "accepts 'active' but the page's description doesn't mention it".

G3: PASS. Task 4 sends missing:<param>, bad_type:<param> and bad_value:<param> requests to staging. It records the actual status and body fields in probe-results.json and compares them to the contract with judge. Task 5's gate fails on any mismatch. On endpoints that change data, these probes only run once a staging record is confirmed safe.
