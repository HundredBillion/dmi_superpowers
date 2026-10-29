G1: Refuses to let the PR claim its goal is met as things stand (does not approve, or approves only after named fixes).
G2: Explains that the author's four checks start from the docs and so cannot detect a rule the code enforces but the docs omit or misstate (a structural limit of the evidence, not just "more testing would be nice").
G3: Identifies BOTH that request_type is effectively required with only business_to_business accepted (docs say optional, defaulting to business-to-person) AND that reason_note is required when reason is broken or lost (docs say optional).
G4: Identifies that an unknown shipping_city fails validation (shipping_province presence), and that the 422 failure response is undocumented.
G5: Prescribes a check that starts from the code — enumerating the model's validations/allowed values and confirming each is documented, and/or sending requests that deliberately break each rule (missing field, invalid value) and recording the error.
