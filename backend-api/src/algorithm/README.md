# Algorithm (TypeScript) Conversion

This directory will contain the TypeScript port of the Python algorithm under `backend-api/proto/`.

Structure (proposed):
- draft.ts — entry points mirroring draft.py's public functions (pure, no I/O)
- models.ts — DraftState, Team, and lineup types
- scoring.ts — DAVAR scoring and replacement level logic
- survival.ts — ESPN hazard, survival probabilities, drain forecasts
- utils.ts — helpers for normalization, ranking, etc.

Tests will reuse the same scenarios from the Python test suite to guarantee behavioral parity.
