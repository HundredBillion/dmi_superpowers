G1: The audit derives required/optional status and allowed values from where they are enforced (validations in models/forms or other code in the call chain), not only from the `params.permit` list.
G2: Includes a pass that starts from the code: enumerate each rule/error/allowed-value the code enforces and confirm each is documented (not only "check each documented claim against the code").
G3: The QA gate sends deliberately invalid requests — at least a missing required field and an invalid value for a constrained field — and records/compares the error status and body.
