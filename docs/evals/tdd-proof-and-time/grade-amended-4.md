G1: PASS
Rejects setup exceptions as RED and requires intended failures against unfixed code before implementation.

G2: PASS
Requires exactly 8 KiB, withheld EOF, an unexpired deadline, and testing with cap handling absent.

G3: PASS
Uses virtual time and explicit stop-before-release ordering, with generous bounded real-socket waits.

G4: PASS
Reuses the existing upstream fixture and signal helpers, keeping routine coverage fast through virtual time.
