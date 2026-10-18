G1: PASS
Rejects fixture errors as RED, requires scheduler setup, and requires behavior-specific failure before fixes.

G2: FAIL
Requires exact bounded body capture without deadline advancement, but does not explicitly verify failure with the cap absent or disabled.

G3: FAIL
Requires manual time and coordinated delivery, but does not explicitly require bounded integration waits or account for non-atomic socket delivery.

G4: FAIL
Requires fixture and signal reuse, but does not account for recurring suite runtime cost.
